import asyncio
import os
import sys
import re

# Add project root to python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from backend.database import engine, Base
from backend.models import * # Ensure all models are imported for metadata compilation
from backend.config import settings

async def main():
    print("Initializing SQLite database...")
    
    # 1. Re-create all tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
        print("Database schema verified/created successfully.")

    # 2. Seed initial data
    seed_path = os.path.join(os.path.dirname(__file__), 'sql', 'seed.sql')
    if not os.path.exists(seed_path):
        print(f"Error: Seed file not found at {seed_path}")
        return

    print("Reading and executing seed.sql...")
    with open(seed_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Clean up PostgreSQL-specific casts for SQLite compatibility
    content = content.replace('::jsonb', '')

    # For courses: since SQLite doesn't have a native uuid_generate_v4() default, 
    # we can programmatically add UUIDs to the insert statement
    if "sqlite" in settings.DATABASE_URL:
        new_insert = "INSERT INTO courses (id, title, provider, url, tags) VALUES\n"
        new_insert += "('c1111111-1111-1111-1111-111111111111', 'Python for Everybody Specialization', 'Coursera', 'https://www.coursera.org/specializations/python', '[\"Python\", \"Programming\"]'),\n"
        new_insert += "('c2222222-2222-2222-2222-222222222222', 'Modern React with Redux [2026 Update]', 'Udemy', 'https://www.udemy.com/course/react-redux/', '[\"React.js\", \"Next.js\", \"Javascript\"]'),\n"
        new_insert += "('c3333333-3333-3333-3333-333333333333', 'Financial Modeling & Valuation Analyst (FMVA)®', 'CFI', 'https://corporatefinanceinstitute.com/certifications/financial-modeling-valuation-analyst-fmva/', '[\"Financial Modeling\", \"Excel\"]'),\n"
        new_insert += "('c4444444-4444-4444-4444-444444444444', 'FastAPI: Build Modern Python Web APIs', 'Udemy', 'https://www.udemy.com/course/fastapi-modern-python-web-apis/', '[\"FastAPI\", \"Python\", \"SQL\"]'),\n"
        new_insert += "('c5555555-5555-5555-5555-555555555555', 'Interaction Design Specialization', 'Coursera / UC San Diego', 'https://www.coursera.org/specializations/interaction-design', '[\"UI/UX Design\", \"Figma\"]')"
        
        content = re.sub(
            r"INSERT INTO courses \(title, provider, url, tags\) VALUES.*?ON CONFLICT DO NOTHING",
            new_insert + "\nON CONFLICT DO NOTHING",
            content,
            flags=re.DOTALL
        )

    # Split statements by semicolon followed by newline
    statements = [stmt.strip() for stmt in content.split(';') if stmt.strip()]

    async with engine.begin() as conn:
        for stmt in statements:
            # Filter out comments and blank lines
            lines = [line for line in stmt.split("\n") if not line.strip().startswith("--")]
            clean_stmt = "\n".join(lines).strip()
            if not clean_stmt:
                continue
            
            try:
                await conn.execute(text(clean_stmt))
            except Exception as e:
                print(f"Warning executing statement: {e}")
                print(f"Statement: {clean_stmt[:120]}...\n")

    print("Fixing null timestamps for SQLite compatibility...")
    async with engine.begin() as conn:
        await conn.execute(text("UPDATE jobs SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;"))
        await conn.execute(text("UPDATE applications SET applied_at = CURRENT_TIMESTAMP WHERE applied_at IS NULL;"))
        await conn.execute(text("UPDATE profiles SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL;"))
        await conn.execute(text("UPDATE ai_analysis SET analyzed_at = CURRENT_TIMESTAMP WHERE analyzed_at IS NULL;"))

    print("Database seeding completed successfully!")
    await engine.dispose()

if __name__ == '__main__':
    asyncio.run(main())
