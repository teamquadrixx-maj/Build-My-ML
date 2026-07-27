# 🚀 BuildMyML

> **Stop researching. Start building.**  
> An intelligent, prompt-based ML project generation framework that turns your idea into a complete, structured project blueprint.

[![Python 3.9+](https://img.shields.io/badge/Python-3.9%2B-blue)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Modern%20API-green)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react)](https://react.dev/)
[![PostgreSQL + pgvector](https://img.shields.io/badge/PostgreSQL%2BPgVector-RAG-336791?logo=postgresql)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## What is BuildMyML?

You have an ML idea. You know *what* you want to build, but not *how* to build it.

BuildMyML is your **AI-powered ML architect**. Describe your problem in plain English—churn prediction, fraud detection, recommendation engine, whatever—and BuildMyML responds with a **complete, structured project blueprint** covering everything from problem formulation to deployment readiness.

```
Your Idea
    ↓
BuildMyML understands + clarifies + researches + recommends + validates
    ↓
Production-ready ML Project Blueprint
```

No hallucinations. No guessing. **Knowledge-grounded recommendations powered by RAG.**

---

## ⚡ Why BuildMyML?

### The Problem
Building an ML project requires **dozens of decisions before model training even starts**:
- What type of problem is this?
- Which datasets work?
- Which algorithms should I try?
- How should I evaluate?
- Am I introducing bias?
- Can my predictions be explained?
- What are the failure modes?

Most people research these individually. Some use ChatGPT and hope. **BuildMyML automates the research.**

### The Solution
BuildMyML combines:

| Component | What It Does |
|-----------|-------------|
| **Requirements Agent** | Extracts problem structure from natural language |
| **Clarification Agent** | Asks smart questions when information is missing |
| **RAG System** | Retrieves grounded ML knowledge (no hallucinations) |
| **Recommendation Engine** | Maps problem → datasets, algorithms, metrics |
| **Critic Agent** | Validates recommendations for consistency |
| **Blueprint Generator** | Produces structured, exportable project plan |

**Result**: A unified system that handles ML project planning end-to-end—not another chatbot.

---

## 🎯 What You Get

BuildMyML generates a **9-section ML Project Blueprint**:

1. **Problem Formulation** — Structured problem definition
2. **Dataset Strategy** — Recommended data sources & characteristics
3. **Recommended Models** — Candidate algorithms with reasoning
4. **Evaluation Metrics** — Task-specific metrics (not one-size-fits-all)
5. **Complete ML Pipeline** — Data → preprocessing → training → evaluation → deployment
6. **Fairness & Bias Mitigation** — Domain-specific fairness considerations
7. **XAI Recommendations** — Explainability techniques matched to your model
8. **Risk & Technical Debt Report** — Data leakage, generalization, monitoring gaps
9. **Responsible AI Governance Checklist** — Compliance, documentation, handoff

Think of it as a **detailed engineering spec for your ML project**—not just "use Random Forest."

---

## 🔄 How It Works

### The User Journey

```
┌──────────────────────────────────────────────────────────────┐
│ USER: "Predict which telecom customers will leave"          │
└──────────────────────┬───────────────────────────────────────┘
                       ▼
        ┌──────────────────────────────┐
        │ 1. UNDERSTAND REQUIREMENTS   │
        │ (Extract: domain, goal, task)│
        └──────────────┬───────────────┘
                       ▼
        ┌──────────────────────────────┐
        │ 2. CLARIFY MISSING INFO      │
        │ (Ask: data availability,     │
        │  features, constraints?)     │
        └──────────────┬───────────────┘
                       ▼
        ┌──────────────────────────────┐
        │ 3. RETRIEVE ML KNOWLEDGE     │
        │ (RAG: classification,        │
        │  imbalance, metrics)         │
        └──────────────┬───────────────┘
                       ▼
        ┌──────────────────────────────┐
        │ 4. GENERATE RECOMMENDATIONS  │
        │ (Data, models, preprocessing,│
        │  evaluation strategy)        │
        └──────────────┬───────────────┘
                       ▼
        ┌──────────────────────────────┐
        │ 5. VALIDATE WITH CRITIC      │
        │ (Check consistency, flag     │
        │  mismatches)                 │
        └──────────────┬───────────────┘
                       ▼
        ┌──────────────────────────────┐
        │ 6. GENERATE BLUEPRINT        │
        │ (Structured, exportable,     │
        │  ready to execute)           │
        └──────────────┬───────────────┘
                       ▼
┌──────────────────────────────────────────────────────────────┐
│ SYSTEM RETURNS: Complete ML Project Blueprint (PDF/DOCX)    │
└──────────────────────────────────────────────────────────────┘
```

### Architecture at a Glance

```
                    FRONTEND (React)
                          │
                          ▼
                   BACKEND (FastAPI)
                          │
                          ▼
                   ORCHESTRATION
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
    Agents          RAG System         State Manager
        │                 │                 │
        │        ┌────────┴────────┐       │
        │        ▼                 ▼       │
        │    Knowledge       Vector DB     │
        │    Ingestion       (pgvector)    │
        │        │                 │       │
        └────────┼─────────────────┼───────┘
                 │                 │
                 ▼                 ▼
            LLM Layer        (Grounded Context)
                 │                 │
                 └────────┬────────┘
                          ▼
                    Blueprint Output
```

---

## 🎓 Key Features

✅ **Natural Language Interface** — Describe your problem in English  
✅ **Knowledge-Grounded (RAG)** — Recommendations backed by ML knowledge, not hallucinations  
✅ **Multi-Agent Reasoning** — Specialized agents for understanding, clarifying, recommending, validating  
✅ **Responsible AI Built-In** — Fairness, explainability, and risk analysis included by default  
✅ **Complete Pipeline Design** — Not just models; entire workflow from data to deployment  
✅ **Structured Blueprints** — Exportable ML project specs (PDF, DOCX)  
✅ **Intelligent Clarification** — Asks follow-ups when requirements are ambiguous  
✅ **Critic Validation** — Catches recommendation inconsistencies before you see them  

---

## 🗂️ Supported ML Problems (Phase I)

- **Classification** (binary & multi-class)
- **Regression** (continuous prediction)
- **Clustering** (unsupervised grouping)
- **Time-Series Prediction** *(coming)*
- **Recommendation Systems** *(coming)*

Focus: Structured/tabular data. NLP & computer vision as future extensions.

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+ (for frontend)
- PostgreSQL 13+ with pgvector extension
- Docker & Docker Compose (recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/iron-ridge/BuildMyML.git
cd BuildMyML

# Set up environment
cp .env.example .env
# Edit .env with your configuration

# Run with Docker Compose (recommended)
docker-compose up -d

# Or manual setup:
# 1. Backend
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload

# 2. Frontend
cd ../frontend
npm install
npm start

# 3. n8n workflows
# Navigate to http://localhost:5678
```

### Your First Blueprint

1. Open http://localhost:3000 (frontend)
2. Enter: *"I want to predict customer churn in a telecom dataset"*
3. BuildMyML clarifies if needed
4. Get your blueprint in 30 seconds

---

## 📚 Knowledge Base

BuildMyML's intelligence comes from a curated ML knowledge corpus:

```
knowledge/
├── classification.md       (binary, multi-class, metrics, algorithms)
├── regression.md           (loss functions, models, evaluation)
├── clustering.md           (unsupervised learning, metrics)
├── preprocessing.md        (scaling, encoding, imputation, leakage)
├── model_selection.md      (algorithm comparison, trade-offs)
└── evaluation_metrics.md   (task-specific metrics, when to use)
```

**RAG Pipeline**:
```
Markdown Files → Ingestion → Chunking → Embeddings (384-dim)
                                            ↓
                                      Vector DB (pgvector)
                                            ↓
                                   Semantic Similarity Search
```

Knowledge is **updated independently** of code—evolve your knowledge base without redeploys.

---

## 🏗️ Project Structure

```
BuildMyML/
├── frontend/              # React UI
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/               # FastAPI server
│   ├── app/
│   ├── models/
│   ├── routes/
│   └── requirements.txt
│
├── ai/                    # Intelligence layer
│   ├── agents/            # Requirement, Clarification, RAG, Critic, Blueprint
│   ├── rag/               # Knowledge retrieval system
│   │   ├── knowledge/     # ML knowledge files
│   │   ├── ingestion/
│   │   ├── chunking/
│   │   ├── embeddings/
│   │   └── retrieval/
│   ├── llm/               # LLM access layer
│   ├── prompts/           # Agent instructions
│   ├── state/             # Session/workflow state
│   ├── orchestration/     # Agent coordination
│   └── shared/            # Utilities
│
├── workflows/             # n8n orchestration
│
├── storage/               # Generated blueprints
│
├── tests/                 # Unit & integration tests
│
├── docs/                  # Architecture docs & diagrams
│
└── docker-compose.yml
```

---

## 🤔 Design Philosophy

### What BuildMyML IS
✔️ An **intelligent ML planning system**  
✔️ A **research assistant** for ML project design  
✔️ **Knowledge-grounded** (RAG-powered)  
✔️ **Multi-stage reasoning** (agents collaborate)  
✔️ **Responsible by default** (fairness + XAI built in)  

### What BuildMyML is NOT
❌ A "ChatGPT for ML" (that would just hallucinate)  
❌ An "auto-train-the-best-model" system  
❌ A replacement for domain expertise  

BuildMyML **augments** your expertise—it handles research, organizes knowledge, and generates structured plans. You still drive decisions.

---

## 🧠 Multi-Agent System

BuildMyML doesn't ask one LLM to do everything. Instead:

| Agent | Role |
|-------|------|
| **Requirement Agent** | Extract & structure your problem |
| **Clarification Agent** | Ask smart follow-ups |
| **RAG Agent** | Retrieve relevant ML knowledge |
| **Recommendation Agent** | Generate data, model, metric strategies |
| **Critic Agent** | Validate recommendations (catch mismatches) |
| **Blueprint Generator** | Produce final 9-section plan |

Each agent is **specialized, testable, and explainable**. Not one 5,000-line monolith.

---

## 📊 Example Output

**Input:**
```
"I own a telecom company and want to predict which customers 
are likely to leave."
```

**Output:** 9-Section Blueprint

```
1. PROBLEM FORMULATION
   - Domain: Telecom
   - Task: Binary Classification
   - Target: Customer churn
   - Features: Usage, billing, demographics, subscription

2. DATASET STRATEGY
   - Recommended: Telecom churn datasets (public + proprietary)
   - Size: 10k+ records with balanced classes preferred
   - Required columns: customer profile, usage metrics, churn label

3. RECOMMENDED MODELS
   - Logistic Regression (interpretable baseline)
   - Random Forest (captures nonlinearities)
   - Gradient Boosting (strong performer on structured data)

4. EVALUATION METRICS
   - Precision, Recall, F1 (class imbalance expected)
   - ROC-AUC, PR-AUC (ranking metrics)
   - Lift & Gain charts (business relevance)

5. COMPLETE ML PIPELINE
   Data Collection → Preprocessing → Feature Engineering 
   → Model Training → Hyperparameter Tuning → Evaluation 
   → Analysis → Deployment

6. FAIRNESS & BIAS MITIGATION
   - Check for demographic parity (age, region, gender)
   - Monitor prediction rates across demographic groups
   - Recommend fairness-aware model evaluation

7. XAI RECOMMENDATIONS
   - SHAP for model-agnostic explanations
   - Feature importance from tree-based models
   - Local explanations for high-value customer decisions

8. RISK & TECHNICAL DEBT
   - Data leakage: Avoid future churn indicators
   - Concept drift: Churn patterns change over time
   - Class imbalance: Address in preprocessing
   - Monitoring: Track prediction performance over time

9. RESPONSIBLE AI GOVERNANCE
   - Data provenance documented
   - Model card generated
   - Compliance check (data privacy, fairness)
   - Decommissioning plan
```

All **structured, actionable, ready to execute**.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React, TypeScript, Tailwind CSS |
| **Backend** | FastAPI, Pydantic, SQLAlchemy |
| **AI/ML** | LangChain, sentence-transformers, Anthropic Claude |
| **Knowledge** | Markdown, Python ingestion pipeline |
| **Embeddings** | all-MiniLM-L6-v2 (384-dim) |
| **Vector DB** | PostgreSQL + pgvector (Supabase) |
| **Orchestration** | n8n, Python agents |
| **Deployment** | Docker, Docker Compose, GCP/AWS |
| **Testing** | pytest, unittest |
