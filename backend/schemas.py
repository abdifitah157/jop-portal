from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Any
from uuid import UUID
from datetime import datetime

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    phone_number: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role: str = Field(..., description="Must be 'seeker' or 'employer'")

class UserResponse(UserBase):
    id: UUID
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

# --- Skill Schemas ---
class SkillBase(BaseModel):
    name: str
    category: Optional[str] = "General"

class SkillCreate(SkillBase):
    pass

class SkillResponse(SkillBase):
    id: UUID

    class Config:
        from_attributes = True

# --- Profile Schemas ---
class ProfileBase(BaseModel):
    full_name: str
    current_title: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    current_title: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None
    skills: Optional[List[str]] = None
    education: Optional[List[Any]] = None
    experience: Optional[List[Any]] = None

class ProfileResponse(ProfileBase):
    id: UUID
    user_id: UUID
    resume_url: Optional[str] = None
    profile_score: float
    metadata_json: Optional[Any] = Field(None, validation_alias="metadata_json", serialization_alias="metadata")
    skills: List[SkillResponse] = []
    updated_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True

# --- Job Schemas ---
class JobBase(BaseModel):
    title: str
    description: str
    company_name: str
    location: str
    type: str
    salary_range: Optional[str] = None

class JobCreate(JobBase):
    skills: List[str] = Field([], description="List of required skill names")
    mandatory_skills: List[str] = Field([], description="List of mandatory skill names")

class JobResponse(JobBase):
    id: UUID
    employer_id: UUID
    status: str
    created_at: datetime
    skills: List[SkillResponse] = []

    class Config:
        from_attributes = True

# --- Application Schemas ---
class ApplicationCreate(BaseModel):
    job_id: UUID
    cover_letter: Optional[str] = None

class ApplicationUpdate(BaseModel):
    status: str

class ApplicationResponse(BaseModel):
    id: UUID
    job_id: UUID
    seeker_id: UUID
    seeker_name: Optional[str] = None
    seeker_email: Optional[str] = None
    status: str
    match_percentage: float
    cover_letter: Optional[str] = None
    applied_at: datetime

    class Config:
        from_attributes = True

# --- AI Analysis Schemas ---
class AIAnalysisResponse(BaseModel):
    id: UUID
    application_id: UUID
    profile_id: UUID
    job_id: UUID
    score_breakdown: Optional[str] = None
    skill_gap: Optional[Any] = None
    course_recommendations: Optional[Any] = None
    analyzed_at: datetime

    class Config:
        from_attributes = True

# --- Course Schemas ---
class CourseResponse(BaseModel):
    id: UUID
    title: str
    provider: str
    url: str
    tags: List[str] = []

    class Config:
        from_attributes = True
