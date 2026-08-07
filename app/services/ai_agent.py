import os
import json
import logging
from dotenv import load_dotenv
import google.generativeai as genai

from app.services.history_service import save_project
from app.services.rag_service import retrieve
from app.models import ChatMessage

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")


def clean_json(text: str):
    text = text.strip()

    if text.startswith("```json"):
        text = text[7:]

    if text.startswith("```"):
        text = text[3:]

    if text.endswith("```"):
        text = text[:-3]

    return text.strip()


def get_recent_history(db, user_id, limit=10):
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == user_id)
        .order_by(ChatMessage.id.desc())
        .limit(limit)
        .all()
    )
    messages.reverse()
    return messages


def save_message(db, user_id, role, content):
    msg = ChatMessage(user_id=user_id, role=role, content=content)
    db.add(msg)
    db.commit()


def get_blueprint(project: str, dataset: str, target: str, model_name: str):

    prompt = f"""
You are a senior machine learning architect.

Generate a COMPLETE production-ready ML blueprint.

PROJECT:
{project}

DATASET:
{dataset}

TARGET:
{target}

MODEL:
{model_name}

Return ONLY VALID JSON.

{{
  "project_name": "",
  "problem_type": "",
  "goal": "",

  "dataset": {{
    "name": "",
    "description": "",
    "source": "",
    "size_estimate": "",
    "preprocessing_steps": []
  }},

  "target_column": "",

  "feature_engineering": [],

  "model": {{
    "name": "",
    "library": "",
    "hyperparameters": {{}},
    "training_steps": []
  }},

  "evaluation_metrics": [],

  "pipeline_steps": [],

  "deployment_suggestions": [],

  "next_steps": []
}}
"""

    try:
        response = model.generate_content(prompt)
        data = json.loads(clean_json(response.text))
        return data

    except Exception as e:
        logger.error(f"Blueprint generation error: {e}")

        return {
            "project_name": project,
            "problem_type": "Unknown",
            "goal": "",
            "dataset": {
                "name": dataset,
                "description": "",
                "source": "",
                "size_estimate": "",
                "preprocessing_steps": []
            },
            "target_column": target,
            "feature_engineering": [],
            "model": {
                "name": model_name,
                "library": "",
                "hyperparameters": {},
                "training_steps": []
            },
            "evaluation_metrics": [],
            "pipeline_steps": [],
            "deployment_suggestions": [],
            "next_steps": []
        }


def get_dataset_recommendations(project: str, target: str = None):

    prompt = f"""
Recommend exactly 5 REAL datasets for this ML project.

Project:
{project}

Target:
{target}

Return ONLY valid JSON.

{{
  "datasets": [
    {{
      "name": "",
      "source": "",
      "description": "",
      "why_fit": "",
      "size": "",
      "link": ""
    }}
  ]
}}
"""

    try:
        response = model.generate_content(prompt)
        return json.loads(clean_json(response.text))

    except Exception as e:
        logger.error(f"Dataset recommendation error: {e}")
        return {"datasets": []}


def get_model_recommendations(project: str, dataset: str = None, target: str = None):

    prompt = f"""
Recommend exactly 5 ML models.

Project:
{project}

Dataset:
{dataset}

Target:
{target}

Return ONLY valid JSON.

{{
  "models": [
    {{
      "name": "",
      "type": "",
      "library": "",
      "reason": "",
      "pros": "",
      "cons": ""
    }}
  ]
}}
"""

    try:
        response = model.generate_content(prompt)
        return json.loads(clean_json(response.text))

    except Exception as e:
        logger.error(f"Model recommendation error: {e}")
        return {"models": []}


def check_completeness(history_text):
    prompt = f"""
You are an expert AI Machine Learning Architect gathering requirements
for an ML project blueprint.

CONVERSATION SO FAR:
{history_text}

You need to know, at minimum:
1. What the project/problem is
2. What dataset will be used (or its general domain/source)
3. What the target variable is (what we're predicting)

Decide if you have ENOUGH information to generate a complete,
reasonable ML blueprint (it's OK to make sensible assumptions for
minor details, but the core project, dataset, and target must be clear).

Return ONLY valid JSON, no markdown, in this exact format:

{{
  "status": "needs_info" or "complete",
  "question": "a single, specific follow-up question (only if status is needs_info, else empty string)"
}}
"""
    response = model.generate_content(prompt)
    return json.loads(clean_json(response.text))


def generate_ai_response(message, db, user_id):
    save_message(db, user_id, "user", message)

    history = get_recent_history(db, user_id, limit=10)
    history_text = "\n".join(
        f"{m.role.upper()}: {m.content}" for m in history
    )

    try:
        check = check_completeness(history_text)
    except Exception as e:
        logger.error(f"Completeness check error: {e}")
        check = {"status": "complete", "question": ""}

    if check.get("status") == "needs_info":
        question = check.get("question") or "Could you provide a bit more detail about your project?"
        save_message(db, user_id, "ai", question)
        return {
            "reply": question,
            "blueprint_ready": False,
            "blueprint": None
        }

    retrieved = retrieve(history_text, k=3)
    knowledge_text = "\n\n".join(
        f"[from {r['source']}]\n{r['text']}" for r in retrieved
    )

    prompt = f"""
You are an expert AI Machine Learning Architect having an ongoing
conversation with a user about their ML project.

CONVERSATION SO FAR:
{history_text}

RELEVANT ML KNOWLEDGE (use this to ground your model, metric, and
preprocessing recommendations — prefer these established practices
over generic guesses):
{knowledge_text}

Using the FULL conversation above (not just the latest message),
identify:

1. Project name
2. Dataset
3. Target column
4. Best ML model

Then generate a complete ML blueprint.

Return ONLY valid JSON in this format:

{{
  "project_name": "",
  "problem_type": "",
  "goal": "",

  "dataset": {{
    "name": "",
    "description": "",
    "source": "",
    "size_estimate": "",
    "preprocessing_steps": []
  }},

  "target_column": "",

  "feature_engineering": [],

  "model": {{
    "name": "",
    "library": "",
    "hyperparameters": {{}},
    "training_steps": []
  }},

  "evaluation_metrics": [],

  "pipeline_steps": [],

  "deployment_suggestions": [],

  "next_steps": []
}}
"""

    try:
        response = model.generate_content(prompt)
        blueprint = json.loads(clean_json(response.text))

        save_project(db=db, blueprint=blueprint, user_id=user_id)
        save_message(db, user_id, "ai", "Blueprint generated successfully.")

        return {
            "reply": "Blueprint generated successfully.",
            "blueprint_ready": True,
            "blueprint": blueprint
        }

    except Exception as e:
        logger.error(e)
        save_message(db, user_id, "ai", f"Error: {str(e)}")
        return {
            "error": str(e)
        }
