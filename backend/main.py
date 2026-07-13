from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
try:
    from backend.config import settings
    from backend.database import engine, Base
    from backend.api import auth, profiles, jobs, applications
except ImportError:
    from config import settings
    from database import engine, Base
    from api import auth, profiles, jobs, applications

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Somali Market AI-Powered Job Matching & Career Guidance Portal",
    version="1.0.0",
    redirect_slashes=False
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
            print("Database tables successfully verified/created.")
            
            # Check if jobs table is empty
            from sqlalchemy import text
            import os
            
            result = await conn.execute(text("SELECT COUNT(*) FROM jobs"))
            count = result.scalar()
            if count == 0:
                print("Seeding database with default Somali jobs...")
                seed_path = os.path.join(os.path.dirname(__file__), 'sql', 'seed.sql')
                if os.path.exists(seed_path):
                    with open(seed_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Clean up casts if any
                    content = content.replace('::jsonb', '')
                    
                    # Split and execute statements one by one (per-statement error handling)
                    statements = [stmt.strip() for stmt in content.split(';') if stmt.strip()]
                    success_count = 0
                    for stmt in statements:
                        lines = [line for line in stmt.split("\n") if not line.strip().startswith("--")]
                        clean_stmt = "\n".join(lines).strip()
                        if clean_stmt:
                            try:
                                await conn.execute(text(clean_stmt))
                                success_count += 1
                            except Exception as stmt_err:
                                print(f"Seed statement warning (continuing): {stmt_err}")
                                print(f"Statement preview: {clean_stmt[:100]}")
                    
                    # Fix SQLite timestamps
                    try:
                        await conn.execute(text("UPDATE jobs SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;"))
                        await conn.execute(text("UPDATE applications SET applied_at = CURRENT_TIMESTAMP WHERE applied_at IS NULL;"))
                        await conn.execute(text("UPDATE profiles SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL;"))
                        await conn.execute(text("UPDATE ai_analysis SET analyzed_at = CURRENT_TIMESTAMP WHERE analyzed_at IS NULL;"))
                    except Exception as ts_err:
                        print(f"Timestamp fix warning: {ts_err}")
                    print(f"Database seeding completed: {success_count} statements executed.")
                else:
                    print(f"Seed file not found at {seed_path}")
        except Exception as e:
            print(f"Database initialization warning: {e}. Ensure database is running.")

