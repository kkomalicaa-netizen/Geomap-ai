import uuid

from sqlalchemy import Column, Float, ForeignKey, String, DateTime, func
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class Conflict(Base):
    __tablename__ = "conflicts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    feature_a_id = Column(UUID(as_uuid=True), ForeignKey("layer_features.id", ondelete="CASCADE"))
    feature_b_id = Column(UUID(as_uuid=True), ForeignKey("layer_features.id", ondelete="CASCADE"))
    conflict_type = Column(String, nullable=False)
    severity = Column(String, nullable=False)  # LOW | MEDIUM | HIGH
    overlap_ratio = Column(Float, nullable=True)
    distance_m = Column(Float, nullable=True)
    confidence = Column(Float, nullable=True)
    recommended_action = Column(String, default="manual_review")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class TrustScore(Base):
    __tablename__ = "trust_scores"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    layer_id = Column(UUID(as_uuid=True), ForeignKey("spatial_layers.id", ondelete="CASCADE"))
    source_reliability = Column(Float)
    freshness = Column(Float)
    spatial_alignment = Column(Float)
    geometry_quality = Column(Float)
    attribute_completeness = Column(Float)
    score = Column(Float, nullable=False)
    band = Column(String, nullable=False)  # VERY_HIGH|HIGH|MEDIUM|LOW|CRITICAL
    computed_at = Column(DateTime(timezone=True), server_default=func.now())
