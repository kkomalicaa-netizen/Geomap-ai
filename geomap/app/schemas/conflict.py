import uuid
from datetime import datetime

from pydantic import BaseModel


class ConflictOut(BaseModel):
    id: uuid.UUID
    feature_a_id: uuid.UUID
    feature_b_id: uuid.UUID
    conflict_type: str
    severity: str
    overlap_ratio: float | None = None
    distance_m: float | None = None
    confidence: float | None = None
    recommended_action: str
    created_at: datetime

    model_config = {"from_attributes": True}


class TrustScoreOut(BaseModel):
    layer_id: uuid.UUID
    source_reliability: float
    freshness: float
    spatial_alignment: float
    geometry_quality: float
    attribute_completeness: float
    score: float
    band: str
    computed_at: datetime

    model_config = {"from_attributes": True}
