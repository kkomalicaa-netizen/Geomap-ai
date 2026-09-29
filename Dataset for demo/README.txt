GeoMap AI — SIH Demo Dataset
================================

IMPORTANT:
These files are SYNTHETIC DEMO DATA. They are not official cadastral,
survey, ownership, municipal, or land-record data.

Files
-----
01_reference_parcels.geojson
  Clean reference layer with 12 sample parcels.

02_misaligned_parcels.geojson
  Second version of the same parcels, intentionally shifted.
  Special demo anomalies:
    P-006 -> overlap
    P-007 -> gap / boundary mismatch
    P-010 -> Right-of-Way encroachment
  All other parcels demonstrate general source misalignment.

03_road_right_of_way.geojson
  Synthetic urban road / Right-of-Way polygon.

04_demo_boundary.geojson
  Synthetic study-area boundary.

Suggested Demo
--------------
1. Load 04_demo_boundary.geojson.
2. Load 01_reference_parcels.geojson.
3. Load 02_misaligned_parcels.geojson and show the offset.
4. Load 03_road_right_of_way.geojson.
5. Run your alignment/harmonization.
6. Highlight P-006 overlap, P-007 gap, and P-010 RoW encroachment.
7. Show your Trust/Confidence Score and human approval workflow.

Coordinate system:
GeoJSON WGS84 longitude/latitude coordinates.
