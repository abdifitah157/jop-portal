from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from uuid import UUID
from backend.database import get_db
from backend.models import User, Job, Profile, Application, AIAnalysis, Skill
from backend.schemas import ApplicationResponse, ApplicationCreate, ApplicationUpdate, AIAnalysisResponse
from backend.api.auth import get_current_seeker, get_current_employer, get_current_user
from backend.services.matcher import job_matcher_service
from backend.services.recommender import career_guidance_service

router = APIRouter(prefix="/applications", tags=["Applications"])

@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def submit_application(
    app_in: ApplicationCreate,
    current_seeker: User = Depends(get_current_seeker),
    db: AsyncSession = Depends(get_db)
):
    try:
        # 1. Verify Job exists (convert UUID to str for SQLite compatibility)
        job_id_str = str(app_in.job_id)
        job_result = await db.execute(
            select(Job).options(selectinload(Job.skills)).filter(Job.id == job_id_str)
        )
        job = job_result.scalars().first()
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job listing not found."
            )

        # Check for existing application
        exist_result = await db.execute(
            select(Application).filter(
                Application.job_id == job.id, 
                Application.seeker_id == current_seeker.id
            )
        )
        if exist_result.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You have already applied for this position."
            )

        # 2. Get Seeker Profile details
        prof_result = await db.execute(
            select(Profile).options(selectinload(Profile.skills)).filter(Profile.user_id == current_seeker.id)
        )
        profile = prof_result.scalars().first()
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please complete your profile details before applying."
            )

        # 3. Perform AI Matching Engine Calculations
        seeker_skills_list = [s.name for s in profile.skills]
        
        # Extract job skills splits (using mock metadata or direct table query)
        # For now, let's treat all job skills as potential match points. We can check which ones are mandatory.
        # In our database, the join table holds mandatory columns. We can query relations:
        job_mandatory = []
        job_optional = []
        # To keep simple, let's assume skills are optional unless we load is_mandatory.
        # We can fetch skills association flags from a helper query:
        from backend.models import job_skills
        join_result = await db.execute(
            select(Skill.name, job_skills.c.is_mandatory)
            .join(job_skills)
            .filter(job_skills.c.job_id == job.id)
        )
        skills_with_flags = join_result.all()
        for s_name, is_mand in skills_with_flags:
            if is_mand:
                job_mandatory.append(s_name)
            else:
                job_optional.append(s_name)

        # Get semantic similarity score from embeddings
        semantic_sim = 0.70 # Default fallback
        if profile.summary and job.description:
            # Calculate local cosine similarity or pull from database engine
            seeker_summary_embedding = await job_matcher_service.get_embedding(profile.summary)
            semantic_sim = job_matcher_service.compute_cosine_similarity(seeker_summary_embedding, job.embedding)

        # Compute compatibility percentage
        match_pct = job_matcher_service.calculate_compatibility(
            seeker_skills=seeker_skills_list,
            job_mandatory_skills=job_mandatory,
            job_optional_skills=job_optional,
            semantic_similarity=semantic_sim
        )

        # 4. Create Application record
        db_app = Application(
            job_id=job.id,
            seeker_id=current_seeker.id,
            status="Applied",
            match_percentage=match_pct,
            cover_letter=app_in.cover_letter
        )
        db.add(db_app)
        await db.flush()

        # 5. Generate AI Career Guidance and Skill-Gap recommendations
        guidance_text, skill_gap, courses = await career_guidance_service.generate_guidance(
            db=db,
            seeker_skills=seeker_skills_list,
            job_title=job.title,
            job_description=job.description,
            job_mandatory_skills=job_mandatory,
            job_optional_skills=job_optional
        )

        # Save to Cache analysis table
        db_analysis = AIAnalysis(
            application_id=db_app.id,
            profile_id=profile.id,
            job_id=job.id,
            score_breakdown=guidance_text,
            skill_gap=skill_gap,
            course_recommendations=courses
        )
        db.add(db_analysis)
        
        await db.commit()
        
        # Reload with relationships
        res = await db.execute(
            select(Application)
            .options(selectinload(Application.seeker).selectinload(User.profile))
            .filter(Application.id == db_app.id)
        )
        return res.scalars().first()
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database or server error in submit_application: {str(e)}"
        )

@router.get("", response_model=List[ApplicationResponse])
async def list_applications(
    job_id: Optional[UUID] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Lists applications.
    - Seekers: Lists their submitted applications.
    - Employers: Lists applicants for a specific job_id, sorted descending by match_percentage.
    """
    if current_user.role == "seeker":
        result = await db.execute(
            select(Application)
            .options(selectinload(Application.seeker).selectinload(User.profile))
            .filter(Application.seeker_id == current_user.id)
            .order_by(Application.applied_at.desc())
        )
        return result.scalars().all()
        
    elif current_user.role == "employer":
        if not job_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Employer queries must provide a job_id parameter."
            )
        
        # Verify employer owns the job
        job_check = await db.execute(
            select(Job).filter(Job.id == job_id, Job.employer_id == current_user.id)
        )
        if not job_check.scalars().first():
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not own this job listing."
            )
            
        # Candidates ranked automatically by AI matching engine (highest match percentage first)
        result = await db.execute(
            select(Application)
            .options(selectinload(Application.seeker).selectinload(User.profile))
            .filter(Application.job_id == job_id)
            .order_by(Application.match_percentage.desc())
        )
        return result.scalars().all()
        
    else:
        # Admin
        result = await db.execute(
            select(Application)
            .options(selectinload(Application.seeker).selectinload(User.profile))
        )
        return result.scalars().all()

@router.get("/{app_id}/analysis", response_model=AIAnalysisResponse)
async def get_application_ai_analysis(
    app_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Fetches career guidance & skill gap analysis reports."""
    result = await db.execute(
        select(AIAnalysis).filter(AIAnalysis.application_id == app_id)
    )
    analysis = result.scalars().first()
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AI analysis report not generated yet."
        )
        
    # Verify access rights
    if current_user.role == "seeker":
        # Ensure user owns the application
        app_res = await db.execute(select(Application).filter(Application.id == app_id))
        app = app_res.scalars().first()
        if not app or app.seeker_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied."
            )
            
    return analysis

@router.put("/{app_id}", response_model=ApplicationResponse)
async def update_application_status(
    app_id: UUID,
    app_in: ApplicationUpdate,
    current_employer: User = Depends(get_current_employer),
    db: AsyncSession = Depends(get_db)
):
    """Allows companies/employers to change applicant statuses (Shortlisted, Rejected, etc)."""
    result = await db.execute(
        select(Application).options(selectinload(Application.job)).filter(Application.id == app_id)
    )
    application = result.scalars().first()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application record not found."
        )
        
    # Verify ownership
    if application.job.employer_id != current_employer.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to manage applicants for this job."
        )
        
    application.status = app_in.status
    await db.commit()
    
    res = await db.execute(
        select(Application)
        .options(selectinload(Application.seeker).selectinload(User.profile))
        .filter(Application.id == app_id)
    )
    return res.scalars().first()
