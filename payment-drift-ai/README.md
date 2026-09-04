# Payment Drift AI

Payment Drift AI is a research prototype for identifying deteriorating repayment behavior from the UCI Default of Credit Card Clients dataset. Every number traces to a real public dataset and a real trained model — nothing is fabricated.

The dashboard presents precomputed real statistics, held-out logistic-regression validation, model-estimated revenue exposure, and simulated recovery actions. Monetary values are displayed in ₹ after a disclosed NT$ to INR conversion; this is not Razorpay merchant data.

Read the complete provenance, calculations, limitations, and production considerations in the [Data & Methodology page](/methodology) when the app is running.

## Live demo

Deployment target: Vercel. A live URL will be added after the project is connected to an authenticated Vercel account.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. The login is demo-only: any non-empty email and password enter the dashboard.

## Validation

```bash
npm run build
npm run lint
```

## Running the backend

The local FastAPI service lives in `backend/` and uses SQLite by default. Install its dependencies, initialize the database, and start Uvicorn:

```bash
cd backend
python -m pip install -r requirements.txt
python init_db.py
python -m uvicorn main:app --reload --port 8000
```

Startup also creates any missing tables and seeds the five audit events, so `python init_db.py` is optional after the first run. The seed is skipped when audit events already exist.

Copy `backend/.env.example` to `backend/.env` to change `DATABASE_URL` or the frontend `CORS_ORIGIN`. SQLite is the local default; moving to Postgres is a connection-string and deployment configuration change, but production migrations and operational controls are not included here.

The backend currently exposes `/api/health`, demo login/session persistence, recovery-action persistence, and audit-event retrieval. Recovery Actions sends simulated decisions to the backend and displays a session-local recovery counter; it never changes the fixed Overview revenue-at-risk KPI. The frontend still reads its real analytics artifact client-side; the What-If simulator and model-backed `/api/predict` integration are deferred until the original training script and model artifact are present.

The current repository contains the generated frontend data artifact `src/data/realStats.json`, but does not include the Python training script or raw UCI input used to generate it. Reproducible Python pipeline tests require those source files to be added.

Known limitation: the prototype uses a static precomputed JSON artifact and demo-only session login; Vercel free-tier cold starts may add a brief initial loading delay.
