from __future__ import annotations

import json
import os
import uuid
from datetime import datetime, timezone

from geoalchemy2.shape import from_shape
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.layer import DataSource, LayerFeature, ProcessingJob, SpatialLayer
from spatial_pipeline.crs import harmonize_crs
from spatial_pipeline.geometry_repair import drop_empty_geometries, repair_geometries
from spatial_pipeline.io import read_source_file


def create_upload_records(
    db: Session,
    filename: str,
    source_name: str,
    source_type: str,
    uploaded_by: uuid.UUID | None,
) -> tuple[DataSource, SpatialLayer, ProcessingJob]:
    """Create the DataSource/SpatialLayer/ProcessingJob rows synchronously so
    the upload endpoint can return real IDs immediately. The actual parsing
    happens afterwards in `run_background_ingestion`, in its own DB session.
    """
    data_source = DataSource(
        name=source_name,
        source_type=source_type,
        original_filename=filename,
        uploaded_by=uploaded_by,
    )
    db.add(data_source)
    db.flush()

    layer = SpatialLayer(
        data_source_id=data_source.id,
        name=source_name,
        target_crs=settings.PROJECT_CRS,
        status="PENDING",
    )
    db.add(layer)
    db.flush()

    job = ProcessingJob(job_type="INGEST", layer_id=layer.id, status="QUEUED")
    db.add(job)
    db.commit()
    db.refresh(data_source)
    db.refresh(layer)
    db.refresh(job)
    return data_source, layer, job


def run_background_ingestion(
    job_id: uuid.UUID,
    layer_id: uuid.UUID,
    data_source_id: uuid.UUID,
    file_path: str,
    filename: str,
) -> None:
    """Runs in a FastAPI BackgroundTask, i.e. after the HTTP response has
    already been sent — so it opens its OWN session rather than reusing the
    request's (which is closed by then). This is the MVP background-task
    approach README §7 describes; swap for Celery/RQ + Redis before scaling
    past demo load.
    """
    db = SessionLocal()
    try:
        job = db.get(ProcessingJob, job_id)
        layer = db.get(SpatialLayer, layer_id)
        data_source = db.get(DataSource, data_source_id)

        job.status = "RUNNING"
        job.started_at = datetime.now(timezone.utc)
        layer.status = "PROCESSING"
        db.commit()

        gdf = read_source_file(file_path, filename)
        harmonized, original_crs, method = harmonize_crs(gdf, settings.PROJECT_CRS)
        repaired, repair_actions = repair_geometries(harmonized)
        repaired, repair_actions = drop_empty_geometries(repaired, repair_actions)

        # Store features in WGS84 for serving as GeoJSON (README §8 uses SRID 4326).
        storable = repaired.to_crs(settings.STORAGE_CRS)

        for i, row in storable.iterrows():
            geom = row.geometry
            attrs = {
                k: _json_safe(v)
                for k, v in row.drop(labels=[storable.geometry.name]).items()
            }
            db.add(
                LayerFeature(
                    layer_id=layer.id,
                    geom=from_shape(geom, srid=4326),
                    centroid=from_shape(geom.centroid, srid=4326),
                    bbox=from_shape(geom.envelope, srid=4326) if geom.geom_type != "Point" else None,
                    attributes=attrs,
                    repair_actions=repair_actions[i],
                )
            )

        data_source.original_crs = original_crs
        layer.reprojection_method = method
        layer.feature_count = len(storable)
        layer.status = "READY"
        job.status = "DONE"
        job.finished_at = datetime.now(timezone.utc)

    except Exception as exc:  # noqa: BLE001 - surfaced via job.error_message
        db.rollback()
        job = db.get(ProcessingJob, job_id)
        layer = db.get(SpatialLayer, layer_id)
        if layer is not None:
            layer.status = "FAILED"
        if job is not None:
            job.status = "FAILED"
            job.error_message = str(exc)
            job.finished_at = datetime.now(timezone.utc)

    finally:
        db.commit()
        db.close()
        if os.path.exists(file_path):
            os.remove(file_path)


def _json_safe(value):
    """Coerce pandas/numpy scalars into JSON-serializable Python types."""
    try:
        json.dumps(value)
        return value
    except TypeError:
        return str(value)
