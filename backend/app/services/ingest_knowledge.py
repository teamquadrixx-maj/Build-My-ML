import os
import chromadb
from sentence_transformers import SentenceTransformer

KB_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "knowledge_base")
CHROMA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "chroma_db")

def chunk_text(text, chunk_size=500, overlap=50):
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        chunks.append(chunk)
        start += chunk_size - overlap
    return chunks

def ingest():
    print(f"Loading knowledge base from {KB_DIR}")
    model = SentenceTransformer("all-MiniLM-L6-v2")

    client = chromadb.PersistentClient(path=CHROMA_DIR)
    collection = client.get_or_create_collection("ml_knowledge")

    existing = collection.count()
    if existing > 0:
        print(f"Collection already has {existing} chunks. Clearing before re-ingest.")
        client.delete_collection("ml_knowledge")
        collection = client.get_or_create_collection("ml_knowledge")

    ids = []
    documents = []
    metadatas = []

    for filename in os.listdir(KB_DIR):
        if not filename.endswith(".md"):
            continue
        filepath = os.path.join(KB_DIR, filename)
        with open(filepath, "r") as f:
            text = f.read()

        chunks = chunk_text(text)
        for i, chunk in enumerate(chunks):
            ids.append(f"{filename}_{i}")
            documents.append(chunk)
            metadatas.append({"source": filename})

    print(f"Embedding {len(documents)} chunks...")
    embeddings = model.encode(documents).tolist()

    collection.add(
        ids=ids,
        documents=documents,
        embeddings=embeddings,
        metadatas=metadatas
    )

    print(f"Ingested {len(documents)} chunks into ChromaDB at {CHROMA_DIR}")

if __name__ == "__main__":
    ingest()
