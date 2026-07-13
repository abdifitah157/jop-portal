from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_
from sqlalchemy.orm import selectinload
from typing import List, Optional
from backend.database import get_db
from backend.models import User, Job, Skill, job_skills
from backend.schemas import JobCreate, JobResponse
from backend.api.auth import get_current_employer, get_current_user
from backend.services.matcher import job_matcher_service

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
async def create_job(
    job_in: JobCreate,
    current_employer: User = Depends(get_current_employer),
    db: AsyncSession = Depends(get_db)
):
    # Construct combined text for embedding representation
    combined_text = f"Title: {job_in.title}\nCompany: {job_in.company_name}\nLocation: {job_in.location}\nType: {job_in.type}\nDescription: {job_in.description}\nSkills: {', '.join(job_in.skills + job_in.mandatory_skills)}"
    
    # Generate Embedding vector (1536 floats)
    embedding_vector = await job_matcher_service.get_embedding(combined_text)

    db_job = Job(
        employer_id=current_employer.id,
        title=job_in.title,
        description=job_in.description,
        company_name=job_in.company_name,
        location=job_in.location,
        type=job_in.type,
        salary_range=job_in.salary_range,
        embedding=embedding_vector,
        required_metadata={
            "experience_required": "1-3 years",
            "education": "Bachelor's Degree preferred"
        }
    )
    db_job.skills = []  # Pre-initialize to avoid lazy-load on new object
    db.add(db_job)
    await db.flush()

    # Match and Link skills
    all_input_skills = list(set(job_in.skills + job_in.mandatory_skills))
    for skill_name in all_input_skills:
        skill_name_clean = skill_name.strip()
        if not skill_name_clean:
            continue
        # Get or create
        sk_result = await db.execute(select(Skill).filter(Skill.name == skill_name_clean))
        skill = sk_result.scalars().first()
        if not skill:
            skill = Skill(name=skill_name_clean, category="General")
            db.add(skill)
            await db.flush()
        
        # Link and check if mandatory
        is_mandatory = skill_name_clean in job_in.mandatory_skills
        db_job.skills.append(skill)
        
        # Write to join table detail for mandatory flag
        # (Alternately, metadata stores details, but simple insertion works)
        
    await db.commit()
    # Re-fetch with selectinload to avoid lazy-load MissingGreenlet on serialization
    result = await db.execute(
        select(Job).options(selectinload(Job.skills)).filter(Job.id == db_job.id)
    )
    return result.scalars().first()

@router.get("", response_model=List[JobResponse])
async def list_jobs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Job)
        .options(selectinload(Job.skills))
        .filter(Job.status == "active")
        .order_by(Job.created_at.desc())
    )
    return result.scalars().all()

@router.get("/search", response_model=List[JobResponse])
async def search_jobs(
    q: str = Query(..., description="Semantic search query"),
    location: Optional[str] = Query(None),
    type: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves jobs semantic similarity search using query vector comparison.
    Fallbacks to keyword text-search if vector computation is missing.
    """
    query_vector = await job_matcher_service.get_embedding(q)

    # Bypass vector search if using SQLite to avoid compile-time exceptions
    from backend.config import settings
    if "sqlite" in settings.DATABASE_URL:
        query = select(Job).options(selectinload(Job.skills)).filter(Job.status == "active")
        
        q_terms = [f"%{term.strip()}%" for term in q.split() if term.strip()]
        if q_terms:
            conditions = []
            for term in q_terms:
                conditions.append(Job.title.ilike(term))
                conditions.append(Job.description.ilike(term))
                conditions.append(Job.company_name.ilike(term))
            query = query.filter(or_(*conditions))
            
        if location:
            query = query.filter(Job.location.ilike(f"%{location}%"))
        if type:
            query = query.filter(Job.type == type)
            
        result = await db.execute(query.limit(10))
        return result.scalars().all()

    try:
        # Standard pgvector query: cosine_distance (0 is perfect match, 2 is worst)
        # Sort ascending by distance (descending similarity)
        query = select(Job).options(selectinload(Job.skills)).filter(Job.status == "active")
        
        if location:
            query = query.filter(Job.location.ilike(f"%{location}%"))
        if type:
            query = query.filter(Job.type == type)

        # Ordering by pgvector cosine distance
        query = query.order_by(Job.embedding.cosine_distance(query_vector)).limit(10)
        
        result = await db.execute(query)
        jobs = result.scalars().all()
        return jobs
    except Exception as e:
        # Fallback to standard SQL text matching
        print(f"Vector search failed, falling back to text search: {e}")
        query = select(Job).options(selectinload(Job.skills)).filter(Job.status == "active")
        
        # Splitting terms for dynamic search
        q_terms = [f"%{term.strip()}%" for term in q.split() if term.strip()]
        if q_terms:
            conditions = []
            for term in q_terms:
                conditions.append(Job.title.ilike(term))
                conditions.append(Job.description.ilike(term))
                conditions.append(Job.company_name.ilike(term))
            query = query.filter(or_(*conditions))
            
        if location:
            query = query.filter(Job.location.ilike(f"%{location}%"))
        if type:
            query = query.filter(Job.type == type)
            
        result = await db.execute(query.limit(10))
        return result.scalars().all()

@router.get("/{job_id}", response_model=JobResponse)
async def get_job(job_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Job).options(selectinload(Job.skills)).filter(Job.id == job_id)
    )
    job = result.scalars().first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job position not found."
        )
    return job
