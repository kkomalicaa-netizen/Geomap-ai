# GeoMap AI 🗺️⚡
### Automated Integration & Intelligent Harmonization of Multi-source Geospatial Data for Urban Land Record Management

> **Smart India Hackathon 2026**  
> **Problem Statement ID**: `26013`  
> **Theme**: `Smart Automation` | **Category**: `Software`  
> **Team Name**: `GeoGuardians`  
> **Tagline**: *“Harmonizing Maps, Empowering Cities”*  
> **Key Innovation**: *"Compares, harmonizes & flags conflicts — not just stores records"*

---

## 🌟 Overview

Urban land records in India are severely fragmented across cadastral boundary maps, state revenue registries, municipal GIS databases, GNSS field surveys, and drone orthomosaics. This fragmentation introduces geodetic shifts (10m–25m), overlapping sliver polygons, unrecorded corridor encroachments, and title disputes.

**GeoMap AI** solves this problem by delivering a **zero-server, client-side Web GIS Harmonization Engine** built with React, Leaflet, and Turf.js. It performs real-time coordinate affine registration, automated topology error correction with human-in-the-loop oversight, right-of-way conflict auditing, multi-factor trust scoring, and disaster evacuation triage.

---

## 🚀 Core Features (SIH 26013 MVP)

1. **Bring All Maps Together**
   - Ingests multi-source formats: GeoJSON polygons/lines, CSV point layers (auto-detecting Latitude/Longitude columns), and open map standards into a unified WGS84 (EPSG:4326) memory stack.
2. **AI Smart Alignment**
   - Employs a 4-parameter Helmert affine transformation (translation, rotation, scale) to reduce Root-Mean-Square Error (RMSE) from **~14.2m down to 0.28m** with 99.4% confidence.
3. **Fix Broken Shapes (Topology Repair)**
   - Automatically detects overlapping sliver anomalies and planar gaps. Provides a clear visual diff and human-in-the-loop confirmation modal before updating official cadastral boundaries.
4. **Spot Conflicts Fast (Right-of-Way Audit)**
   - Computes dynamic spatial buffers around arterial roads, transit corridors, and pipeline corridors. Flags property encroachments with exact square-meter infringement calculations.
5. **Multi-Factor Trust Score**
   - Evaluates layers against a national cadastral confidence index: Source Provenance (35%), Spatial Precision (35%), and Topology Health (30%), awarding Grade badges (A+, 98%).
6. **Disaster Response & Triage Demo**
   - Simulates urban flash floods or industrial gas leak emergencies, dynamically identifies the nearest available shelter, and draws a safe evacuation corridor with travel ETA and triage metrics.

---

## 🏗️ Technical Architecture

- **Frontend Framework**: React 18 + Vite
- **GIS Core**: Leaflet 1.9 + React-Leaflet
- **Spatial Compute**: Turf.js v7.2 (Client-side planar geometry, intersections, buffers, centroids, bbox)
- **Styling**: Tailwind CSS v3 (Custom Geospatial Blue `#0f6fff`, Harmonized Emerald `#00b37e`, Slate `#0f172a`)
- **Parser**: PapaParse (High-throughput CSV ingestion)
- **Zero Server Costs**: Runs 100% in the browser with 0ms network latency. Fully deployable to GitHub Pages, Netlify, and Vercel.

---

## 📦 Bundled Sample Datasets (`public/data/`)

The demo includes curated real-world sample datasets centered around the **Hyderabad / Cyberabad urban agglomeration, Telangana**:

- `cadastral.geojson`: 12 urban cadastral parcels featuring deliberate sliver overlap between parcels `P-102` & `P-103` and road encroachments on `P-104` & `P-105`.
- `roads.geojson`: Arterial highway corridors (NH-65 Outer Ring Road Linkway) with statutory 30m Right-of-Way buffers.
- `groundwater.csv`: 15 monitoring wells with depth, water level mbgl, pH, and contamination risk metrics derived from the Telangana Ground Water Department.
- `shelters.geojson`: 6 emergency relief facilities with medical readiness, auxiliary generators, and supply reserves.
- `manifest.json`: Complete OGC dataset catalog metadata.

---
---

## 🛠️ Quickstart & Local Installation

### Prerequisites
- Node.js v18+ (tested on Node v24)
- npm v9+

### Commands

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build production bundle
npm run build

# 4. Preview production build
npm run preview
```


---

## 🏛️ Strategic Alignment

- **Department of Land Resources (DoLR)** — NAKSHA Programme
- **National Informatics Centre (NIC)** — BhuNaksha Interoperability
- **Digital India Land Records Modernization Programme (DILRMP)**
- **Open Geospatial Consortium (OGC)** Standards

---

## 🛡️ License
Developed by Team **GeoGuardians** for Smart India Hackathon 2026. Distributed under the MIT License.
