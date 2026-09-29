# GeoMap AI - User & Technical Operations Guide

## 1. Introduction
GeoMap AI provides a streamlined Web GIS interface designed for land revenue officers, municipal town planners, GIS technicians, and hackathon evaluators.

## 2. Navigating the Workspace
The application consists of 7 unified views accessible via the top navigation bar:
- **Overview (`#home`)**: Executive summary of problem statement SIH 26013, key value propositions, metrics, and judge walkthrough.
- **Live GIS Demo (`#demo`)**: Full-screen interactive GIS workspace combining the Leaflet map, layer manager, attribute table, and AI harmonization tools.
- **Datasets & Catalog (`#datasets`)**: Data repository with direct download links, schema viewer, and interactive ingestion sandbox.
- **Harmonization Suite (`#features`)**: Detailed mathematical formulas, algorithms, and code snippets for all 6 core features.
- **SIH 26013 & Team (`#about`)**: Alignment with DoLR, NAKSHA, BhuNaksha, DILRMP, and stakeholder impact analysis.
- **Engine Admin (`#admin`)**: Diagnostics console with latency gauges, API token generator, and audit log ledger.
- **Contact (`#contact`)**: Evaluator feedback form and technical FAQ accordion.

## 3. Step-by-Step Harmonization Workflows

### 3.1 AI Smart Alignment
1. In the **Live GIS Demo**, open the right sidebar and select the **Align** tab.
2. Select the target layer to align (e.g. `Urban Cadastral Parcels`).
3. Click **Run AI Alignment**. The progress bar animates through centroid extraction, rotation calculation, and affine coordinate translation.
4. Review the metrics:
   - Initial RMSE: `14.28 m`
   - Post-Alignment Residual RMSE: `0.28 m` (98.0% error reduction)
5. To undo changes, click **Revert to Raw Coordinates**.

### 3.2 AI Topology Correction (Sliver Overlap Repair)
1. Select the **Topology** tab in the right sidebar.
2. Review the detected anomaly: `Sliver Overlap between TS-HYD-P102 and TS-HYD-P103 (248.5 m²)`.
3. Click the eye icon to focus the map camera directly on the overlap.
4. Click **Review & Fix** to trigger the **Human-in-the-Loop Confirmation Modal**.
5. Examine the proposed boundary snap diff.
6. Click **Approve & Commit Fix**. The application updates the layer coordinates, clears the error, increments the trust score, and triggers a celebration confetti effect.

### 3.3 Right-of-Way (RoW) Conflict Detection
1. Select the **Conflicts** tab in the right sidebar.
2. View the detected parcel encroachments against the `NH-65 Outer Ring Road Linkway` corridor.
3. Filter by severity (**All**, **High**, **Medium**).
4. Click on any conflict item (e.g. `TS-HYD-P104`) to smoothly fly the map camera to the pulsating red infringement polygon.
5. Click **Audit JSON** to download a structured JSON report of all infringements.

### 3.4 Emergency Disaster Evacuation
1. Select the **Disaster** tab in the right sidebar.
2. Choose one of the simulated incident scenarios:
   - *Urban Flash Flood Zone* (Madhapur)
   - *Industrial Hazmat Gas Leak* (Kondapur)
   - *Seismic Structural Threat* (HITEC City)
3. The spatial engine calculates the nearest shelter using Turf.js distance algorithms.
4. Inspect the green evacuation corridor drawn on the map and review the triage card displaying available capacity, travel ETA, auxiliary power, and incident commander contact details.

### 3.5 Custom Data Ingestion
1. In the left panel (Layer Stack), click **Ingest Data**.
2. Drag and drop any `.geojson` or `.csv` file with latitude and longitude headers.
3. The engine automatically parses geometries, calculates bounding box extents, and attaches the layer to the map.
