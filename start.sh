#!/bin/bash
echo "Setting up BuildMyML environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt

echo "Starting Backend API on http://localhost:8000..."
cd backend
python3 main.py
