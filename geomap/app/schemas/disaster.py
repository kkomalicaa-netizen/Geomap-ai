import uuid

from pydantic import BaseModel


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str


class ShelterOut(BaseModel):
    id: uuid.UUID
    name: str
    capacity: int
    is_open: bool
    latitude: float
    longitude: float
    score: float | None = None

    model_config = {"from_attributes": True}


class RouteRequest(BaseModel):
    origin_lat: float
    origin_lng: float
    shelter_id: uuid.UUID | None = None  # if omitted, route to best-ranked open shelter


class RouteResponse(BaseModel):
    shelter_id: uuid.UUID
    shelter_name: str
    total_cost: float
    path_coordinates: list[tuple[float, float]]  # [(lat, lng), ...]
