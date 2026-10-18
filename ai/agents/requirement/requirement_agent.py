import json
from typing import Any

from ai.llm.providers.gemini_provider import GeminiProvider


class RequirementAgent:
    def __init__(self, llm: GeminiProvider | None = None):
        self.llm = llm or GeminiProvider()

    def run(self, idea: str) -> dict[str, Any]:
        prompt = """
You are the Requirement Agent for BuildMyML.
Turn the user idea into a structured ML brief.
Return valid JSON only.

User idea:
%s

Return a JSON object with this shape:
{
  "status": "ready" | "needs_clarification",
  "project_goal": "...",
  "task": "classification" | "regression" | "clustering" | "other",
  "missing_information": ["..."],
  "clarification_questions": [{
      "id": "q1",
      "question": "..."
  }],
  "requirements": {
      "target_outcome": "...",
      "data_availability": "...",
      "business_context": "..."
  }
}
""" % idea
        payload = self.llm.generate_json(prompt)
        if payload.get("status") == "needs_clarification":
            return payload
        if not payload.get("clarification_questions"):
            payload["clarification_questions"] = []
        if not payload.get("missing_information"):
            payload["missing_information"] = []
        payload["status"] = payload.get("status", "ready")
        return payload
