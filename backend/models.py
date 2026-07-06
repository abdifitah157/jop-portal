import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, Boolean, Text, Table, JSON, UUID
from sqlalchemy.orm import relationship
from backend.database import Base
from datetime import datetime
from backend.config import settings

# Conditional database column types to support SQLite & Postgres
if "sqlite" in settings.DATABASE_URL:
    JSONType = JSON
    UUIDType = UUID(as_uuid=True)
    EmbeddingType = JSON
else:
    from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
    from pgvector.sqlalchemy import Vector
    JSONType = JSONB
    UUIDType = PG_UUID(as_uuid=True)
    EmbeddingType = Vector(1536)

# Association Table for Profile <-> Skills (Many-to-Many)
profile_skills = Table(
    'profile_skills',
    Base.metadata,
    Column('profile_id', UUIDType, ForeignKey('profiles.id', ondelete='CASCADE'), primary_key=True),
    Column('skill_id', UUIDType, ForeignKey('skills.id', ondelete='CASCADE'), primary_key=True),
    Column('proficiency', String(50), default='Intermediate')
)

# Association Table for Job <-> Skills (Many-to-Many)
job_skills = Table(
    'job_skills',
    Base.metadata,
    Column('job_id', UUIDType, ForeignKey('jobs.id', ondelete='CASCADE'), primary_key=True),
    Column('skill_id', UUIDType, ForeignKey('skills.id', ondelete='CASCADE'), primary_key=True),
    Column('is_mandatory', Boolean, default=False)
)

class User(Base):
    __tablename__ = 'users'

    id = Column(UUIDType, primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    phone_number = Column(String(50))
    role = Column(String(50), nullable=False, default='seeker') # 'seeker', 'employer', 'admin'
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    profile = relationship("Profile", uselist=False, back_populates="user", cascade="all, delete")
    jobs = relationship("Job", back_populates="employer", cascade="all, delete")
    applications = relationship("Application", back_populates="seeker", cascade="all, delete")

class Profile(Base):
    __tablename__ = 'profiles'

    id = Column(UUIDType, primary_key=True, default=uuid.uuid4)
    user_id = Column(UUIDType, ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    current_title = Column(String(255))
    location = Column(String(255))
    summary = Column(Text)
    resume_url = Column(String(512))
    profile_score = Column(Numeric(5, 2), default=0.00)
    metadata_json = Column('metadata', JSONType) # stores education history, experience history
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="profile")
    skills = relationship("Skill", secondary=profile_skills, back_populates="profiles")
    ai_analyses = relationship("AIAnalysis", back_populates="profile", cascade="all, delete")

class Skill(Base):
    __tablename__ = 'skills'

    id = Column(UUIDType, primary_key=True, default=uuid.uuid4)
    name = Column(String(255), unique=True, nullable=False, index=True)
    category = Column(String(100), default='General')

    # Relationships
    profiles = relationship("Profile", secondary=profile_skills, back_populates="skills")
    jobs = relationship("Job", secondary=job_skills, back_populates="skills")

class Job(Base):
    __tablename__ = 'jobs'

    id = Column(UUIDType, primary_key=True, default=uuid.uuid4)
    employer_id = Column(UUIDType, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    company_name = Column(String(255), nullable=False)
    location = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False) # 'Full-time', 'Part-time', 'Contract', 'Remote'
    salary_range = Column(String(100))
    required_metadata = Column(JSONType) # parsed qualifications, etc.
    embedding = Column(EmbeddingType) # 1536-dim vector for embeddings
    status = Column(String(50), default='active') # 'active', 'closed'
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    employer = relationship("User", back_populates="jobs")
    skills = relationship("Skill", secondary=job_skills, back_populates="jobs")
    applications = relationship("Application", back_populates="job", cascade="all, delete")
    ai_analyses = relationship("AIAnalysis", back_populates="job", cascade="all, delete")

class Application(Base):
    __tablename__ = 'applications'

    id = Column(UUIDType, primary_key=True, default=uuid.uuid4)
    job_id = Column(UUIDType, ForeignKey('jobs.id', ondelete='CASCADE'), nullable=False)
    seeker_id = Column(UUIDType, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    status = Column(String(50), default='Applied') # 'Applied', 'Shortlisted', 'Interviewing', 'Rejected', 'Offered'
    match_percentage = Column(Numeric(5, 2), default=0.00)
    cover_letter = Column(Text)
    applied_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    job = relationship("Job", back_populates="applications")
    seeker = relationship("User", back_populates="applications")
    ai_analysis = relationship("AIAnalysis", uselist=False, back_populates="application", cascade="all, delete")

    @property
    def seeker_name(self) -> str:
        if self.seeker and self.seeker.profile:
            return self.seeker.profile.full_name
        return "Codsade"

    @property
    def seeker_email(self) -> str:
        if self.seeker:
            return self.seeker.email
        return ""

class AIAnalysis(Base):
    __tablename__ = 'ai_analysis'

    id = Column(UUIDType, primary_key=True, default=uuid.uuid4)
    application_id = Column(UUIDType, ForeignKey('applications.id', ondelete='CASCADE'), unique=True)
    profile_id = Column(UUIDType, ForeignKey('profiles.id', ondelete='CASCADE'), nullable=False)
    job_id = Column(UUIDType, ForeignKey('jobs.id', ondelete='CASCADE'), nullable=False)
    score_breakdown = Column(Text)
    skill_gap = Column(JSONType) # {matching_skills: [...], missing_skills: [...]}
    course_recommendations = Column(JSONType) # [{title, provider, url}, ...]
    analyzed_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    application = relationship("Application", back_populates="ai_analysis")
    profile = relationship("Profile", back_populates="ai_analyses")
    job = relationship("Job", back_populates="ai_analyses")

class Course(Base):
    __tablename__ = 'courses'

    id = Column(UUIDType, primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    provider = Column(String(100), nullable=False)
    url = Column(String(512), nullable=False)
    tags = Column(JSONType, nullable=False) # e.g. ["Python", "Backend"]
