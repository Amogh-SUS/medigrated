import sqlite3
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime


DATABASE_URL = "sqlite:///./chat_history.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, index=True)
    role = Column(String)  # "user" or "assistant"
    message = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)

class UserProfile(Base):
    __tablename__ = "user_profiles"
    session_id = Column(String, primary_key=True, unique=True, index=True)
    city = Column(String, nullable=True)

class ConversationSummary(Base):
    __tablename__ = "conversation_summaries"

    id = Column(Integer, primary_key=True)
    session_id = Column(String, index=True, unique=True)
    summary = Column(Text)
    updated_at = Column(DateTime, default=datetime.utcnow)


def init_db():
    Base.metadata.create_all(bind=engine)

def save_user_city(session_id: str, city: str):
    db = SessionLocal()

    profile = db.query(UserProfile).filter_by(session_id=session_id).first()

    if profile:
        profile.city = city
    else:
        profile = UserProfile(session_id=session_id, city=city)
        db.add(profile)

    db.commit()
    db.close()


def get_user_city(session_id: str):
    db = SessionLocal()
    profile = db.query(UserProfile).filter_by(session_id=session_id).first()
    db.close()

    return profile.city if profile else None

def save_summary(session_id: str, summary_text: str):
    db = SessionLocal()
    summary_entry = db.query(ConversationSummary).filter_by(session_id=session_id).first()

    if summary_entry:
        summary_entry.summary = summary_text
        summary_entry.updated_at = datetime.utcnow()
    else:
        summary_entry = ConversationSummary(session_id=session_id, summary=summary_text)
        db.add(summary_entry)

    db.commit()
    db.close()