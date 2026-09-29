from __future__ import annotations

import uuid

from sqlalchemy.orm import Session

from app.models.disaster import Resource, Road, Shelter
from spatial_pipeline.disaster.mock_data import MOCK_RESOURCES, MOCK_ROADS, MOCK_SHELTERS
from spatial_pipeline.disaster.route_engine import RoadSegment, build_road_graph, safest_route
from spatial_pipeline.disaster.shelter import ShelterCandidate, score_shelters


def seed_demo_data(db: Session) -> None:
    """Idempotent-ish seed for the disaster demo (README §14 mock objects).
    Safe to call once at startup for a hackathon demo; guarded by a count check.
    """
    from geoalchemy2.shape import from_shape
    from shapely.geometry import LineString, Point

    if db.query(Shelter).count() > 0:
        return

    for s in MOCK_SHELTERS:
        db.add(Shelter(name=s["name"], geom=from_shape(Point(s["lng"], s["lat"]), srid=4326),
                        capacity=s["capacity"], is_open=True))

    for name, coords, blocked, hazard in MOCK_ROADS:
        line = LineString([(lng, lat) for lat, lng in coords])
        db.add(Road(name=name, geom=from_shape(line, srid=4326), is_blocked=blocked, hazard_level=hazard))

    for r in MOCK_RESOURCES:
        db.add(Resource(name=r["name"], geom=from_shape(Point(r["lng"], r["lat"]), srid=4326),
                         quantity=r["quantity"]))

    db.commit()


def rank_shelters(db: Session, origin_lat: float, origin_lng: float) -> list[dict]:
    from geoalchemy2.shape import to_shape

    shelters = db.query(Shelter).all()
    resources = db.query(Resource).all()

    candidates = []
    for s in shelters:
        point = to_shape(s.geom)
        nearby_resources = sum(
            r.quantity for r in resources
            if to_shape(r.geom).distance(point) < 0.02  # ~2km in degrees, demo-scale approx
        )
        candidates.append(
            ShelterCandidate(
                id=str(s.id), name=s.name, lat=point.y, lng=point.x,
                capacity=s.capacity, is_open=s.is_open,
                hazard_level_nearby=0.0, resource_quantity=nearby_resources,
            )
        )

    return score_shelters(candidates, origin=(origin_lat, origin_lng))


def route_to_shelter(
    db: Session, origin_lat: float, origin_lng: float, shelter_id: uuid.UUID | None
) -> dict | None:
    from geoalchemy2.shape import to_shape

    if shelter_id is not None:
        shelter = db.get(Shelter, shelter_id)
        if shelter is None:
            raise ValueError(f"Shelter {shelter_id} not found")
    else:
        ranked = rank_shelters(db, origin_lat, origin_lng)
        if not ranked:
            return None
        shelter = db.get(Shelter, uuid.UUID(ranked[0]["id"]))

    shelter_point = to_shape(shelter.geom)

    roads = db.query(Road).all()
    segments = []
    for road in roads:
        line = to_shape(road.geom)
        coords = list(line.coords)  # [(lng, lat), ...]
        for (lng1, lat1), (lng2, lat2) in zip(coords, coords[1:]):
            segments.append(
                RoadSegment(
                    start=(lat1, lng1), end=(lat2, lng2),
                    is_blocked=road.is_blocked, hazard_level=road.hazard_level,
                )
            )

    graph = build_road_graph(segments)
    result = safest_route(graph, (origin_lat, origin_lng), (shelter_point.y, shelter_point.x))
    if result is None:
        return None

    path, cost = result
    return {
        "shelter_id": shelter.id,
        "shelter_name": shelter.name,
        "total_cost": round(cost, 1),
        "path_coordinates": path,  # list of (lat, lng)
    }
