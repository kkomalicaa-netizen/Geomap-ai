import uuid

from geoalchemy2 import Geometry
from sqlalchemy import Column, ForeignKey, Integer, String, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class DataSource(Base):
    __tablename__ = "data_sources"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"), nullable=True)
    source_type = Column(String, nullable=False)  # cadastral | revenue | gis | gnss | drone | disaster
    original_crs = Column(String, nullable=True)
    original_filename = Column(String, nullable=True)
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    layers = relationship("SpatialLayer", back_populates="data_source", cascade="all, delete")


class SpatialLayer(Base):
    __tablename__ = "spatial_layers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    data_source_id = Column(UUID(as_uuid=True), ForeignKey("data_sources.id", ondelete="CASCADE"))
    name = Column(String, nullable=False)
    target_crs = Column(String, nullable=False)
    reprojection_method = Column(String, nullable=True)
    feature_count = Column(Integer, default=0)
    status = Column(String, nullable=False, default="PENDING")  # PENDING|PROCESSING|READY|FAILED
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    data_source = relationship("DataSource", back_populates="layers")
    features = relationship("LayerFeature", back_populates="layer", cascade="all, delete")


class LayerFeature(Base):
    __tablename__ = "layer_features"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    layer_id = Column(UUID(as_uuid=True), ForeignKey("spatial_layers.id", ondelete="CASCADE"))
    geom = Column(Geometry(geometry_type="GEOMETRY", srid=4326), nullable=False)
    centroid = Column(Geometry(geometry_type="POINT", srid=4326), nullable=True)
    bbox = Column(Geometry(geometry_type="POLYGON", srid=4326), nullable=True)
    attributes = Column(JSONB, default=dict)
    repair_actions = Column(JSONB, default=list)
    source_timestamp = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    layer = relationship("SpatialLayer", back_populates="features")


class ProcessingJob(Base):
    __tablename__ = "processing_jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_type = Column(String, nullable=False)  # INGEST|HARMONIZE|REPAIR|CONFLICT_DETECT
    layer_id = Column(UUID(as_uuid=True), ForeignKey("spatial_layers.id", ondelete="CASCADE"))
    status = Column(String, nullable=False, default="QUEUED")  # QUEUED|RUNNING|DONE|FAILED
    error_message = Column(String, nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    finished_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
