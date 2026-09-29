from __future__ import annotations

import os
import uuid
from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, UploadFile
from geoalchemy2.shape import to_shape
from shapely.geometry import mapping
from sqlalchemy.orm import Session

from app.api.deps import CurrentUser, require_role
from app.core.config import settings
from app.core.database import get_db
from app.models.layer import LayerFeature, SpatialLayer
from app.schemas.layer import GeoJSONFeatureCollection, LayerOut, LayerUploadResponse
from app.services.ingestion_service import create_upload_records, run_background_ingestion

router = APIRouter(prefix="/api/v1/layers", tags=["layers"])

UPLOAD_DIR = Path("/tmp/geomap_uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
ALLOWED_EXTENSIONS = {".geojson", ".json", ".zip", ".csv"}


@router.post("/upload", response_model=LayerUploadResponse)
async def upload_layer(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    source_name: str = Form(...),
    source_type: str = Form(...),
    db: Session = Depends(get_db),
    user: CurrentUser = Depends(require_role("ADMIN", "GOVERNMENT", "URBAN_PLANNER")),
):
    suffix = Path(file.filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Unsupported file type '{suffix}'. Allowed: {sorted(ALLOWED_EXTENSIONS)}")

    contents = await file.read()
    size_mb = len(contents) / (1024 * 1024)
    if size_mb > settings.MAX_UPLOAD_MB:
        raise HTTPException(400, f"File exceeds {settings.MAX_UPLOAD_MB}MB limit")

    dest_path = UPLOAD_DIR / f"{uuid.uuid4()}{suffix}"
    with open(dest_path, "wb") as f:
        f.write(contents)

    data_source, layer, job = create_upload_records(
        db, filename=file.filename, source_name=source_name,
        source_type=source_type, uploaded_by=None,
    )

    background_tasks.add_task(
        run_background_ingestion,
        job_id=job.id, layer_id=layer.id, data_source_id=data_source.id,
        file_path=str(dest_path), filename=file.filename,
    )

    return LayerUploadResponse(
        data_source_id=data_source.id, layer_id=layer.id, job_id=job.id,
        status="QUEUED", message="Upload accepted; processing in the background. Poll GET /jobs/{job_id}.",
    )


@router.get("", response_model=list[LayerOut])
def list_layers(db: Session = Depends(get_db), user: CurrentUser = Depends(require_role(
    "ADMIN", "GOVERNMENT", "URBAN_PLANNER", "DISASTER_TEAM", "CITIZEN"
))):
    return db.query(SpatialLayer).order_by(SpatialLayer.created_at.desc()).all()


@router.get("/{layer_id}", response_model=LayerOut)
def get_layer(layer_id: uuid.UUID, db: Session = Depends(get_db), user: CurrentUser = Depends(require_role(
    "ADMIN", "GOVERNMENT", "URBAN_PLANNER", "DISASTER_TEAM", "CITIZEN"
))):
    layer = db.get(SpatialLayer, layer_id)
    if layer is None:
        raise HTTPException(404, "Layer not found")
    return layer


@router.delete("/{layer_id}", status_code=204)
def delete_layer(layer_id: uuid.UUID, db: Session = Depends(get_db), user: CurrentUser = Depends(
    require_role("ADMIN", "GOVERNMENT")
)):
    layer = db.get(SpatialLayer, layer_id)
    if layer is None:
        raise HTTPException(404, "Layer not found")
    db.delete(layer)
    db.commit()


@router.get("/{layer_id}/geojson", response_model=GeoJSONFeatureCollection)
def get_layer_geojson(layer_id: uuid.UUID, db: Session = Depends(get_db), user: CurrentUser = Depends(
    require_role("ADMIN", "GOVERNMENT", "URBAN_PLANNER", "DISASTER_TEAM", "CITIZEN")
)):
    layer = db.get(SpatialLayer, layer_id)
    if layer is None:
        raise HTTPException(404, "Layer not found")

    features = db.query(LayerFeature).filter(LayerFeature.layer_id == layer_id).all()
    geojson_features = [
        {
            "type": "Feature",
            "id": str(f.id),
            "geometry": mapping(to_shape(f.geom)),
            "properties": {**(f.attributes or {}), "repair_actions": f.repair_actions or []},
        }
        for f in features
    ]
    return GeoJSONFeatureCollection(features=geojson_features)
