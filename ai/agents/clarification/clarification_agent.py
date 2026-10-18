from typing import Any

from ai.llm.providers.gemini_provider import GeminiProvider


class ClarificationAgent:
    def __init__(self, llm: GeminiProvider | None = None):
        self.llm = llm or GeminiProvider()

    def run(self, requirements: dict[str, Any], answers: dict[str, str]) -> dict[str, Any]:
        prompt = f"""
You are the Clarification Agent for BuildMyML.
Use the current requirements and the user answers to decide whether the brief is ready.
Return valid JSON only.

Requirements:
{requirements}

Answers:
{answers}

Return:
{
  "status": "ready" | "needs_clarification",
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
"""
        payload = self.llm.generate_json(prompt)
        payload.setdefault("status", "ready")
        payload.setdefault("missing_information", [])
        payload.setdefault("clarification_questions", [])
        payload.setdefault("requirements", requirements)
        return payload
