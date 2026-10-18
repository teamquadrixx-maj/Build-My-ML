import io
import json
import os
import sys
import uuid
import zipfile
from pathlib import Path
from typing import Any, Dict, List

import uvicorn
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response, StreamingResponse
from sqlalchemy.orm import Session

PROJECT_ROOT = Path(__file__).resolve().parents[1]
BACKEND_ROOT = Path(__file__).resolve().parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from ai.agents.blueprint.blueprint_agent import BlueprintAgent
from ai.agents.clarification.clarification_agent import ClarificationAgent
from ai.agents.requirement.requirement_agent import RequirementAgent
from ai.llm.providers.gemini_provider import GeminiProvider
from ai.rag.retrieval.retriever import DocumentRetriever
from app.database import Base, engine, get_db
from app.dependencies import get_current_user
from app.models import User
from app.routes import projects
from app.schemas import (
    BlueprintRequest,
    BlueprintResponse,
    SessionAnswerRequest,
    SessionStartRequest,
    SessionStartResponse,
)

app = FastAPI(title="BuildMyML API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def load_backend_env() -> None:
    env_path = Path(__file__).resolve().parent / ".env"
    if env_path.exists():
        load_dotenv(env_path)


def validate_required_environment() -> None:
    load_backend_env()
    missing = []
    if not (os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")):
        missing.append("GEMINI_API_KEY")
    if not os.getenv("SUPABASE_URL"):
        missing.append("SUPABASE_URL")
    if not os.getenv("SUPABASE_KEY"):
        missing.append("SUPABASE_KEY")
    if missing:
        raise RuntimeError(
            "Missing required environment variables for BuildMyML startup: "
            + ", ".join(missing)
            + ". Add them to backend/.env or set them in the shell before starting the service."
        )


SESSION_STORE: Dict[str, Dict[str, Any]] = {}
BLUEPRINT_STORE: Dict[str, Dict[str, Any]] = {}


def _dataset_candidates_for_idea(idea: str) -> List[Dict[str, Any]]:
    text = (idea or "").lower()
    if any(token in text for token in ["fraud", "transaction", "bank", "card", "payment", "suspicious"]):
        return [
            {
                "name": "Credit Card Fraud Detection",
                "source_url": "https://www.kaggle.com/mlg-ulb/creditcardfraud",
                "reason": "This public credit-card transaction dataset is a standard benchmark for fraud-classification and anomaly-detection work in financial settings.",
                "verified": False,
            },
            {
                "name": "PaySim Synthetic Financial Transactions",
                "source_url": "https://www.kaggle.com/datasets/ealaxi/paysim1",
                "reason": "Synthetic transaction data is useful for modeling suspicious transaction patterns, risk scoring, and fraud alert rules without exposing real customer data.",
                "verified": False,
            },
        ]
    return [
        {
            "name": "Public benchmark dataset",
            "source_url": "https://archive.ics.uci.edu/",
            "reason": "A public benchmark repository is a practical starting point when the organization needs a verified open dataset while the final production dataset is being defined.",
            "verified": False,
        }
    ]


def _result_payload_for_stage(name: str, status: str, explanation: str, data: Any = None) -> Dict[str, Any]:
    return {
        "name": name,
        "status": status,
        "explanation": explanation,
        "data": data if data is not None else {},
    }


def _build_markdown_document(record: Dict[str, Any]) -> str:
    blueprint = record.get("blueprint") or {}
    stage_outputs = record.get("stage_outputs") or []
    lines = [
        "# BuildMyML Blueprint Export",
        "",
        f"- Status: {record.get('status', 'unknown')}",
        f"- Blueprint ID: {record.get('id')}",
        f"- Message: {record.get('message', '')}",
        "",
        "## Problem statement",
        blueprint.get("problem_statement") or "No problem statement was produced.",
        "",
        "## ML task",
        blueprint.get("ml_task") or "unknown",
        "",
        "## Datasets",
    ]
    datasets = blueprint.get("datasets") or []
    if not datasets:
        lines.append("No datasets were produced.")
    else:
        for dataset in datasets:
            lines.append(f"- {dataset.get('name', 'Dataset')}: {dataset.get('source_url', 'No source URL provided')}")
            lines.append(f"  - Reason: {dataset.get('reason', 'No reason provided')}")
            lines.append(f"  - Verified: {'yes' if dataset.get('verified') else 'no'}")
    lines.extend(["", "## Stage outputs"])
    for stage in stage_outputs:
        lines.append(f"### {stage.get('name', 'stage')}")
        lines.append(f"- Status: {stage.get('status', 'unknown')}")
        lines.append(f"- Explanation: {stage.get('explanation', '')}")
        data_section = stage.get("data") or {}
        if isinstance(data_section, dict):
            if data_section:
                lines.append("- Data:")
                for key, value in data_section.items():
                    lines.append(f"  - {key}: {json.dumps(value, ensure_ascii=False)[:200]}")
        else:
            lines.append(f"- Data: {json.dumps(data_section, ensure_ascii=False)[:200]}")
        lines.append("")
    return "\n".join(lines)


def _make_blueprint_template(idea: str, requirement_result: Dict[str, Any] | None = None) -> Dict[str, Any]:
    requirement_summary = requirement_result or {}
    requirements = (requirement_result or {}).get("requirements") or {}
    return {
        "title": "BuildMyML blueprint",
        "problem_statement": (requirements.get("target_outcome") or "The project aims to turn the described business idea into an ML plan and decision workflow.") if requirement_summary else "The project aims to turn the described business idea into an ML plan and decision workflow.",
        "ml_task": (requirement_result or {}).get("task") or "other",
        "datasets": _dataset_candidates_for_idea(idea),
        "dataset_requirements": "The selected dataset should match the target decision, include the relevant records and features, and allow for a realistic evaluation setup.",
        "preprocessing": [
            "Review missing values, duplicates, and inconsistent records before model fitting.",
            "Encode or normalize features in line with the chosen model family.",
            "Check for leakage across the train, validation, and test boundaries.",
        ],
        "feature_engineering": [
            "Create transaction or behavior features that reflect the risk drivers in the problem domain.",
            "Engineer time-based or aggregate features only when they are supported by the available data.",
            "Validate that engineered signals do not leak target information from the future.",
        ],
        "candidate_algorithms": [
            {"name": "Logistic regression baseline", "reason": "A baseline model is useful for establishing a simple decision boundary and for comparing more complex fraud detection approaches."},
            {"name": "Gradient boosting", "reason": "Tree-based models are well suited to tabular financial data with nonlinear interactions and strong feature signal."},
            {"name": "Anomaly detection model", "reason": "A fraud workflow often benefits from anomaly scoring as a supporting way to detect rare suspicious transactions."},
        ],
        "evaluation_metrics": ["precision", "recall", "F1", "AUC-ROC"],
        "training_pipeline": "Define the target outcome, clean and validate the data, compare a few candidate models, tune the strongest option, and measure performance on a held-out set before deployment.",
        "deployment_considerations": "Operational monitoring, alert thresholds, and drift review should be built into deployment because fraudulent behavior changes over time.",
        "note": "This blueprint is based on the available requirement and context and may be incomplete if the live retrieval or Gemini stages are not available.",
        "status": "partial",
    }


def _generate_blueprint_record(idea: str, requirement_result: Dict[str, Any] | None = None, context_chunks: List[Dict[str, Any]] | None = None, gemini_blueprint: Dict[str, Any] | None = None) -> Dict[str, Any]:
    base = _make_blueprint_template(idea, requirement_result)
    if gemini_blueprint and isinstance(gemini_blueprint, dict):
        base.update(gemini_blueprint)
    if not isinstance(base.get("datasets"), list) or not base["datasets"]:
        base["datasets"] = _dataset_candidates_for_idea(idea)
    for idx, dataset in enumerate(base["datasets"]):
        dataset.setdefault("name", f"Dataset {idx + 1}")
        dataset.setdefault("source_url", "")
        dataset.setdefault("reason", "The dataset is a candidate starting point for the project and should be reviewed before use.")
        dataset["verified"] = bool(dataset.get("source_url")) and bool(dataset.get("verified"))
        if not dataset.get("source_url"):
            raise ValueError("Each dataset requires a source URL.")
    return base


def _run_blueprint_pipeline(idea: str, session_id: str | None = None) -> Dict[str, Any]:
    blueprint_id = uuid.uuid4().hex
    stage_outputs: List[Dict[str, Any]] = []
    stage_statuses: Dict[str, str] = {}
    blueprint_summary: Dict[str, Any] = _make_blueprint_template(idea)
    failed_stage = None
    overall_error = None

    try:
        requirement_agent = RequirementAgent()
        requirement_result = requirement_agent.run(idea)
        blueprint_summary = _make_blueprint_template(idea, requirement_result)
        stage_statuses["requirement_analysis"] = "completed"
        stage_outputs.append(
            _result_payload_for_stage(
                "requirement_analysis",
                "completed",
                "The requirement brief was generated from the idea and structured into a clear ML goal, task, and business context.",
                {"requirements": requirement_result},
            )
        )
    except Exception as exc:
        failed_stage = "requirement_analysis"
        overall_error = f"Requirement analysis failed: {exc}"
        stage_statuses["requirement_analysis"] = "failed"
        stage_outputs.append(
            _result_payload_for_stage(
                "requirement_analysis",
                "failed",
                f"Requirement analysis failed because the model could not turn the idea into a structured brief: {exc}",
                {"error": str(exc)},
            )
        )
        requirement_result = {}
        blueprint_summary = _make_blueprint_template(idea)

    clarification_status = "completed"
    clarification_data = {"missing_information": [], "clarification_questions": []}
    if requirement_result.get("status") == "needs_clarification":
        clarification_status = "skipped"
        clarification_data = {
            "status": "needs_clarification",
            "missing_information": requirement_result.get("missing_information", []),
            "clarification_questions": requirement_result.get("clarification_questions", []),
        }
    stage_statuses["clarification"] = clarification_status
    stage_outputs.append(
        _result_payload_for_stage(
            "clarification",
            clarification_status,
            "The brief was checked for missing details before retrieval; no extra clarification was needed for this request." if clarification_status == "completed" else "The requirement brief needs more detail before generation can continue, so the clarification step was skipped and the request is paused.",
            clarification_data,
        )
    )

    context_chunks: List[Dict[str, Any]] = []
    try:
        retriever = DocumentRetriever()
        context_chunks = retriever.retrieve(idea, top_k=5)
        if not context_chunks:
            raise RuntimeError("RAG retrieval returned no matching context from the document_chunks table.")
        stage_statuses["rag_retrieval"] = "completed"
        stage_outputs.append(
            _result_payload_for_stage(
                "rag_retrieval",
                "completed",
                "Relevant knowledge chunks were retrieved from the curated BuildMyML corpus to ground the next recommendation step.",
                {"matches": context_chunks},
            )
        )
    except Exception as exc:
        failed_stage = failed_stage or "rag_retrieval"
        overall_error = overall_error or f"RAG retrieval failed: {exc}"
        stage_statuses["rag_retrieval"] = "failed"
        stage_outputs.append(
            _result_payload_for_stage(
                "rag_retrieval",
                "failed",
                f"RAG retrieval failed because the document_chunks table or the retrieval query was unavailable: {exc}",
                {"error": str(exc), "matches": []},
            )
        )

    blueprint = None
    if stage_statuses.get("rag_retrieval") == "completed":
        try:
            llm = GeminiProvider()
            blueprint_agent = BlueprintAgent(llm=llm)
            blueprint = blueprint_agent.run(requirement_result, context_chunks)
            blueprint = _generate_blueprint_record(idea, requirement_result, context_chunks, blueprint)
            stage_statuses["gemini_recommendation"] = "completed"
            stage_statuses["blueprint_generation"] = "completed"
            stage_outputs.append(
                _result_payload_for_stage(
                    "gemini_recommendation",
                    "completed",
                    "The Gemini recommendation step used the requirement brief and retrieved context to draft a model and workflow recommendation.",
                    {"recommendation": blueprint},
                )
            )
            stage_outputs.append(
                _result_payload_for_stage(
                    "blueprint_generation",
                    "completed",
                    "The recommendation was assembled into a structured blueprint with task guidance, datasets, evaluation, and deployment considerations.",
                    {"blueprint": blueprint},
                )
            )
        except Exception as exc:
            failed_stage = failed_stage or "gemini_recommendation"
            overall_error = overall_error or f"Gemini recommendation failed: {exc}"
            stage_statuses["gemini_recommendation"] = "failed"
            stage_statuses["blueprint_generation"] = "failed"
            stage_outputs.append(
                _result_payload_for_stage(
                    "gemini_recommendation",
                    "failed",
                    f"The recommendation step failed while drafting the blueprint: {exc}",
                    {"error": str(exc)},
                )
            )
            stage_outputs.append(
                _result_payload_for_stage(
                    "blueprint_generation",
                    "failed",
                    f"The blueprint step could not be completed because the recommendation stage failed: {exc}",
                    {"error": str(exc)},
                )
            )
    else:
        stage_statuses["gemini_recommendation"] = "skipped"
        stage_statuses["blueprint_generation"] = "skipped"
        stage_outputs.append(
            _result_payload_for_stage(
                "gemini_recommendation",
                "skipped",
                "The Gemini recommendation stage was skipped because the retrieval stage did not produce usable context.",
                {"reason": overall_error or "No retrieved context was available."},
            )
        )
        stage_outputs.append(
            _result_payload_for_stage(
                "blueprint_generation",
                "skipped",
                "Blueprint assembly was skipped because the recommendation stage could not run with valid context.",
                {"reason": overall_error or "No recommendation was available."},
            )
        )

    critic_output = _result_payload_for_stage(
        "critic_check",
        "skipped",
        "The critic stage is planned and intentionally skipped in this pass; no automated review revision was executed.",
        {"reason": "Critic review is planned, not active in this build."},
    )
    stage_statuses["critic_check"] = "skipped"
    stage_outputs.append(critic_output)

    if blueprint is None:
        blueprint = _make_blueprint_template(idea, requirement_result)
        blueprint["datasets"] = _dataset_candidates_for_idea(idea)
        blueprint["status"] = "failed"
        blueprint["note"] = "This blueprint is partial because the pipeline stopped before a recommendation could be generated."
        blueprint["source"] = "backend"

    result = {
        "id": blueprint_id,
        "status": "completed" if stage_statuses.get("blueprint_generation") == "completed" else "failed",
        "message": "Blueprint generated successfully." if stage_statuses.get("blueprint_generation") == "completed" else (overall_error or "The blueprint pipeline stopped before generation was complete."),
        "failed_stage": failed_stage,
        "error": overall_error,
        "blueprint": blueprint,
        "stage_outputs": stage_outputs,
        "stage_statuses": stage_statuses,
        "critic_status": "planned",
    }
    BLUEPRINT_STORE[blueprint_id] = result
    return result


@app.on_event("startup")
def startup_event() -> None:
    validate_required_environment()


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "Welcome to BuildMyML API"}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/sessions", response_model=SessionStartResponse)
def start_session(payload: SessionStartRequest) -> dict[str, Any]:
    requirement_agent = RequirementAgent()
    requirement_result = requirement_agent.run(payload.idea)

    session_id = uuid.uuid4().hex
    clarification_questions = [
        {"id": q["id"], "question": q["question"]}
        for q in requirement_result.get("clarification_questions", [])
    ]

    session_state = {
        "session_id": session_id,
        "status": requirement_result.get("status", "ready"),
        "idea": payload.idea,
        "requirements": requirement_result,
        "clarification_questions": clarification_questions,
        "blueprint_id": None,
        "critic_status": "planned",
        "error": None,
    }
    SESSION_STORE[session_id] = session_state
    return session_state


@app.post("/api/sessions/{session_id}/clarify", response_model=SessionStartResponse)
def answer_clarification(session_id: str, payload: SessionAnswerRequest) -> dict[str, Any]:
    session = SESSION_STORE.get(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    answer_map = {payload.question_id: payload.answer}
    session.setdefault("answers", {})
    session["answers"].update(answer_map)

    clarification_agent = ClarificationAgent()
    clarified_result = clarification_agent.run(session["requirements"], session["answers"])
    session["requirements"] = clarified_result.get("requirements", session["requirements"])
    session["status"] = clarified_result.get("status", "ready")
    session["clarification_questions"] = [
        {"id": q["id"], "question": q["question"]}
        for q in clarified_result.get("clarification_questions", [])
    ]
    return session


@app.post("/blueprints")
def create_blueprint_route(payload: dict[str, Any]) -> dict[str, Any]:
    idea = (payload.get("idea") or payload.get("message") or "").strip()
    if not idea:
        raise HTTPException(status_code=400, detail="The 'idea' field is required.")
    return _run_blueprint_pipeline(idea, payload.get("session_id"))


@app.post("/api/blueprints", response_model=BlueprintResponse)
def request_blueprint(payload: BlueprintRequest) -> dict[str, Any]:
    session = SESSION_STORE.get(payload.session_id)
    if session is not None:
        session["status"] = "running"

    result = _run_blueprint_pipeline(payload.idea, payload.session_id)
    if session is not None:
        session["status"] = result.get("status", "ready")
        session["blueprint_id"] = result.get("id")
        session["blueprint"] = result.get("blueprint")
        session["error"] = result.get("error")

    return {
        "status": result.get("status", "failed"),
        "blueprint_id": result.get("id"),
        "blueprint": result.get("blueprint"),
        "message": result.get("message"),
        "critic_status": result.get("critic_status", "planned"),
        "failed_stage": result.get("failed_stage"),
        "error": result.get("error"),
        "stage_statuses": result.get("stage_statuses", {}),
        "stage_outputs": result.get("stage_outputs", []),
    }


@app.get("/api/blueprints/{blueprint_id}", response_model=BlueprintResponse)
def fetch_blueprint(blueprint_id: str) -> dict[str, Any]:
    record = BLUEPRINT_STORE.get(blueprint_id)
    if record is not None:
        return {
            "status": record.get("status", "failed"),
            "blueprint_id": blueprint_id,
            "blueprint": record.get("blueprint"),
            "message": record.get("message"),
            "critic_status": record.get("critic_status", "planned"),
            "failed_stage": record.get("failed_stage"),
            "error": record.get("error"),
            "stage_statuses": record.get("stage_statuses", {}),
            "stage_outputs": record.get("stage_outputs", []),
        }
    raise HTTPException(status_code=404, detail="Blueprint not found")


@app.get("/blueprints/{blueprint_id}/export")
def export_blueprint(blueprint_id: str, format: str = Query(default="json", regex="json|md|zip")) -> Response:
    record = BLUEPRINT_STORE.get(blueprint_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Blueprint not found")

    export_data = {
        "id": blueprint_id,
        "status": record.get("status", "failed"),
        "message": record.get("message"),
        "failed_stage": record.get("failed_stage"),
        "error": record.get("error"),
        "critic_status": record.get("critic_status", "planned"),
        "blueprint": record.get("blueprint"),
        "stage_outputs": record.get("stage_outputs", []),
    }

    markdown_text = _build_markdown_document(export_data)
    stage_log = "\n".join(
        [
            f"{stage.get('name', 'stage')}: {stage.get('status', 'unknown')} - {stage.get('explanation', '')}"
            for stage in export_data["stage_outputs"]
        ]
    )

    if format == "json":
        return JSONResponse(content=export_data)

    if format == "md":
        return Response(content=markdown_text, media_type="text/markdown", headers={"Content-Disposition": f'attachment; filename="{blueprint_id}.md"'})

    if format == "zip":
        payload = io.BytesIO()
        with zipfile.ZipFile(payload, "w", compression=zipfile.ZIP_DEFLATED) as archive:
            archive.writestr(f"{blueprint_id}.json", json.dumps(export_data, indent=2, ensure_ascii=False))
            archive.writestr(f"{blueprint_id}.md", markdown_text)
            archive.writestr(f"{blueprint_id}-stage-log.txt", stage_log)
        payload.seek(0)
        return StreamingResponse(
            payload,
            media_type="application/zip",
            headers={"Content-Disposition": f'attachment; filename="{blueprint_id}.zip"'},
        )

    raise HTTPException(status_code=400, detail="Unsupported export format")


@app.post("/chat")
def legacy_chat(payload: dict[str, str]) -> dict[str, Any]:
    idea = payload.get("message") or payload.get("idea") or ""
    if not idea:
        raise HTTPException(status_code=400, detail="A message is required.")
    return start_session(SessionStartRequest(idea=idea))


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
