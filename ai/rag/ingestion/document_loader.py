import uuid
import logging
from pathlib import Path
from typing import List, Dict, Any
from dataclasses import dataclass, field

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class Document:
    document_id: str
    title: str
    content: str
    source: str
    metadata: Dict[str, Any] = field(default_factory=dict)

def load_markdown_documents(knowledge_dir: Path) -> List[Document]:
    """
    Loads all markdown (.md) documents from the specified directory.
    """
    documents = []
    
    if not knowledge_dir.exists() or not knowledge_dir.is_dir():
        logger.error(f"Directory not found: {knowledge_dir}")
        return documents

    for filepath in knowledge_dir.glob("*.md"):
        try:
            content = filepath.read_text(encoding="utf-8")
            
            # Basic title extraction (first line starting with '# ') or default to filename
            title = filepath.stem.replace("_", " ").title()
            for line in content.splitlines():
                if line.startswith("# "):
                    title = line.replace("# ", "").strip()
                    break

            doc = Document(
                document_id=str(uuid.uuid4()),
                title=title,
                content=content.strip(),
                source=str(filepath.absolute()),
                metadata={"filename": filepath.name, "extension": ".md"}
            )
            documents.append(doc)
            
        except Exception as e:
            logger.error(f"Failed to read file {filepath.name}: {e}")
            
    return documents

if __name__ == "__main__":
    current_dir = Path(__file__).parent
    knowledge_path = current_dir.parent / "knowledge"
    
    docs = load_markdown_documents(knowledge_path)
    print(f"\n--- INGESTION RESULT ---")
    print(f"Loaded {len(docs)} documents.")
    for d in docs:
        print(f"Title: {d.title} | Source: {d.source.split('/')[-1]}")
    print("------------------------\n")
