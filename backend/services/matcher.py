import math
import logging
from typing import List, Dict, Any, Optional
from backend.config import settings

logger = logging.getLogger("JobMatcher")

class JobMatcherService:
    def __init__(self):
        self.openai_key = settings.OPENAI_API_KEY

    async def get_embedding(self, text: str) -> List[float]:
        """
        Retrieves embedding vector from OpenAI API. Fallbacks to mock embedding if key is empty.
        """
        if not self.openai_key or self.openai_key == "your_openai_key_here":
            return self._get_mock_embedding(text)
        
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=self.openai_key)
            response = await client.embeddings.create(
                model="text-embedding-3-small",
                input=[text]
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"OpenAI embedding retrieval failed: {e}")
            return self._get_mock_embedding(text)

    def _get_mock_embedding(self, text: str) -> List[float]:
        """
        Generates a deterministic vector of length 1536 based on text hashing,
        allowing database queries using pgvector to run normally.
        """
        # Deterministic dummy embedding calculation
        vector = [0.0] * 1536
        text_sum = sum(ord(c) for c in text)
        for i in range(1536):
            vector[i] = math.sin(text_sum + i) * 0.05
        # Normalize vector
        magnitude = math.sqrt(sum(x*x for x in vector))
        if magnitude > 0:
            vector = [x / magnitude for x in vector]
        return vector

    def calculate_compatibility(
        self, 
        seeker_skills: List[str], 
        job_mandatory_skills: List[str], 
        job_optional_skills: List[str],
        semantic_similarity: float
    ) -> float:
        """
        Computes compatibility score:
        - 60% semantic similarity from embedding
        - 40% skills correlation (30% mandatory skills, 10% optional skills)
        """
        # Ensure semantic similarity is bounded [0, 1]
        semantic_score = max(0.0, min(1.0, semantic_similarity))
        
        seeker_skills_set = {s.lower().strip() for s in seeker_skills}
        
        # Mandatory Skills score (30%)
        mandatory_score = 1.0
        if job_mandatory_skills:
            matched_mandatory = sum(
                1 for s in job_mandatory_skills if s.lower().strip() in seeker_skills_set
            )
            mandatory_score = matched_mandatory / len(job_mandatory_skills)
            
        # Optional Skills score (10%)
        optional_score = 1.0
        if job_optional_skills:
            matched_optional = sum(
                1 for s in job_optional_skills if s.lower().strip() in seeker_skills_set
            )
            optional_score = matched_optional / len(job_optional_skills)
            
        # Combined score calculation (0 - 100)
        final_score = (semantic_score * 0.60 + mandatory_score * 0.30 + optional_score * 0.10) * 100.0
        return round(min(100.0, max(0.0, final_score)), 2)

    def compute_cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Helper to calculate cosine similarity between two lists of floats."""
        if not vec1 or not vec2 or len(vec1) != len(vec2):
            return 0.0
        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        norm_a = math.sqrt(sum(a * a for a in vec1))
        norm_b = math.sqrt(sum(b * b for b in vec2))
        if norm_a == 0.0 or norm_b == 0.0:
            return 0.0
        return dot_product / (norm_a * norm_b)

job_matcher_service = JobMatcherService()
