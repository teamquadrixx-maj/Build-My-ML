from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ProjectCreate(BaseModel):
    project: str
    dataset: str
    target: str
    model: str


class ProjectOut(BaseModel):
    id: int
    project: str
    dataset: str
    target: str
    model: str
    blueprint_json: Optional[str] = None

    class Config:
        orm_mode = True
        from_attributes = True


class SessionStartRequest(BaseModel):
    idea: str = Field(..., min_length=1)


class ClarificationQuestion(BaseModel):
    id: str
    question: str


class SessionAnswerRequest(BaseModel):
    session_id: str
    question_id: str
    answer: str


class SessionState(BaseModel):
    session_id: str
    status: str
    idea: str
    requirements: Dict[str, Any] = Field(default_factory=dict)
    clarification_questions: List[ClarificationQuestion] = Field(default_factory=list)
    blueprint_id: Optional[str] = None
    critic_status: str = "planned"
    error: Optional[str] = None


class BlueprintRequest(BaseModel):
    session_id: str
    idea: str
    answers: Dict[str, str] = Field(default_factory=dict)


class StageOutput(BaseModel):
    name: str
    status: str
    explanation: str
    data: Dict[str, Any] = Field(default_factory=dict)


class BlueprintResponse(BaseModel):
    status: str
    blueprint_id: Optional[str] = None
    blueprint: Optional[Dict[str, Any]] = None
    message: Optional[str] = None
    critic_status: str = "planned"
    failed_stage: Optional[str] = None
    error: Optional[str] = None
    stage_statuses: Dict[str, str] = Field(default_factory=dict)
    stage_outputs: List[StageOutput] = Field(default_factory=list)


class SessionStartResponse(SessionState):
    pass
