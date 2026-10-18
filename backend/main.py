import os
import uuid
from typing import Any, Dict

import uvicorn
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

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


def validate_required_environment() -> None:
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

Base.metadata.create_all(bind=engine)
app = FastAPI(title="BuildMyML Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router)


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


@app.post("/api/blueprints", response_model=BlueprintResponse)
def request_blueprint(payload: BlueprintRequest) -> dict[str, Any]:
    session = SESSION_STORE.get(payload.session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.get("status") == "clarification_required":
        return {
            "status": "partial",
            "message": "The workflow is waiting for clarification before fetching RAG context and creating the blueprint.",
            "critic_status": "planned",
        }

    try:
        retriever = DocumentRetriever()
        context_chunks = retriever.retrieve(payload.idea, top_k=5)
    except Exception as exc:  # pragma: no cover - runtime contract is verified in live failure paths
        return {
            "status": "partial",
            "message": f"RAG retrieval did not complete: {exc}",
            "critic_status": "planned",
        }

    try:
        llm = GeminiProvider()
    except RuntimeError as exc:
        return JSONResponse(
            status_code=503,
            content={
                "status": "error",
                "message": str(exc),
                "critic_status": "planned",
            },
        )

    try:
        blueprint_agent = BlueprintAgent(llm=llm)
        blueprint = blueprint_agent.run(session["requirements"], context_chunks)
    except Exception as exc:  # pragma: no cover - runtime contract is verified in live failure paths
        return JSONResponse(
            status_code=502,
            content={
                "status": "error",
                "message": f"Gemini blueprint generation failed: {exc}",
                "critic_status": "planned",
            },
        )

    blueprint_id = uuid.uuid4().hex
    session["blueprint_id"] = blueprint_id
    session["status"] = "ready"
    result = {
        "status": "ready",
        "blueprint_id": blueprint_id,
        "blueprint": blueprint,
        "message": "Blueprint generated from the requirement, RAG context, and Gemini recommendation step.",
        "critic_status": "planned",
    }
    return result


@app.get("/api/blueprints/{blueprint_id}", response_model=BlueprintResponse)
def fetch_blueprint(blueprint_id: str) -> dict[str, Any]:
    for session in SESSION_STORE.values():
        if session.get("blueprint_id") == blueprint_id:
            return {
                "status": "ready",
                "blueprint_id": blueprint_id,
                "blueprint": session.get("blueprint"),
                "message": "Retrieved blueprint from session state.",
                "critic_status": "planned",
            }
    raise HTTPException(status_code=404, detail="Blueprint not found")


@app.post("/chat")
def legacy_chat(payload: dict[str, str]) -> dict[str, Any]:
    idea = payload.get("message") or payload.get("idea") or ""
    if not idea:
        raise HTTPException(status_code=400, detail="A message is required.")
    return start_session(SessionStartRequest(idea=idea))


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
