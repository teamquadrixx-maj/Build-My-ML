import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from ai.rag.retrieval.retriever import DocumentRetriever

def run_tests():
    retriever = DocumentRetriever()
    
    queries = [
        "What is the elbow method used for in clustering?",
        "How does a neural network train?",
        "What are the best metrics for classification tasks?"
    ]
    
    for i, q in enumerate(queries, 1):
        print(f"\n--- Query {i}: '{q}' ---")
        results = retriever.retrieve(q, top_k=3)
        if not results:
            print("No results found.")
        else:
            for idx, r in enumerate(results, 1):
                preview = r.get('content', '')[:120].replace('\n', ' ')
                score = r.get('similarity', 0.0)
                print(f"  {idx}. Score: {score:.4f} | Preview: {preview}...")

if __name__ == "__main__":
    run_tests()
