import os
import logging
from typing import List, Dict, Any

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    from supabase import create_client, Client
except ImportError:
    logger.warning("Supabase SDK is not installed. Similarity search and insertions will fail.")
    Client = Any

class VectorStore:
    def __init__(self, table_name: str = "document_chunks"):
        """
        Initializes the Supabase connection using environment variables.
        Requires SUPABASE_URL and SUPABASE_KEY.
        """
        self.table_name = table_name
        self.url = os.environ.get("SUPABASE_URL")
        self.key = os.environ.get("SUPABASE_KEY")
        
        self.supabase = None
        if not self.url or not self.key:
            logger.warning("SUPABASE_URL or SUPABASE_KEY environment variables not found.")
        else:
            try:
                self.supabase: Client = create_client(self.url, self.key)
                logger.info("Successfully initialized Supabase client.")
            except Exception as e:
                logger.error(f"Failed to initialize Supabase client: {e}")

    def check_connection(self) -> bool:
        """
        Verifies if the connection to Supabase was successful.
        """
        return self.supabase is not None

    def insert_chunks(self, embedded_chunks: List[Dict[str, Any]]) -> bool:
        """
        Inserts pre-computed embedded chunks into the Supabase vector table.
        Expects a list of dictionaries with structure:
        {
            "chunk_id": str,
            "document_id": str,
            "content": str,
            "source": str,
            "metadata": dict,
            "embedding": List[float] # 384 dimensions for all-MiniLM-L6-v2
        }
        """
        if not self.check_connection():
            logger.error("Supabase client is not initialized.")
            return False

        if not embedded_chunks:
            logger.warning("No chunks provided for insertion.")
            return True

        try:
            # We assume the configured table accurately matches the data structure provided
            # and is set up with pgvector.
            response = self.supabase.table(self.table_name).insert(embedded_chunks).execute()
            logger.info(f"Successfully inserted {len(response.data)} chunks into {self.table_name}.")
            return True
        except Exception as e:
            logger.error(f"Failed to insert chunks into vector store: {e}")
            return False

    def similarity_search(self, query_embedding: List[float], top_k: int = 5, match_threshold: float = 0.0) -> List[Dict[str, Any]]:
        """
        Performs a semantic similarity search using pgvector via a Supabase RPC function.
        Assumes a stored Postgres function exists in Supabase (e.g., 'match_document_chunks').
        """
        if not self.check_connection():
            logger.error("Supabase client is not initialized.")
            return []

        try:
            # pgvector similarity searches are typically exposed through an RPC function.
            # Replace 'match_document_chunks' with your actual Supabase DB RPC function name.
            response = self.supabase.rpc(
                "match_document_chunks", 
                {
                    "query_embedding": query_embedding,
                    "match_threshold": match_threshold,
                    "match_count": top_k
                }
            ).execute()
            
            return response.data
        except Exception as e:
            logger.error(f"Similarity search failed: {e}")
            return []

if __name__ == "__main__":
    print("\n--- VECTOR STORE CONNECTION TEST ---")
    store = VectorStore()
    
    if store.check_connection():
        print("[SUCCESS] Successfully connected to Supabase!")
        print(f"Target table: {store.table_name}")
    else:
        print("[FAILED] Could not connect to Supabase.")
        print("Please ensure SUPABASE_URL and SUPABASE_KEY are set in your environment variables.")
    print("------------------------------------\n")
