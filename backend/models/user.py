import uuid
from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from backend.database import Base
from datetime import datetime

class User(Base):
    __tablename__ = 'users'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    phone_number = Column(String(50))
    role = Column(String(50), nullable=False, default='seeker') # 'seeker', 'employer', 'admin'
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    profile = relationship("Profile", uselist=False, back_populates="user", cascade="all, delete")
    jobs = relationship("Job", back_populates="employer", cascade="all, delete")
    applications = relationship("Application", back_populates="seeker", cascade="all, delete")
