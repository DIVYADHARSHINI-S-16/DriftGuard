import os
import secrets
import bcrypt as bcrypt_lib

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from database import SessionLocal, seed_audit_events
from models import AuditEvent, RecoveryAction, Session, User

app = FastAPI(title="DriftGuard API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("CORS_ORIGIN", "http://127.0.0.1:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def initialize_database():
    seed_audit_events()


@app.get("/api/health")
def health_check():
    """Return a lightweight liveness response for local development."""
    return {"status": "ok"}


@app.get("/api/debug/audit-events")
def debug_audit_events():
    """Return seeded events for local database verification."""
    with SessionLocal() as db:
        return [{"id": event.id, "event_type": event.event_type, "description": event.description, "created_at": event.created_at.isoformat()} for event in db.query(AuditEvent).order_by(AuditEvent.id).all()]


class LoginRequest(BaseModel):
    email: str = Field(min_length=1)
    password: str = Field(min_length=1)


class RecoveryActionRequest(BaseModel):
    action_type: str = Field(min_length=1)
    simulated_recovery_amount: float = Field(ge=0)


def current_user(authorization: str | None = Header(default=None)) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Demo session required")
    with SessionLocal() as db:
        session = db.get(Session, authorization.removeprefix("Bearer "))
        user = db.get(User, session.user_id) if session else None
        if not user:
            raise HTTPException(status_code=401, detail="Demo session required")
        return user


@app.post("/api/login")
def login(payload: LoginRequest):
    """Demo auth: any password is accepted for an existing or new user. Not a real authentication check."""
    with SessionLocal() as db:
        user = db.query(User).filter(User.email == payload.email.strip()).first()
        if not user:
            password_hash = bcrypt_lib.hashpw(payload.password[:72].encode(), bcrypt_lib.gensalt()).decode()
            user = User(email=payload.email.strip(), hashed_password=password_hash)
            db.add(user)
            db.flush()
        token = secrets.token_urlsafe(32)
        db.add(Session(id=token, user_id=user.id))
        db.commit()
        return {"session_token": token, "user_id": user.id}


@app.post("/api/logout")
def logout(authorization: str | None = Header(default=None)):
    if authorization and authorization.startswith("Bearer "):
        with SessionLocal() as db:
            session = db.get(Session, authorization.removeprefix("Bearer "))
            if session:
                db.delete(session)
                db.commit()
    return {"status": "ok"}


@app.get("/api/audit-events")
def audit_events(_: User = Depends(current_user)):
    with SessionLocal() as db:
        return [{"id": event.id, "event_type": event.event_type, "description": event.description, "created_at": event.created_at.isoformat()} for event in db.query(AuditEvent).order_by(AuditEvent.created_at, AuditEvent.id).all()]


@app.get("/api/recovery-actions")
def recovery_actions(user: User = Depends(current_user)):
    with SessionLocal() as db:
        return [{"id": action.id, "customer_id": action.customer_id, "action_type": action.action_type, "approved": action.approved, "simulated_recovery_amount": float(action.simulated_recovery_amount), "created_at": action.created_at.isoformat()} for action in db.query(RecoveryAction).filter(RecoveryAction.user_id == user.id).order_by(RecoveryAction.id).all()]


def record_recovery_action(customer_id: str, approved: bool, payload: RecoveryActionRequest, user: User):
    with SessionLocal() as db:
        action = RecoveryAction(user_id=user.id, customer_id=customer_id, action_type=payload.action_type, approved=approved, simulated_recovery_amount=payload.simulated_recovery_amount)
        db.add(action)
        db.flush()
        db.add(AuditEvent(event_type="recovery_action", description=f"Simulated recovery action {'approved' if approved else 'rejected'} for customer {customer_id}"))
        db.commit()
        return {"id": action.id, "approved": action.approved, "simulated_recovery_amount": float(action.simulated_recovery_amount)}


@app.post("/api/recovery-actions/{customer_id}/approve")
def approve_recovery_action(customer_id: str, payload: RecoveryActionRequest, user: User = Depends(current_user)):
    return record_recovery_action(customer_id, True, payload, user)


@app.post("/api/recovery-actions/{customer_id}/reject")
def reject_recovery_action(customer_id: str, payload: RecoveryActionRequest, user: User = Depends(current_user)):
    return record_recovery_action(customer_id, False, payload, user)
