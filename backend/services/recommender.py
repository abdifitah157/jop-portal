import logging
import json
from typing import List, Dict, Any, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from backend.config import settings
from backend.models import Course

logger = logging.getLogger("CareerGuidance")

class CareerGuidanceService:
    def __init__(self):
        self.openai_key = settings.OPENAI_API_KEY
        self.gemini_key = settings.GEMINI_API_KEY

    async def generate_guidance(
        self,
        db: AsyncSession,
        seeker_skills: List[str],
        job_title: str,
        job_description: str,
        job_mandatory_skills: List[str],
        job_optional_skills: List[str]
    ) -> Tuple[str, Dict[str, Any], List[Dict[str, Any]]]:
        """
        Calculates skill gap, queries corresponding courses, and generates 
        personalized guidance statements via LLM API or local fallback.
        """
        seeker_skills_set = {s.lower().strip() for s in seeker_skills}
        all_job_skills = list(set(job_mandatory_skills + job_optional_skills))
        
        # 1. Determine skill gap
        matching_skills = [s for s in all_job_skills if s.lower().strip() in seeker_skills_set]
        missing_skills = [s for s in all_job_skills if s.lower().strip() not in seeker_skills_set]
        
        skill_gap = {
            "matching_skills": matching_skills,
            "missing_skills": missing_skills
        }

        # 2. Fetch course recommendations from DB
        recommended_courses = []
        if missing_skills:
            # Query courses where tag intersections match missing skills
            result = await db.execute(select(Course))
            all_courses = result.scalars().all()
            
            missing_lower = {s.lower().strip() for s in missing_skills}
            for course in all_courses:
                course_tags = [t.lower().strip() for t in (course.tags or [])]
                # If course overlaps with any missing skill tag, recommend it
                if any(tag in missing_lower for tag in course_tags):
                    recommended_courses.append({
                        "title": course.title,
                        "provider": course.provider,
                        "url": course.url
                    })

        # 3. Generate detailed breakdown using AI
        breakdown = ""
        if self.gemini_key:
            breakdown = await self._generate_with_gemini(job_title, missing_skills, matching_skills)
        elif self.openai_key:
            breakdown = await self._generate_with_openai(job_title, missing_skills, matching_skills)
            
        if not breakdown:
            breakdown = self._generate_local_fallback(job_title, missing_skills, matching_skills)

        return breakdown, skill_gap, recommended_courses

    async def _generate_with_gemini(self, job_title: str, missing: List[str], matching: List[str]) -> Optional[str]:
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.gemini_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            prompt = self._build_prompt(job_title, missing, matching)
            response = model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Gemini guidance generation failed: {e}")
            return None

    async def _generate_with_openai(self, job_title: str, missing: List[str], matching: List[str]) -> Optional[str]:
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=self.openai_key)
            
            prompt = self._build_prompt(job_title, missing, matching)
            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "value": "You are a professional career guidance counselor and career coach."},
                    {"role": "user", "content": prompt}
                ]
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"OpenAI guidance generation failed: {e}")
            return None

    def _build_prompt(self, job_title: str, missing: List[str], matching: List[str]) -> str:
        return f"""
Provide professional, encouraging, and structured career development guidance for a candidate applying for a '{job_title}' position.
The candidate currently matches the following skills: {', '.join(matching) if matching else 'None'}.
However, the candidate is missing the following skills required for this job: {', '.join(missing) if missing else 'None'}.

Offer 2-3 specific action items detailing how they can bridge this gap and optimize their chances of landing this job. Keep the tone inspiring and highly professional.
"""

    def _generate_local_fallback(self, job_title: str, missing: List[str], matching: List[str]) -> str:
        """A simple, professional rule-based counselor fallback."""
        if not missing:
            return f"Fantastic work! You have all the core skills matching the '{job_title}' position requirements. We recommend brushing up on your resume layout and preparing for behavior-focused interview questions."
        
        advice = f"You are a strong candidate for the '{job_title}' role, matching keys skills like {', '.join(matching) if matching else 'general administration'}.\n\n"
        advice += f"To maximize your compatibility, we suggest focusing on acquiring training in: {', '.join(missing)}.\n\n"
        advice += "Recommended Actions:\n"
        advice += f"1. Enroll in specialized online modules linked in the Learning Hub below to learn {missing[0]}.\n"
        if len(missing) > 1:
            advice += f"2. Build a small personal project implementing {missing[1]} to showcase practical familiarity.\n"
        else:
            advice += "2. Update your digital profile to highlight any relative work exposure.\n"
        
        return advice

career_guidance_service = CareerGuidanceService()
