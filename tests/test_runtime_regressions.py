from __future__ import annotations

from types import SimpleNamespace

from ai.agents.requirement.requirement_agent import RequirementAgent
from ai.rag.retrieval.retriever import DocumentRetriever


class FakeLLM:
    def generate_json(self, prompt: str):
        assert "Return valid JSON only." in prompt
        assert '"status": "ready" | "needs_clarification"' in prompt
        return {
            "status": "ready",
            "project_goal": "Detect suspicious transactions earlier.",
            "task": "classification",
            "missing_information": [],
            "clarification_questions": [],
            "requirements": {
                "target_outcome": "Flag suspicious transactions before losses happen.",
                "data_availability": "Transaction history and customer behavior signals are available.",
                "business_context": "Small banks want to warn customers early.",
            },
        }


def test_requirement_agent_runs_without_prompt_format_error():
    agent = RequirementAgent(llm=FakeLLM())

    result = agent.run("I want to build a system that flags suspicious transactions early.")

    assert result["status"] == "ready"
    assert result["requirements"]["target_outcome"]


def test_document_retriever_uses_local_chroma_when_supabase_is_unavailable(monkeypatch):
    calls = {"local": 0}

    class FakeEmbeddingModel:
        def encode(self, text):
            return [0.1] * 384

    class FakeEmbeddingService:
        dimension = 384
        model = FakeEmbeddingModel()

    class FakeVectorStore:
        def similarity_search(self, query_embedding, top_k, match_threshold):
            return []

    def fake_local_retrieval(query, top_k=5, match_threshold=0.0):
        calls["local"] += 1
        return [{"content": "transaction risk context", "source": "local.md", "similarity": 0.87}]

    retriever = DocumentRetriever(embedding_service=FakeEmbeddingService(), vector_store=FakeVectorStore())
    monkeypatch.setattr(retriever, "_fallback_local_retrieval", fake_local_retrieval)

    results = retriever.retrieve("suspicious transaction risk", top_k=3)

    assert results
    assert results[0]["content"] == "transaction risk context"
    assert calls["local"] == 1
