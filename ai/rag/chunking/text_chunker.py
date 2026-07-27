import uuid
import sys
import os
from dataclasses import dataclass, field
from typing import List, Dict, Any

# Ensure we can import from ai.rag... when testing directly
if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(current_dir)))
    sys.path.insert(0, project_root)

from ai.rag.ingestion.document_loader import Document, load_markdown_documents

@dataclass
class Chunk:
    chunk_id: str
    document_id: str
    content: str
    source: str
    metadata: Dict[str, Any] = field(default_factory=dict)

def create_chunks(documents: List[Document], chunk_size: int = 500, overlap: int = 50) -> List[Chunk]:
    if chunk_size <= 0:
        raise ValueError("chunk_size must be a positive integer.")
    if overlap >= chunk_size:
        raise ValueError("overlap must be strictly smaller than chunk_size.")
    if overlap < 0:
        raise ValueError("overlap must be non-negative.")
        
    all_chunks = []
    
    for doc in documents:
        if not doc.content.strip():
            continue
            
        # Split by paragraph (\n\n) to try preserving semantic boundaries
        paragraphs = [p.strip() for p in doc.content.split('\n\n') if p.strip()]
        
        chunks_text = []
        current_text = ""
        
        for para in paragraphs:
            # If adding the paragraph exceeds chunk_size, save current_text and start fresh
            if current_text and (len(current_text) + 2 + len(para)) > chunk_size:
                chunks_text.append(current_text)
                
                # Backtrack to add overlap from the tail of current_text
                tail = current_text[-overlap:] if overlap > 0 else ""
                if " " in tail:
                    tail = tail[tail.find(" ") + 1:]
                
                current_text = tail + ("\n\n" if tail else "") + para
            else:
                current_text = current_text + "\n\n" + para if current_text else para
                
            # If a single paragraph is STILL larger than chunk_size
            while len(current_text) > chunk_size:
                chunks_text.append(current_text[:chunk_size])
                current_text = current_text[chunk_size - overlap:]
                
        if current_text.strip():
            chunks_text.append(current_text.strip())
            
        for i, text in enumerate(chunks_text):
            if not text.strip():
                continue
                
            metadata = doc.metadata.copy()
            metadata["chunk_index"] = i
            
            chunk = Chunk(
                chunk_id=str(uuid.uuid4()),
                document_id=doc.document_id,
                content=text,
                source=doc.source,
                metadata=metadata
            )
            all_chunks.append(chunk)
            
    return all_chunks

if __name__ == "__main__":
    from pathlib import Path
    
    knowledge_path = Path(__file__).parent.parent / "knowledge"
    docs = load_markdown_documents(knowledge_path)
    
    # Mock content if documents are empty on disk for testing purposes
    for d in docs:
        if not d.content.strip():
            d.content = f"# {d.title}\n\nThis is a mock paragraph for {d.title}. We are adding some text here so the chunker can produce multiple chunks per document, since the files on disk were appearing empty. \n\nHere is a second paragraph that extends the length. \n\nAnd a third paragraph bridging more information to ensure it exceeds the chunk length requirements where possible. \n\nFourth paragraph ensures we get another chunk split depending on chunk_size." * 3

    print(f"\n--- CHUNKING TEST ---")
    
    chunk_size = 400
    overlap = 50
    chunks = create_chunks(docs, chunk_size=chunk_size, overlap=overlap)
    
    print(f"chunk_size: {chunk_size}, overlap: {overlap}")
    print(f"Total documents processed: {len(docs)}")
    print(f"Total chunks generated: {len(chunks)}")
    
    if chunks:
        print("\nPreview of first 2 chunks:")
        for i in range(min(2, len(chunks))):
            c = chunks[i]
            print(f"\n[Chunk {i+1}] ID: {c.chunk_id}")
            print(f"Doc ID: {c.document_id}")
            print(f"Source: {c.source.split('/')[-1]}")
            print(f"Content:\n{c.content[:150]}...")
            
    # Verification
    empty_chunks = [c for c in chunks if not c.content.strip()]
    print(f"\nEmpty chunks detected: {len(empty_chunks)}")
    print("------------------------\n")
