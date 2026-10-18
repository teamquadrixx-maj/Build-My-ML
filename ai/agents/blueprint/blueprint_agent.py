from typing import Any

from ai.llm.providers.gemini_provider import GeminiProvider


class BlueprintAgent:
    def __init__(self, llm: GeminiProvider | None = None):
        self.llm = llm or GeminiProvider()

    def run(self, requirements: dict[str, Any], context_chunks: list[dict[str, str]]) -> dict[str, Any]:
        prompt = """
You are the Blueprint Agent for BuildMyML.
Create a structured ML blueprint using the user's requirements and retrieved domain context.
Return valid JSON only.

Requirements:
%s

Retrieved context:
%s

Return a JSON object with this shape:
{
  "problem_statement": "...",
  "ml_task": "classification" | "regression" | "clustering" | "other",
  "dataset_requirements": "...",
  "preprocessing": ["..."],
  "feature_engineering": ["..."],
  "candidate_algorithms": [{
      "name": "...",
      "reason": "..."
  }],
  "evaluation_metrics": ["..."],
  "training_pipeline": "...",
  "deployment_considerations": "...",
  "note": "This blueprint is a set of recommendations and does not guarantee a trained, accurate model."
}
""" % (requirements, context_chunks)
        blueprint = self.llm.generate_json(prompt)
        blueprint.setdefault("note", "This blueprint is a set of recommendations and does not guarantee a trained, accurate model.")
        return blueprint
