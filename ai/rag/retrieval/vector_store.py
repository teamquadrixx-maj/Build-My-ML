import logging
import os
from typing import Any, Dict, List

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    from supabase import Client, create_client
except ImportError:  # pragma: no cover
    Client = Any  # type: ignore[assignment]
    create_client = None


class VectorStore:
    def __init__(self, table_name: str = "document_chunks"):
        """Initialize the Supabase client using the required environment variables."""
        self.table_name = table_name

        try:
            from dotenv import load_dotenv

            load_dotenv()
        except ImportError:  # pragma: no cover
            pass

        self.url = os.environ.get("SUPABASE_URL")
        self.key = os.environ.get("SUPABASE_KEY")
        self.supabase: Client | None = None

        if not self.url or not self.key:
            raise RuntimeError(
                "Supabase is not configured. Set SUPABASE_URL and SUPABASE_KEY before using the RAG vector store."
            )
        if create_client is None:
            raise RuntimeError("The supabase Python package is not installed.")

        try:
            self.supabase = create_client(self.url, self.key)
            logger.info("Successfully initialized Supabase client.")
        except Exception as exc:  # pragma: no cover
            raise RuntimeError(f"Failed to initialize the Supabase client: {exc}") from exc

    def check_connection(self) -> bool:
        return self.supabase is not None

    def insert_chunks(self, embedded_chunks: List[Dict[str, Any]]) -> bool:
        if not self.check_connection():
            logger.error("Supabase client is not initialized.")
            return False

        if not embedded_chunks:
            logger.warning("No chunks provided for insertion.")
            return True

        try:
            response = self.supabase.table(self.table_name).insert(embedded_chunks).execute()
            logger.info(f"Successfully inserted {len(response.data)} chunks into {self.table_name}.")
            return True
        except Exception as exc:  # pragma: no cover
            logger.error(f"Failed to insert chunks into vector store: {exc}")
            return False

    def similarity_search(self, query_embedding: List[float], top_k: int = 5, match_threshold: float = 0.0) -> List[Dict[str, Any]]:
        if not self.check_connection():
            logger.error("Supabase client is not initialized.")
            return []

        try:
            response = self.supabase.rpc(
                "match_document_chunks",
                {
                    "query_embedding": query_embedding,
                    "match_threshold": match_threshold,
                    "match_count": top_k,
                },
            ).execute()
            return response.data
        except Exception as exc:  # pragma: no cover
            logger.error(f"Similarity search failed: {exc}")
            return []


if __name__ == "__main__":
    print("\n--- VECTOR STORE CONNECTION TEST ---")
    try:
        store = VectorStore()
        print("[SUCCESS] Successfully connected to Supabase!")
        print(f"Target table: {store.table_name}")
    except Exception as exc:
        print(f"[FAILED] {exc}")
        print("Please ensure SUPABASE_URL and SUPABASE_KEY are set in your environment variables.")
    print("------------------------------------\n")
