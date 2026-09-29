import uuid
from datetime import datetime

from pydantic import BaseModel


class LayerOut(BaseModel):
    id: uuid.UUID
    name: str
    target_crs: str
    reprojection_method: str | None = None
    feature_count: int
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class LayerUploadResponse(BaseModel):
    data_source_id: uuid.UUID
    layer_id: uuid.UUID
    job_id: uuid.UUID
    status: str
    message: str


class JobOut(BaseModel):
    id: uuid.UUID
    job_type: str
    layer_id: uuid.UUID | None
    status: str
    error_message: str | None = None
    started_at: datetime | None = None
    finished_at: datetime | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class GeoJSONFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    features: list[dict]
