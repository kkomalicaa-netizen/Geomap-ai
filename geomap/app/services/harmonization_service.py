from __future__ import annotations

import uuid

import geopandas as gpd
from geoalchemy2.shape import from_shape, to_shape
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.layer import LayerFeature, ProcessingJob, SpatialLayer
from spatial_pipeline.crs import harmonize_crs
from spatial_pipeline.geometry_repair import repair_geometries


def harmonize_layer(db: Session, layer_id: uuid.UUID) -> ProcessingJob:
    """Re-run CRS harmonization + geometry repair on a layer's stored features.

    Useful when PROJECT_CRS changes, or to (re)apply repair logic after a fix,
    without re-uploading the source file.
    """
    layer = db.get(SpatialLayer, layer_id)
    if layer is None:
        raise ValueError(f"Layer {layer_id} not found")

    job = ProcessingJob(job_type="HARMONIZE", layer_id=layer.id, status="RUNNING")
    db.add(job)
    layer.status = "PROCESSING"
    db.commit()
    db.refresh(job)

    try:
        features = db.query(LayerFeature).filter(LayerFeature.layer_id == layer.id).all()
        if not features:
            raise ValueError("Layer has no features to harmonize")

        shapes = [to_shape(f.geom) for f in features]
        gdf = gpd.GeoDataFrame({"id": [f.id for f in features]}, geometry=shapes, crs=settings.STORAGE_CRS)

        working, _, method = harmonize_crs(gdf, settings.PROJECT_CRS)
        repaired, repair_actions = repair_geometries(working)
        back_to_storage = repaired.to_crs(settings.STORAGE_CRS)

        for i, feature in enumerate(features):
            feature.geom = from_shape(back_to_storage.geometry.iloc[i], srid=4326)
            feature.centroid = from_shape(back_to_storage.geometry.iloc[i].centroid, srid=4326)
            feature.repair_actions = list(set(feature.repair_actions or []) | set(repair_actions[i]))

        layer.reprojection_method = method
        layer.status = "READY"
        job.status = "DONE"

    except Exception as exc:  # noqa: BLE001
        layer.status = "FAILED"
        job.status = "FAILED"
        job.error_message = str(exc)

    db.commit()
    db.refresh(job)
    return job
