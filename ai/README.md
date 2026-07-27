# BuildMyML AI Module

## Overview

The `ai/` module contains the core artificial intelligence components of **BuildMyML — An Intelligent Prompt-Based AutoML Project Generation Framework**.

This module is responsible for understanding user requirements, retrieving relevant machine learning knowledge, interacting with Large Language Models (LLMs), coordinating specialised AI agents, maintaining workflow state, and orchestrating the AI pipeline.

The module is designed with clear separation of responsibilities so that each AI component can be developed, tested, and maintained independently.

---

## Folder Structure

```text
ai/
│
├── agents/
├── rag/
├── llm/
├── prompts/
├── state/
├── orchestration/
├── shared/
└── README.md
```

---

## `agents/`

The `agents/` directory contains the specialised AI agents responsible for different reasoning tasks within BuildMyML.

Instead of using one AI component for the entire process, BuildMyML divides the workflow into specialised agents.

Agents may include:

- **Requirement Agent** — understands and structures the user's ML project requirements.
- **Clarification Agent** — identifies missing information and generates clarification questions.
- **RAG Agent** — obtains relevant machine learning knowledge from the RAG subsystem.
- **Critic Agent** — validates and critiques generated recommendations.
- **Blueprint Generator** — produces the final structured ML project blueprint.

Each agent should have a clearly defined responsibility and communicate using structured inputs and outputs.

---

## `rag/`

The `rag/` directory contains the **Retrieval-Augmented Generation (RAG)** system.

RAG allows BuildMyML to retrieve relevant machine learning information from a controlled knowledge base before generating AI responses.

```text
rag/
├── knowledge/
├── ingestion/
├── chunking/
├── embeddings/
└── retrieval/
```

### `knowledge/`

Contains the machine learning knowledge used by the retrieval system.

The knowledge base can contain information about:

- Classification
- Regression
- Clustering
- Data preprocessing
- Model selection
- Evaluation metrics

### `ingestion/`

Loads knowledge documents and converts them into structured document objects that can be processed by the RAG pipeline.

### `chunking/`

Splits large knowledge documents into smaller meaningful text chunks.

Smaller chunks allow the retrieval system to locate specific relevant information rather than retrieving entire documents.

### `embeddings/`

Converts text chunks into numerical vector representations called **embeddings**.

Embeddings represent the semantic meaning of text and allow similar pieces of information to be compared mathematically.

### `retrieval/`

Searches the vector knowledge store and returns the chunks that are most relevant to a user's query.

The general RAG flow is:

```text
Knowledge Documents
        ↓
Ingestion
        ↓
Chunking
        ↓
Embeddings
        ↓
Vector Storage
        ↓
Similarity Search
        ↓
Relevant Context
```

---

## `llm/`

The `llm/` directory provides the interface between BuildMyML and the Large Language Model.

Its purpose is to keep model-provider-specific logic separate from agents and other AI components.

Responsibilities may include:

- Sending requests to the LLM
- Model configuration
- Request and response normalisation
- Error handling
- Timeout handling
- Provider abstraction
- Usage metadata

Conceptually:

```text
Agent
  ↓
LLM Interface
  ↓
LLM Provider
  ↓
Model Response
```

Agents should communicate through this layer instead of directly depending on a specific LLM provider.

---

## `prompts/`

The `prompts/` directory contains prompts and instructions used by the AI agents.

Separating prompts from implementation logic makes them easier to:

- Maintain
- Test
- Improve
- Version
- Reuse

Different agents can maintain their own prompts for tasks such as requirement extraction, clarification, critique, retrieval-assisted reasoning, and blueprint generation.

---

## `state/`

The `state/` directory manages information that must be preserved while a user's request moves through the AI pipeline.

State may contain:

- Original user request
- Session information
- Extracted requirements
- Clarification questions
- User clarification responses
- Retrieved RAG context
- Intermediate agent outputs
- Critic feedback
- Current workflow stage
- Generated blueprint

Conceptually:

```text
User Request
     ↓
Requirements
     ↓
Clarifications
     ↓
Retrieved Context
     ↓
Agent Outputs
     ↓
Final Blueprint
```

State management allows information generated in earlier stages to remain available to later stages.

---

## `orchestration/`

The `orchestration/` directory controls how the different AI components execute together.

It determines **what component should run next**.

For example:

```text
User Input
    ↓
Requirement Agent
    ↓
Clarification Agent
    ↓
RAG
    ↓
Reasoning Agents
    ↓
Critic Agent
    ↓
Blueprint Generator
    ↓
Final Result
```

The orchestration layer coordinates the workflow but should not contain the internal reasoning logic of individual agents.

Its responsibilities can include:

- Workflow sequencing
- Agent invocation
- RAG invocation
- State transitions
- Error propagation
- Retry handling
- Result assembly

---

## `shared/`

The `shared/` directory contains functionality that is reused across multiple AI modules.

Examples include:

- Common data types
- Shared constants
- Custom exceptions
- Logging utilities
- Tracing utilities
- Common helper functions

Code should only be placed in `shared/` when it is genuinely required by multiple components.

---

## AI Workflow

At a high level, the AI subsystem operates as follows:

```text
                    User Project Idea
                           ↓
                   Backend / API Layer
                           ↓
                     Orchestration
                           ↓
                  Requirement Analysis
                           ↓
                     Clarification
                           ↓
                           RAG
                            │
             ┌──────────────┴──────────────┐
             ↓                             ↓
      Knowledge Retrieval            Workflow State
             ↓
        Relevant Context
             ↓
        AI Agent Reasoning
             ↓
         LLM Execution
             ↓
       Critic / Validation
             ↓
      Blueprint Generation
             ↓
        Structured Output
```

---

## Module Responsibilities

| Module | Responsibility |
|---|---|
| `agents/` | Specialised AI reasoning tasks |
| `rag/` | Retrieve relevant ML knowledge |
| `llm/` | Communicate with language models |
| `prompts/` | Store AI instructions and prompt templates |
| `state/` | Maintain workflow and session information |
| `orchestration/` | Control AI workflow execution |
| `shared/` | Provide reusable AI utilities and types |

---

## Design Principles

### Separation of Concerns

Each module should have one clear responsibility.

```text
Agents          → Reason
RAG             → Retrieve knowledge
LLM             → Execute model requests
Prompts         → Define instructions
State           → Remember workflow information
Orchestration   → Coordinate execution
Shared          → Provide reusable components
```

### Modularity

Components should communicate through clear interfaces instead of depending directly on internal implementations.

### Traceability

Important AI outputs and retrieved information should retain enough metadata to identify where they originated.

### Testability

RAG components, agents, LLM communication, state management, and orchestration should be independently testable.

### Maintainability

AI logic, prompts, retrieval logic, and infrastructure should remain separated so changes to one component do not unnecessarily affect others.

---

## Relationship With Other BuildMyML Modules

The AI module does not operate independently from the rest of BuildMyML.

```text
Frontend
   ↓
Backend
   ↓
AI Module
   ↓
RAG + Agents + LLM
   ↓
Structured Result
   ↓
Backend
   ↓
Frontend
```

The frontend collects user input and displays results.

The backend exposes APIs and manages communication with the AI subsystem.

The `ai/` module performs the intelligent processing required to transform the user's ML idea into structured recommendations and project information.

---

## Project

**BuildMyML — An Intelligent Prompt-Based AutoML Project Generation Framework**

The `ai/` directory represents the intelligence layer of BuildMyML and provides the foundation for retrieval, reasoning, validation, and AI-driven ML project generation.
