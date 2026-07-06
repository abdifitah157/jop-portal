from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.database import engine, Base
from backend.api import auth, profiles, jobs, applications

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Somali Market AI-Powered Job Matching & Career Guidance Portal",
    version="1.0.0"
)

# Set up CORS origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, configure specific allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router, prefix="/api")
app.include_router(profiles.router, prefix="/api")
app.include_router(jobs.router, prefix="/api")
app.include_router(applications.router, prefix="/api")

@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} Backend API Portal",
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    }

@app.on_event("startup")
async def startup():
    # Attempt DB structure initialization on start
    async with engine.begin() as conn:
        # In a real environment, we'd run migrations, but for the MVP prototype,
        # automatic metadata initialization is perfect.
        try:
            await conn.run_sync(Base.metadata.create_all)
            print("PostgreSQL tables successfully verified/created.")
        except Exception as e:
            print(f"Database initialization warning: {e}. Ensure PostgreSQL is running.")
