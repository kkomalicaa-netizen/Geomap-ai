from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser, require_role
from app.core.database import get_db
from app.models.conflict import Conflict
from app.schemas.conflict import ConflictOut, TrustScoreOut
from app.services.conflict_service import compare_layers
from app.services.trust_score_service import compute_layer_trust_score

router = APIRouter(prefix="/api/v1", tags=["conflicts"])

VIEW_ROLES = ("ADMIN", "GOVERNMENT", "URBAN_PLANNER", "DISASTER_TEAM")


class CompareLayersRequest(BaseModel):
    layer_a_id: uuid.UUID
    layer_b_id: uuid.UUID


@router.post("/conflicts/detect", response_model=list[ConflictOut])
def detect_conflicts_endpoint(
    payload: CompareLayersRequest,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(require_role("ADMIN", "GOVERNMENT", "URBAN_PLANNER")),
):
    try:
        conflicts = compare_layers(db, payload.layer_a_id, payload.layer_b_id)
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    return conflicts


@router.get("/conflicts", response_model=list[ConflictOut])
def list_conflicts(
    severity: str | None = None,
    conflict_type: str | None = None,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(require_role(*VIEW_ROLES)),
):
    query = db.query(Conflict)
    if severity:
        query = query.filter(Conflict.severity == severity.upper())
    if conflict_type:
        query = query.filter(Conflict.conflict_type == conflict_type.upper())
    return query.order_by(Conflict.created_at.desc()).all()


@router.get("/conflicts/{conflict_id}", response_model=ConflictOut)
def get_conflict(
    conflict_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(require_role(*VIEW_ROLES)),
):
    conflict = db.get(Conflict, conflict_id)
    if conflict is None:
        raise HTTPException(404, "Conflict not found")
    return conflict


@router.get("/analytics/trust-score/{layer_id}", response_model=TrustScoreOut)
def get_trust_score(
    layer_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(require_role(*VIEW_ROLES, "CITIZEN")),
):
    try:
        score = compute_layer_trust_score(db, layer_id)
    except ValueError as exc:
        raise HTTPException(404, str(exc)) from exc
    return score
