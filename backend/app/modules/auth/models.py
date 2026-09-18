from uuid import uuid4

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func

from app.core.database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    username = Column(String(50), unique=True)
    name = Column(String(100))
    email = Column(String(254), unique=True)
    app_color = Column(String(10), nullable=False, default="blue", server_default="blue")
    password_hash = Column(String(300))
    recovery_hash = Column(String(64))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class LoginSession(Base):
    __tablename__ = "login_sessions"
    token_hash = Column(String(64), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)


class PasswordReset(Base):
    __tablename__ = "password_resets"
    token_hash = Column(String(64), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)


class AuthLimit(Base):
    __tablename__ = "auth_limits"
    key = Column(String(64), primary_key=True)
    started_at = Column(DateTime(timezone=True), nullable=False)
    attempts = Column(Integer, nullable=False)
