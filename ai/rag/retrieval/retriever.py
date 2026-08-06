import sys
import os
import logging
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
            # We directly encode the string query since the EmbeddingService holds the model reference.
            query_embedding = self.embedding_service.model.encode(query).tolist()
            
            # Validate output dimension
            if len(query_embedding) != self.embedding_service.dimension:
                raise ValueError("Query embedding dimension mismatch.")
                
            logger.info(f"Searching vector database for top {top_k} matches...")
            
            # Call vector store
            results = self.vector_store.similarity_search(
                query_embedding=query_embedding, 
                top_k=top_k, 
                match_threshold=match_threshold
            )
            
            logger.info(f"Retrieved {len(results)} matching chunks.")
            
            # Typically pgvector RPC functions return results ordered by similarity implicitly
            return results
            
        except Exception as e:
            logger.error(f"Retrieval process failed: {e}")
            return []

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
