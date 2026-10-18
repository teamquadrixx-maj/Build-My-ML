import sys
import os
import logging
from pathlib import Path
from typing import List, Dict, Any

# Ensure project imports work when testing the file locally
if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(current_dir)))
    sys.path.insert(0, project_root)

from ai.rag.embeddings.embedding_service import EmbeddingService
from ai.rag.retrieval.vector_store import VectorStore

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DocumentRetriever:
    def __init__(self, embedding_service: EmbeddingService = None, vector_store: VectorStore = None):
        """
        Initializes the retriever with necessary services.
        If dependencies are not passed, it initializes them using default configurations.
        """
        # Load the model only once
        self.embedding_service = embedding_service or EmbeddingService()
        self.vector_store = vector_store or VectorStore()

    def _fallback_local_retrieval(self, query: str, top_k: int = 5, match_threshold: float = 0.0) -> List[Dict[str, Any]]:
        try:
            import chromadb

            project_root = Path(__file__).resolve().parents[2]
            chroma_path = project_root / "chroma_db"
            client = chromadb.PersistentClient(path=str(chroma_path))
            collection = client.get_or_create_collection("ml_knowledge")

            query_embedding = self.embedding_service.model.encode([query]).tolist()
            results = collection.query(query_embeddings=query_embedding, n_results=top_k)

            documents = results.get("documents", [[]])[0]
            metadatas = results.get("metadatas", [[]])[0]
            distances = results.get("distances", [[]])[0]

            payload = []
            for index, document in enumerate(documents):
                metadata = metadatas[index] if index < len(metadatas) else {}
                if not isinstance(metadata, dict):
                    metadata = {}
                raw_distance = float(distances[index]) if index < len(distances) else 0.0
                similarity = 1.0 / (1.0 + raw_distance) if raw_distance >= 0 else 0.0
                if match_threshold > 0 and similarity < match_threshold:
                    continue
                payload.append({
                    "content": document,
                    "source": metadata.get("source", "local_knowledge_base"),
                    "similarity": similarity,
                    "metadata": metadata,
                })
            return payload
        except Exception as exc:
            logger.warning(f"Local retrieval fallback failed: {exc}")
            return []

    def retrieve(self, query: str, top_k: int = 5, match_threshold: float = 0.0) -> List[Dict[str, Any]]:
        """
        Takes a user query, generates an embedding, and retrieves the top-k most
        similar document chunks from the Supabase vector store, sorted by similarity.
        """
        if not query.strip():
            logger.warning("Empty query provided. Returning empty results.")
            return []

        logger.info(f"Generating embedding for query: '{query}'")

        try:
            query_embedding = self.embedding_service.model.encode(query).tolist()

            if len(query_embedding) != self.embedding_service.dimension:
                raise ValueError("Query embedding dimension mismatch.")

            logger.info(f"Searching vector database for top {top_k} matches...")

            results = self.vector_store.similarity_search(
                query_embedding=query_embedding,
                top_k=top_k,
                match_threshold=match_threshold,
            )

            if not results:
                logger.warning("Supabase vector search returned no matches; falling back to local Chroma data.")
                results = self._fallback_local_retrieval(query, top_k=top_k, match_threshold=match_threshold)

            logger.info(f"Retrieved {len(results)} matching chunks.")
            return results

        except Exception as exc:
            logger.error(f"Retrieval process failed: {exc}")
            return self._fallback_local_retrieval(query, top_k=top_k, match_threshold=match_threshold)

if __name__ == "__main__":
    print("\n--- RETRIEVER TEST ---")
    
    # Instantiate the retriever
    retriever = DocumentRetriever()
    
    test_query = "What is the elbow method used for in clustering?"
    print(f"Test Query: '{test_query}'\n")
    
    results = retriever.retrieve(test_query, top_k=5)
    
    if not results:
        print("No results returned. This is expected if Supabase is unconfigured, empty, or inaccessible.")
    else:
        print("Found top results! Previewing first few:")
        for idx, res in enumerate(results):
            similarity = res.get('similarity', res.get('distance', 'N/A'))
            content_preview = res.get('content', '')[:100].replace('\n', ' ')
            print(f"[{idx+1}] Score: {similarity} | Chunk Preview: {content_preview}...")

    print("----------------------\n")
