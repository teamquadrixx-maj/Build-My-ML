import os
import chromadb
from sentence_transformers import SentenceTransformer

CHROMA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "chroma_db")

_model = None
_collection = None

def _get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model

def _get_collection():
    global _collection
    if _collection is None:
        client = chromadb.PersistentClient(path=CHROMA_DIR)
        _collection = client.get_or_create_collection("ml_knowledge")
    return _collection

def retrieve(query: str, k: int = 3):
    model = _get_model()
    collection = _get_collection()

    query_embedding = model.encode([query]).tolist()

    results = collection.query(
        query_embeddings=query_embedding,
        n_results=k
    )

    chunks = results.get("documents", [[]])[0]
    sources = results.get("metadatas", [[]])[0]

    return [
        {"text": chunk, "source": meta.get("source", "unknown")}
        for chunk, meta in zip(chunks, sources)
    ]
