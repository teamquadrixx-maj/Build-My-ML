from fastapi import Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User

def get_current_user(db: Session = Depends(get_db)):
    # Mock user for now
    user = db.query(User).filter(User.id == 1).first()
    if not user:
        user = User(username="testuser", email="test@example.com", password="password")
        db.add(user)
        db.commit()
        db.refresh(user)
    return user
