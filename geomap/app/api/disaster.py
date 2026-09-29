from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser, require_role
from app.core.database import get_db
from app.schemas.disaster import RouteRequest, RouteResponse, ShelterOut
from app.services.disaster_service import rank_shelters, route_to_shelter, seed_demo_data

router = APIRouter(prefix="/api/v1/disaster", tags=["disaster"])

# README §18: disaster routing is open to every role, including CITIZEN.
ALL_ROLES = ("ADMIN", "GOVERNMENT", "URBAN_PLANNER", "DISASTER_TEAM", "CITIZEN")


@router.get("/shelters", response_model=list[ShelterOut])
def get_shelters(
    origin_lat: float = Query(..., description="Origin latitude"),
    origin_lng: float = Query(..., description="Origin longitude"),
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(require_role(*ALL_ROLES)),
):
    seed_demo_data(db)  # no-op after the first call
    ranked = rank_shelters(db, origin_lat, origin_lng)
    return [
        ShelterOut(
            id=r["id"], name=r["name"], capacity=r["capacity"], is_open=True,
            latitude=r["lat"], longitude=r["lng"], score=r["score"],
        )
        for r in ranked
    ]


@router.post("/route", response_model=RouteResponse)
def get_route(
    payload: RouteRequest,
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(require_role(*ALL_ROLES)),
):
    seed_demo_data(db)
    try:
        result = route_to_shelter(db, payload.origin_lat, payload.origin_lng, payload.shelter_id)
    except ValueError as exc:
        raise HTTPException(404, str(exc)) from exc

    if result is None:
        raise HTTPException(404, "No reachable shelter found (all roads may be blocked)")

    return RouteResponse(**result)
