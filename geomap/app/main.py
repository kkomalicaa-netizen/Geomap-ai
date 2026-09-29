from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api import auth, conflicts, disaster, jobs, layers
from app.core.database import engine

app = FastAPI(
    title="GeoMap AI — Backend",
    description="Automated integration & harmonization of multi-source geospatial data.",
    version="0.1.0",
)

# MVP: wide-open CORS for local/demo frontend on a different port.
# Tighten to specific origins before any real deployment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(layers.router)
app.include_router(jobs.router)
app.include_router(conflicts.router)
app.include_router(disaster.router)


@app.get("/api/v1/health", tags=["health"])
def health_check():
    """Phase 1 done-criterion: confirms the API is up AND can reach PostGIS."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as exc:  # noqa: BLE001
        db_status = f"unreachable: {exc}"

    return {"status": "ok", "database": db_status}
