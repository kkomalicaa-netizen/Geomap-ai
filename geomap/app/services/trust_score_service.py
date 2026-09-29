from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.conflict import Conflict, TrustScore
from app.models.layer import DataSource, LayerFeature, SpatialLayer
from spatial_pipeline.scoring.trust_score import (
    attribute_completeness_from_row,
    compute_trust_score,
)

# Static reliability by source type — MVP placeholder for a real departmental
# trust registry. Tune these per README §11's "Source Reliability" component.
SOURCE_RELIABILITY_BY_TYPE = {
    "cadastral": 90.0,
    "revenue": 85.0,
    "gis": 80.0,
    "gnss": 92.0,
    "drone": 75.0,
    "disaster": 70.0,
}

EXPECTED_ATTRIBUTE_FIELDS = ["parcel_id", "owner", "area", "land_use"]


def compute_layer_trust_score(db: Session, layer_id: uuid.UUID) -> TrustScore:
    layer = db.get(SpatialLayer, layer_id)
    if layer is None:
        raise ValueError(f"Layer {layer_id} not found")

    data_source = db.get(DataSource, layer.data_source_id)
    features = db.query(LayerFeature).filter(LayerFeature.layer_id == layer_id).all()
    if not features:
        raise ValueError("Layer has no features to score")

    source_reliability = SOURCE_RELIABILITY_BY_TYPE.get(
        (data_source.source_type if data_source else "").lower(), 70.0
    )
    freshness = _freshness_score(data_source.uploaded_at if data_source else None)
    geometry_quality = _geometry_quality_score(features)
    attribute_completeness = _attribute_completeness_score(features)
    spatial_alignment = _spatial_alignment_score(db, features)

    result = compute_trust_score(
        source_reliability=source_reliability,
        freshness=freshness,
        spatial_alignment=spatial_alignment,
        geometry_quality=geometry_quality,
        attribute_completeness=attribute_completeness,
    )

    trust_score = TrustScore(
        layer_id=layer_id,
        source_reliability=result.source_reliability,
        freshness=result.freshness,
        spatial_alignment=result.spatial_alignment,
        geometry_quality=result.geometry_quality,
        attribute_completeness=result.attribute_completeness,
        score=result.score,
        band=result.band,
    )
    db.add(trust_score)
    db.commit()
    db.refresh(trust_score)
    return trust_score


def _freshness_score(uploaded_at: datetime | None) -> float:
    if uploaded_at is None:
        return 50.0
    now = datetime.now(timezone.utc)
    age_days = (now - uploaded_at.replace(tzinfo=timezone.utc)).days
    # Full marks under 30 days old, linear decay to 0 by 2 years.
    if age_days <= 30:
        return 100.0
    return max(0.0, 100.0 - (age_days - 30) / 730 * 100.0)


def _geometry_quality_score(features: list[LayerFeature]) -> float:
    from spatial_pipeline.scoring.trust_score import geometry_quality_from_repairs

    per_feature = [geometry_quality_from_repairs(f.repair_actions or []) for f in features]
    return round(sum(per_feature) / len(per_feature), 2)


def _attribute_completeness_score(features: list[LayerFeature]) -> float:
    per_feature = [
        attribute_completeness_from_row(f.attributes or {}, EXPECTED_ATTRIBUTE_FIELDS)
        for f in features
    ]
    return round(sum(per_feature) / len(per_feature), 2)


def _spatial_alignment_score(db: Session, features: list[LayerFeature]) -> float:
    """Proxy: fraction of this layer's features that are NOT implicated in a
    HIGH-severity conflict."""
    feature_ids = {f.id for f in features}
    if not feature_ids:
        return 100.0
    high_conflicts = (
        db.query(Conflict)
        .filter(Conflict.severity == "HIGH")
        .filter(
            (Conflict.feature_a_id.in_(feature_ids)) | (Conflict.feature_b_id.in_(feature_ids))
        )
        .all()
    )
    flagged = {c.feature_a_id for c in high_conflicts} | {c.feature_b_id for c in high_conflicts}
    flagged_in_layer = flagged & feature_ids
    return round(100.0 * (1 - len(flagged_in_layer) / len(feature_ids)), 2)
