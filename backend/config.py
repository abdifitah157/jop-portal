import os
from pathlib import Path
from dotenv import load_dotenv

# Load from current directory or fallback to parent config directory .env
load_dotenv()
env_path = Path(__file__).resolve().parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path, override=True)

class Settings:
    PROJECT_NAME: str = "ShaqoDooon"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./shaqodoon.db")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "supersecretjwtkeyforlocaldevelopmentshaqodoon")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

settings = Settings()
