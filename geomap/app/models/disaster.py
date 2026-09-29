import uuid

from geoalchemy2 import Geometry
from sqlalchemy import Column, Boolean, Float, ForeignKey, Integer, String, DateTime, func
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class Shelter(Base):
    __tablename__ = "shelters"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    geom = Column(Geometry(geometry_type="POINT", srid=4326), nullable=False)
    capacity = Column(Integer, default=0)
    is_open = Column(Boolean, default=True)


class Road(Base):
    __tablename__ = "roads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=True)
    geom = Column(Geometry(geometry_type="LINESTRING", srid=4326), nullable=False)
    is_blocked = Column(Boolean, default=False)
    hazard_level = Column(Float, default=0)


class Resource(Base):
    __tablename__ = "resources"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    geom = Column(Geometry(geometry_type="POINT", srid=4326), nullable=False)
    quantity = Column(Integer, default=0)


class Route(Base):
    __tablename__ = "routes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    origin = Column(Geometry(geometry_type="POINT", srid=4326), nullable=False)
    shelter_id = Column(UUID(as_uuid=True), ForeignKey("shelters.id"), nullable=True)
    geom = Column(Geometry(geometry_type="LINESTRING", srid=4326), nullable=True)
    total_cost = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
