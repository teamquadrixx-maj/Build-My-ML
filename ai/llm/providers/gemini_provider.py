import json
import os
from typing import Any

try:
    import google.generativeai as genai
except Exception:  # pragma: no cover
    genai = None


class GeminiProvider:
    def __init__(self, api_key: str | None = None, model_name: str = "gemini-2.5-flash"):
        self.model_name = model_name
        self.api_key = api_key or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            raise RuntimeError("GEMINI_API_KEY is required but was not set in the environment.")
        if genai is None:
            raise RuntimeError("google-generativeai is not installed in the current environment.")

        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel(self.model_name)

    def generate_json(self, prompt: str, *, default: Any = None) -> Any:
        try:
            response = self.model.generate_content(prompt)
            text = getattr(response, "text", str(response))
            cleaned = text.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            return json.loads(cleaned.strip())
        except Exception:
            if default is not None:
                return default
            raise

    def generate_text(self, prompt: str) -> str:
        response = self.model.generate_content(prompt)
        return getattr(response, "text", str(response))
