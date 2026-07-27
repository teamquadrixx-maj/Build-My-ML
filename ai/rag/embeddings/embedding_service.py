import os
import sys
from dataclasses import dataclass, field
from typing import List, Dict, Any

if __name__ == "__main__":
    # Allow imports from project root
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(os.path.dirname(os.path.dirname(current_dir)))
    sys.path.insert(0, project_root)

from sentence_transformers import SentenceTransformer

# Re-use existing structs/functions
from ai.rag.chunking.text_chunker import Chunk, create_chunks
from ai.rag.ingestion.document_loader import load_markdown_documents

@dataclass
class EmbeddedChunk:
    chunk_id: str
    document_id: str
    content: str
    source: str
    metadata: Dict[str, Any]
    embedding: List[float]

class EmbeddingService:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """
        Initialises the EmbeddingService. Loads the SentenceTransformer model only once.
        """
        # Load the model only once during initialization
        self.model = SentenceTransformer(model_name)
        self.dimension = self.model.get_sentence_embedding_dimension()
        
        # Enforce 384 dimensions for all-MiniLM-L6-v2 as requested
        if self.dimension != 384:
            raise ValueError(f"Expected 384 dimensions, but got {self.dimension}.")

    def embed_chunks(self, chunks: List[Chunk], batch_size: int = 32) -> List[EmbeddedChunk]:
        """
        Embeds a list of Chunk objects in batches.
        """
        if not chunks:
            return []
            
        texts = [chunk.content for chunk in chunks]
        
        # model.encode supports batches to avoid running individually
        embeddings = self.model.encode(texts, batch_size=batch_size, show_progress_bar=False)
        
        embedded_chunks = []
        for i, chunk in enumerate(chunks):
            # Convert NumPy array to standard Python list
            embedding_vector = embeddings[i].tolist()
            
            # Validate output dimension
            if len(embedding_vector) != 384:
                raise ValueError(f"Generated embedding dimension {len(embedding_vector)} != 384")
                
            embedded_chunk = EmbeddedChunk(
                chunk_id=chunk.chunk_id,
                document_id=chunk.document_id,
                content=chunk.content,
                source=chunk.source,
                metadata=chunk.metadata.copy(),
                embedding=embedding_vector
            )
            embedded_chunks.append(embedded_chunk)
            
        return embedded_chunks

if __name__ == "__main__":
    from pathlib import Path
    
    knowledge_path = Path(__file__).parent.parent / "knowledge"
    
    # 1. Ingestion
    docs = load_markdown_documents(knowledge_path)
    
    # 2. Chunking
    chunks = create_chunks(docs, chunk_size=400, overlap=50)
    
    # 3. Embeddings
    print("\n--- EMBEDDINGS TEST ---")
    service = EmbeddingService(model_name="all-MiniLM-L6-v2")
    
    embedded_chunks = service.embed_chunks(chunks)
    
    print(f"Model used: all-MiniLM-L6-v2")
    print(f"Total documents loaded: {len(docs)}")
    print(f"Total chunks generated: {len(chunks)}")
    print(f"Total embeddings generated: {len(embedded_chunks)}")
    print(f"Embedding dimension: {service.dimension}")
    
    if embedded_chunks:
        # Validate that no chunk content is empty
        empty_texts = [c for c in embedded_chunks if not c.content.strip()]
        assert len(empty_texts) == 0, "Found empty content in the generated chunks!"
        assert len(embedded_chunks) == len(chunks), "Number of embeddings does not equal number of chunks!"
        
        first = embedded_chunks[0]
        print(f"First chunk source: {first.source.split('/')[-1]}")
        print(f"First 5 numerical values of its embedding:")
        print([round(v, 6) for v in first.embedding[:5]])
        
    print("-----------------------\n")
