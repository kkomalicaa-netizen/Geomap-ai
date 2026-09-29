from __future__ import annotations

import uuid

import geopandas as gpd
from geoalchemy2.shape import to_shape
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.conflict import Conflict
from app.models.layer import LayerFeature, SpatialLayer
from spatial_pipeline.conflict.engine import detect_conflicts


def _layer_to_gdf(db: Session, layer_id: uuid.UUID) -> tuple[gpd.GeoDataFrame, list[LayerFeature]]:
    features = db.query(LayerFeature).filter(LayerFeature.layer_id == layer_id).all()
    shapes = [to_shape(f.geom) for f in features]
    gdf = gpd.GeoDataFrame(
        {"attributes": [f.attributes for f in features]}, geometry=shapes, crs=settings.STORAGE_CRS
    )
    return gdf, features


def compare_layers(db: Session, layer_a_id: uuid.UUID, layer_b_id: uuid.UUID) -> list[Conflict]:
    """Run the conflict engine between two layers and persist results.

    Layers are reprojected to PROJECT_CRS (a projected/metric CRS) before
    comparison — comparing in WGS84 degrees would make distance/area
    thresholds meaningless.
    """
    gdf_a, features_a = _layer_to_gdf(db, layer_a_id)
    gdf_b, features_b = _layer_to_gdf(db, layer_b_id)

    if gdf_a.empty or gdf_b.empty:
        raise ValueError("Both layers must have features to compare")

    gdf_a_proj = gdf_a.to_crs(settings.PROJECT_CRS)
    gdf_b_proj = gdf_b.to_crs(settings.PROJECT_CRS)

    raw_conflicts = detect_conflicts(
        gdf_a_proj,
        gdf_b_proj,
        overlap_threshold=settings.OVERLAP_CONFLICT_THRESHOLD,
        displacement_threshold_m=settings.DISPLACEMENT_THRESHOLD_M,
    )

    persisted: list[Conflict] = []
    for rc in raw_conflicts:
        feature_a = features_a[rc["feature_a_index"]]
        feature_b = features_b[rc["feature_b_index"]]
        conflict = Conflict(
            feature_a_id=feature_a.id,
            feature_b_id=feature_b.id,
            conflict_type=rc["conflict_type"],
            severity=rc["severity"],
            overlap_ratio=rc["overlap_ratio"],
            distance_m=rc["distance_m"],
            confidence=rc["confidence"],
            recommended_action=rc["recommended_action"],
        )
        db.add(conflict)
        persisted.append(conflict)

    db.commit()
    for c in persisted:
        db.refresh(c)
    return persisted
