import os
import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from collections.abc import Generator

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from models import AuditEvent, Base

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./payment_drift.db")
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


def seed_audit_events() -> None:
    init_db()
    stats_path = Path(__file__).resolve().parents[1] / "src" / "data" / "realStats.json"
    with stats_path.open(encoding="utf-8") as stats_file:
        stats = json.load(stats_file)
    with SessionLocal() as db:
        if db.query(AuditEvent).count() > 0:
            return
        descriptions = [
            f"Dataset loaded: {stats['dataset']['n_records']:,} records from {stats['dataset']['name']}",
            f"{stats['drift']['n_customers_drifting']:,} clients ({stats['drift']['pct_drifting']}%) show increasing repayment delay (OBSERVED)",
            f"{stats['n_customers_at_risk']:,} clients flagged as drifting + currently overdue (PREDICTED risk cohort)",
            f"Logistic regression evaluated on held-out test set: F1 = {stats['model_validation']['f1']}, recall = {stats['model_validation']['recall']} (model validation)",
            "Recovery action workflow available only in SIMULATED mode — no real transactions are triggered",
        ]
        inserted_at = datetime.now(timezone.utc)
        db.add_all([
            AuditEvent(event_type="pipeline", description=description, created_at=inserted_at + timedelta(seconds=index))
            for index, description in enumerate(descriptions)
        ])
        db.commit()


if __name__ == "__main__":
    seed_audit_events()
