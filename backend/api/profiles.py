from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from backend.database import get_db
from backend.models import User, Profile, Skill, profile_skills
from backend.schemas import ProfileResponse, ProfileUpdate
from backend.api.auth import get_current_seeker, get_current_user
from backend.services.parser import cv_parser_service

router = APIRouter(prefix="/profiles", tags=["Profiles"])

@router.get("/me", response_model=ProfileResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Profile).options(selectinload(Profile.skills)).filter(Profile.user_id == current_user.id)
    )
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found."
        )
    return profile

@router.post("/upload-cv", response_model=ProfileResponse)
async def upload_cv(
    file: UploadFile = File(...),
    current_seeker: User = Depends(get_current_seeker),
    db: AsyncSession = Depends(get_db)
):
    # Validate extension
    ext = file.filename.split(".")[-1].lower()
    if ext not in ["pdf", "docx", "doc", "txt"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Upload PDF, DOCX or TXT files only."
        )

    # Read bytes and parse
    file_bytes = await file.read()
    parsed_data, profile_score = await cv_parser_service.parse_cv(file_bytes, file.filename)

    # Fetch Seeker Profile
    result = await db.execute(
        select(Profile).options(selectinload(Profile.skills)).filter(Profile.user_id == current_seeker.id)
    )
    profile = result.scalars().first()
    if not profile:
        profile = Profile(user_id=current_seeker.id, full_name=parsed_data.get("full_name", ""))
        profile.skills = []  # Pre-initialize to avoid lazy-load on new object
        db.add(profile)
        await db.flush()

    # Update profile fields
    profile.full_name = parsed_data.get("full_name") or profile.full_name
    profile.current_title = parsed_data.get("current_title") or profile.current_title
    profile.location = parsed_data.get("location") or profile.location
    profile.summary = parsed_data.get("summary") or profile.summary
    profile.profile_score = profile_score
    profile.resume_url = f"https://mock-storage.shaqodoon.ai/cvs/{current_seeker.id}_{file.filename}"
    
    # Pack education and experience metadata
    profile.metadata_json = {
        "education": parsed_data.get("education", []),
        "experience": parsed_data.get("experience", [])
    }

    # Handle Skills (Upsert & associate)
    skills_in = parsed_data.get("skills", [])
    profile_skills_list = []
    
    for skill_name in skills_in:
        skill_name_clean = skill_name.strip()
        if not skill_name_clean:
            continue
        # Find or create skill
        sk_result = await db.execute(select(Skill).filter(Skill.name == skill_name_clean))
        skill = sk_result.scalars().first()
        if not skill:
            skill = Skill(name=skill_name_clean, category="General")
            db.add(skill)
            await db.flush()
        
        # Link to profile (avoid duplicates)
        if skill not in profile.skills:
            profile.skills.append(skill)

    await db.commit()
    # Re-fetch with selectinload to avoid lazy-load MissingGreenlet on serialization
    result = await db.execute(
        select(Profile).options(selectinload(Profile.skills)).filter(Profile.id == profile.id)
    )
    return result.scalars().first()

@router.put("/me", response_model=ProfileResponse)
async def update_profile(
    profile_in: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Profile).options(selectinload(Profile.skills)).filter(Profile.user_id == current_user.id)
    )
    profile = result.scalars().first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found."
        )

    # Simple field updates
    if profile_in.full_name is not None:
        profile.full_name = profile_in.full_name
    if profile_in.current_title is not None:
        profile.current_title = profile_in.current_title
    if profile_in.location is not None:
        profile.location = profile_in.location
    if profile_in.summary is not None:
        profile.summary = profile_in.summary
    
    # Structure metadata updates
    meta = profile.metadata_json or {}
    if profile_in.education is not None:
        meta["education"] = profile_in.education
    if profile_in.experience is not None:
        meta["experience"] = profile_in.experience
    profile.metadata_json = meta

    # Re-evaluate profile completeness
    flat_profile_data = {
        "full_name": profile.full_name,
        "current_title": profile.current_title,
        "location": profile.location,
        "summary": profile.summary,
        "skills": [s.name for s in profile.skills],
        "education": meta.get("education", []),
        "experience": meta.get("experience", [])
    }
    profile.profile_score = cv_parser_service.calculate_score(flat_profile_data)

    await db.commit()
    # Re-fetch with selectinload to avoid lazy-load MissingGreenlet on serialization
    result = await db.execute(
        select(Profile).options(selectinload(Profile.skills)).filter(Profile.id == profile.id)
    )
    return result.scalars().first()
