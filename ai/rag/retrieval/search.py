import sys
import os
import textwrap

# Ensure project imports work when testing the file locally
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(os.path.dirname(os.path.dirname(current_dir)))
sys.path.insert(0, project_root)

from ai.rag.retrieval.retriever import DocumentRetriever

def main():
    print("Initializing BuildMyML RAG Search...")
    print("Loading offline embedding model and Supabase connection, please wait...\n")
    
    retriever = DocumentRetriever()
    
    print("=" * 60)
    print(" RAG Knowledge Base Search ")
    print(" Type 'quit' or 'exit' to exit the application. ")
    print("=" * 60)

    while True:
        try:
            query = input("\nEnter your search query: ").strip()
            
            if query.lower() in ('quit', 'exit'):
                print("Exiting RAG search...")
                break
                
            if not query:
                continue
                
            print("\nSearching our vector database for top chunks, please wait...")
            
            # Fetch the top 5 results using our retriever
            results = retriever.retrieve(query, top_k=5)
            
            if not results:
                print("No relevant chunks found. (Ensure Supabase is securely connected and correctly populated).")
                continue
                
            print(f"\n--- Found {len(results)} Chunks ---")
            
            for idx, res in enumerate(results, start=1):
                # Retrieve fields robustly depending on exact database schema 
                source = res.get('source', res.get('metadata', {}).get('filename', 'Unknown Source'))
                similarity = res.get('similarity', res.get('distance', 'N/A'))
                
                # In standard scenarios, content is extracted safely
                content = res.get('content', 'No content available.').strip()
                
                print(f"\n[{idx}] Semantic Match Score: {similarity} | File: {os.path.basename(source)}")
                print("-" * 60)
                
                # Wrap text properly for readable console output
                wrapped_content = textwrap.fill(content, width=80)
                print(wrapped_content)
                print("-" * 60)
                
        except KeyboardInterrupt:
            print("\nExiting RAG search...")
            break
        except Exception as e:
            print(f"\n[Error] The search process failed: {e}")

if __name__ == "__main__":
    main()
