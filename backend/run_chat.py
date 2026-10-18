import sys
import os
import asyncio

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, current_dir)
sys.path.insert(0, parent_dir)

from app.database import SessionLocal, Base, engine
from app.models import User
from app.services.ai_agent import generate_ai_response

# Create DB schema
Base.metadata.create_all(bind=engine)

def main():
    db = SessionLocal()
    
    # Create mock user
    user = db.query(User).filter(User.id == 1).first()
    if not user:
        user = User(username="testuser", email="test@example.com", password="password")
        db.add(user)
        db.commit()
    
    print("Welcome to BuildMyML CLI! (type 'exit' to quit)")
    print("Agent is ready. Describe your ML project idea.")
    
    while True:
        try:
            user_input = input("\nYou: ")
            if user_input.lower() in ['exit', 'quit']:
                break
            
            print("\nAgent is thinking...")
            result = generate_ai_response(user_input, db, user.id)
            
            if "error" in result:
                print(f"Error: {result['error']}")
            else:
                print(f"\nAI: {result['reply']}")
                
                if result.get("blueprint_ready") and result.get("blueprint"):
                    print("\n========== BLUEPRINT ==========")
                    import json
                    print(json.dumps(result["blueprint"], indent=2))
                    print("===============================\n")
                    
        except KeyboardInterrupt:
            break
        
    db.close()

if __name__ == "__main__":
    main()
