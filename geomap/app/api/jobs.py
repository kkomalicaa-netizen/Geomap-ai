from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser, require_role
from app.core.database import get_db
from app.models.layer import ProcessingJob
from app.schemas.layer import JobOut
from app.services.harmonization_service import harmonize_layer

router = APIRouter(prefix="/api/v1/jobs", tags=["jobs"])


class LayerJobRequest(BaseModel):
    layer_id: uuid.UUID


@router.post("/harmonize", response_model=JobOut)
def trigger_harmonize(
    payload: LayerJobRequest,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(require_role("ADMIN", "GOVERNMENT", "URBAN_PLANNER")),
):
    """Synchronous for the MVP (small demo datasets) — return the finished job.
    Move to BackgroundTasks/a queue if layers grow past demo scale.
    """
    try:
        job = harmonize_layer(db, payload.layer_id)
    except ValueError as exc:
        raise HTTPException(404, str(exc)) from exc
    return job


@router.post("/repair", response_model=JobOut)
def trigger_repair(
    payload: LayerJobRequest,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(require_role("ADMIN", "GOVERNMENT", "URBAN_PLANNER")),
):
    """Geometry repair is folded into harmonize_layer (it always repairs after
    reprojecting) — exposed as its own endpoint per README §7's API surface.
    """
    try:
        job = harmonize_layer(db, payload.layer_id)
    except ValueError as exc:
        raise HTTPException(404, str(exc)) from exc
    return job


@router.get("/{job_id}", response_model=JobOut)
def get_job(
    job_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(require_role(
        "ADMIN", "GOVERNMENT", "URBAN_PLANNER", "DISASTER_TEAM", "CITIZEN"
    )),
):
    job = db.get(ProcessingJob, job_id)
    if job is None:
        raise HTTPException(404, "Job not found")
    return job
