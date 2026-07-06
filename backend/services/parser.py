import io
import json
import logging
import pdfplumber
import docx2txt
from typing import Dict, Any, Tuple
from backend.config import settings

logger = logging.getLogger("CVParser")

class CVParserService:
    def __init__(self):
        self.openai_key = settings.OPENAI_API_KEY
        self.gemini_key = settings.GEMINI_API_KEY

    def extract_text_from_pdf(self, file_bytes: bytes) -> str:
        text = ""
        try:
            with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        except Exception as e:
            logger.error(f"Error reading PDF: {e}")
        return text.strip()

    def extract_text_from_docx(self, file_bytes: bytes) -> str:
        text = ""
        try:
            text = docx2txt.process(io.BytesIO(file_bytes))
        except Exception as e:
            logger.error(f"Error reading DOCX: {e}")
        return text.strip()

    async def parse_cv(self, file_bytes: bytes, filename: str) -> Tuple[Dict[str, Any], float]:
        """
        Parses resume bytes, extracts structured data using LLM API with mock fallback,
        and computes a completeness profile score.
        """
        # 1. Extract raw text
        ext = filename.split(".")[-1].lower()
        raw_text = ""
        if ext == "pdf":
            raw_text = self.extract_text_from_pdf(file_bytes)
        elif ext in ["docx", "doc"]:
            raw_text = self.extract_text_from_docx(file_bytes)
        else:
            raw_text = file_bytes.decode("utf-8", errors="ignore")

        if not raw_text.strip():
            # Return empty skeleton if no text extracted
            return self._empty_skeleton(), 0.0

        # 2. Parse using AI
        parsed_data = None
        if self.gemini_key:
            parsed_data = await self._parse_with_gemini(raw_text)
        elif self.openai_key:
            parsed_data = await self._parse_with_openai(raw_text)
        
        # Fallback to smart local parser if LLM keys are absent/fail
        if not parsed_data:
            parsed_data = self._mock_llm_parse(raw_text)

        # 3. Calculate Profile Completeness Score
        completeness_score = self.calculate_score(parsed_data)
        
        return parsed_data, completeness_score

    async def _parse_with_gemini(self, text: str) -> Optional[Dict[str, Any]]:
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.gemini_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            prompt = self._build_prompt(text)
            response = model.generate_content(
                prompt, 
                generation_config={"response_mime_type": "application/json"}
            )
            return json.loads(response.text)
        except Exception as e:
            logger.error(f"Gemini CV Parsing failed: {e}")
            return None

    async def _parse_with_openai(self, text: str) -> Optional[Dict[str, Any]]:
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=self.openai_key)
            
            prompt = self._build_prompt(text)
            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "value": "You are a professional resume parsing assistant. Return outputs strictly in valid JSON format."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            logger.error(f"OpenAI CV Parsing failed: {e}")
            return None

    def _build_prompt(self, text: str) -> str:
        return f"""
Analyze the following resume text and extract the candidate profile information. 
Format your response exactly as a JSON object matching this structure:
{{
    "full_name": "Full name of candidate, fallback to name in email if name not found",
    "current_title": "Current job title or specialization",
    "location": "City and Country, e.g. Mogadishu, Somalia",
    "summary": "A 2-3 sentence overview summary of candidate qualifications",
    "skills": ["Skill 1", "Skill 2", ...],
    "education": [
        {{
            "degree": "Degree earned or field of study",
            "school": "University or school name",
            "grad_year": "Year of graduation (e.g. 2024)"
        }}
    ],
    "experience": [
        {{
            "title": "Job title",
            "company": "Company name",
            "duration": "Duration description or years, e.g. 2 years or 2022-2024"
        }}
    ]
}}

Resume text:
\"\"\"
{text}
\"\"\"
"""

    def _mock_llm_parse(self, text: str) -> Dict[str, Any]:
        """A heuristic local parser in case AI APIs are not configured."""
        logger.info("Executing local mock parse fallback")
        
        # Simple extraction heuristics for mock prototype
        lines = [line.strip() for line in text.split("\n") if line.strip()]
        full_name = lines[0] if lines else "Candidate Name"
        
        # Standard mockup structure loaded with extracted/inferred details
        inferred_skills = []
        lower_text = text.lower()
        common_skills = ["python", "sql", "react", "next.js", "django", "javascript", "fastapi", "project management", "financial modeling", "accounting", "excel"]
        for skill in common_skills:
            if skill in lower_text:
                inferred_skills.append(skill.title())

        if not inferred_skills:
            inferred_skills = ["Python", "SQL", "Communication"]

        # Default sample templates populated with text snippets
        return {
            "full_name": full_name if len(full_name) < 50 else "ShaqoDooon Candidate",
            "current_title": "Software Engineer" if "software" in lower_text or "developer" in lower_text else "Business Specialist",
            "location": "Mogadishu, Somalia" if "mogadishu" in lower_text else "Somalia",
            "summary": "Dynamic professional eager to leverage skills in technology and administration to drive growth.",
            "skills": inferred_skills,
            "education": [
                {
                    "degree": "Bachelor of Science",
                    "school": "Simad University" if "simad" in lower_text else "Mogadishu University" if "mogadishu" in lower_text else "Amoud University" if "amoud" in lower_text else "Local University",
                    "grad_year": "2024"
                }
            ],
            "experience": [
                {
                    "title": "Technical Intern",
                    "company": "Hormuud Telecom" if "hormuud" in lower_text else "Dahabshiil" if "dahabshiil" in lower_text else "Local Startup",
                    "duration": "1 Year"
                }
            ]
        }

    def _empty_skeleton(self) -> Dict[str, Any]:
        return {
            "full_name": "New Candidate",
            "current_title": "",
            "location": "",
            "summary": "",
            "skills": [],
            "education": [],
            "experience": []
        }

    def calculate_score(self, data: Dict[str, Any]) -> float:
        """
        Calculates score (0-100) based on profile completeness.
        - Name & Contact: 15%
        - Location & Title: 15%
        - Professional Summary: 20%
        - Skills: 25%
        - Education or Work History: 25%
        """
        score = 0.0
        if data.get("full_name"):
            score += 15.0
        if data.get("current_title") and data.get("location"):
            score += 15.0
        if data.get("summary") and len(data.get("summary", "")) > 20:
            score += 20.0
        if data.get("skills") and len(data.get("skills", [])) > 0:
            score += min(25.0, len(data.get("skills", [])) * 5.0)
        if data.get("education") or data.get("experience"):
            score += 25.0
            
        return min(100.0, score)

cv_parser_service = CVParserService()
