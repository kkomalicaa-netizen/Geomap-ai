from __future__ import annotations

from fastapi import APIRouter, HTTPException, status

from app.core.security import create_access_token, hash_password, verify_password
from app.schemas.disaster import LoginRequest, TokenResponse

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

# Demo-only in-memory users, one per README §18 role, so the RBAC permission
# table is testable without seeding a real users table first. Swap this for a
# `db.query(User).filter(User.email == ...)` lookup before anything real.
_DEMO_PASSWORD = "demo1234"
DEMO_USERS = {
    "admin@geomap.ai": {"role": "ADMIN", "hashed_password": hash_password(_DEMO_PASSWORD)},
    "gov@geomap.ai": {"role": "GOVERNMENT", "hashed_password": hash_password(_DEMO_PASSWORD)},
    "planner@geomap.ai": {"role": "URBAN_PLANNER", "hashed_password": hash_password(_DEMO_PASSWORD)},
    "disaster@geomap.ai": {"role": "DISASTER_TEAM", "hashed_password": hash_password(_DEMO_PASSWORD)},
    "citizen@geomap.ai": {"role": "CITIZEN", "hashed_password": hash_password(_DEMO_PASSWORD)},
}


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest):
    user = DEMO_USERS.get(payload.email)
    if user is None or not verify_password(payload.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password"
        )

    token = create_access_token(subject=payload.email, role=user["role"])
    return TokenResponse(access_token=token, role=user["role"])
