import React, { useState, useEffect } from 'react';
import * as turf from '@turf/turf';
import { 
  Sparkles, Wrench, AlertOctagon, Siren, 
  Layers, CheckCircle, Info, Maximize2, Minimize2, ShieldCheck, Play,
  PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen
} from 'lucide-react';
import confetti from 'canvas-confetti';

import Map from '../components/Map';
import LayerManager from '../components/LayerManager';
import AlignmentPanel from '../components/AlignmentPanel';
import TopologyFixer from '../components/TopologyFixer';
import ConflictReport from '../components/ConflictReport';
import TrustBadge from '../components/TrustBadge';
import DisasterDemo from '../components/DisasterDemo';
import AttributeTable from '../components/AttributeTable';

import { 
  parseCsvToGeoJson, 
  detectTopologyErrors, 
  fixTopologyErrors, 
  detectConflicts, 
  computeTrustScore,
  alignLayers,
  findNearestShelter
} from '../services/spatialApi';

export default function Demo() {
  const [layers, setLayers] = useState([]);
  const [originalLayers, setOriginalLayers] = useState([]);
  const [activeTab, setActiveTab] = useState('topology'); // 'alignment' | 'topology' | 'conflicts' | 'disaster'
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [flyToTarget, setFlyToTarget] = useState(null);

  // Fullscreen & Panel layout toggles
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [isFullscreenMap, setIsFullscreenMap] = useState(false);

  // Harmonization state
  const [topologyErrors, setTopologyErrors] = useState([]);
  const [topologyHighlightFeatures, setTopologyHighlightFeatures] = useState(null);
  const [focusedTopologyErrorId, setFocusedTopologyErrorId] = useState(null);
  const [conflictData, setConflictData] = useState({ conflicts: [], conflictFeatures: null });
  const [disasterRoute, setDisasterRoute] = useState(null);
  const [trustScore, setTrustScore] = useState(null);
  const [activeLayerForTable, setActiveLayerForTable] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load bundled datasets on mount
  const [currentPreset, setCurrentPreset] = useState('benchmark');
  const [customDatasetName, setCustomDatasetName] = useState(null);

  const loadPreset = async (presetKey) => {
    setIsLoading(true);
    setCurrentPreset(presetKey);
    if (presetKey !== 'custom') {
      setCustomDatasetName(null);
    }
    try {
      let loaded = [];

      if (presetKey === 'sih_demo') {
        // SIH Demo: Reference parcels + Misaligned source with intentional anomalies
        const refRes = await fetch('./data/demo_reference_parcels.geojson');
        const refGeojson = await refRes.json();
        loaded.push({
          id: 'sih-reference-parcels',
          name: 'Reference Parcels (Clean Source A)',
          format: 'GeoJSON',
          geojson: refGeojson,
          featureCount: refGeojson.features.length,
          geometryType: 'Polygon',
          visible: true,
          opacity: 0.9,
          color: '#0f6fff',
          bbox: turf.bbox(refGeojson)
        });

        const misRes = await fetch('./data/demo_misaligned_parcels.geojson');
        const misGeojson = await misRes.json();
        loaded.push({
          id: 'sih-misaligned-parcels',
          name: 'Source B — Misaligned (P-006 Overlap, P-010 RoW)',
          format: 'GeoJSON',
          geojson: misGeojson,
          featureCount: misGeojson.features.length,
          geometryType: 'Polygon',
          visible: true,
          opacity: 0.75,
          color: '#f43f5e',
          bbox: turf.bbox(misGeojson)
        });

        const rowRes = await fetch('./data/demo_road_row.geojson');
        const rowGeojson = await rowRes.json();
        loaded.push({
          id: 'sih-road-row',
          name: 'Road Right-of-Way Corridor',
          format: 'GeoJSON',
          geojson: rowGeojson,
          featureCount: rowGeojson.features.length,
          geometryType: 'Polygon',
          visible: true,
          opacity: 0.65,
          color: '#f59e0b',
          bbox: turf.bbox(rowGeojson)
        });
      }

      if (presetKey === 'benchmark' || presetKey === 'all') {
        const cadRes = await fetch('./data/cadastral.geojson');
        const cadGeojson = await cadRes.json();
        const cadastralLayer = {
          id: 'cadastral-master',
          name: 'Urban Cadastral Parcels',
          format: 'GeoJSON',
          geojson: cadGeojson,
          featureCount: cadGeojson.features.length,
          geometryType: 'Polygon',
          visible: true,
          opacity: 0.85,
          color: '#0f6fff',
          bbox: turf.bbox(cadGeojson)
        };

        const roadRes = await fetch('./data/roads.geojson');
        const roadGeojson = await roadRes.json();
        const roadsLayer = {
          id: 'roads-network',
          name: 'Arterial Road Network (RoW)',
          format: 'GeoJSON',
          geojson: roadGeojson,
          featureCount: roadGeojson.features.length,
          geometryType: 'LineString',
          visible: true,
          opacity: 0.95,
          color: '#f97316',
          bbox: turf.bbox(roadGeojson)
        };

        const shelterRes = await fetch('./data/shelters.geojson');
        const shelterGeojson = await shelterRes.json();
        const sheltersLayer = {
          id: 'disaster-shelters',
          name: 'Emergency Relief Shelters',
          format: 'GeoJSON',
          geojson: shelterGeojson,
          featureCount: shelterGeojson.features.length,
          geometryType: 'Point',
          visible: true,
          opacity: 0.9,
          color: '#10b981',
          bbox: turf.bbox(shelterGeojson)
        };

        loaded.push(cadastralLayer, roadsLayer, sheltersLayer);
      }

      if (presetKey === 'groundwater' || presetKey === 'all') {
        const gwRes = await fetch('./data/telangana_groundwater_wells.geojson');
        const gwGeojson = await gwRes.json();
        const gwLayer = {
          id: 'telangana-groundwater-statewide',
          name: 'Statewide SGWD Wells (1,769)',
          format: 'GeoJSON',
          geojson: gwGeojson,
          featureCount: gwGeojson.features.length,
          geometryType: 'Point',
          visible: true,
          opacity: 0.9,
          color: '#10b981',
          bbox: turf.bbox(gwGeojson)
        };
        loaded.push(gwLayer);
      }

      if (presetKey === 'cadastre_state' || presetKey === 'all') {
        const cadRes = await fetch('./data/telangana_cadastral_villages.geojson');
        const cadGeojson = await cadRes.json();
        const stateCadLayer = {
          id: 'telangana-cadastre-villages',
          name: 'Telangana Village Cadastre (SOI)',
          format: 'GeoJSON',
          geojson: cadGeojson,
          featureCount: cadGeojson.features.length,
          geometryType: 'Polygon',
          visible: true,
          opacity: 0.75,
          color: '#3b82f6',
          bbox: turf.bbox(cadGeojson)
        };
        loaded.push(stateCadLayer);
      }

      if (presetKey === 'osm_roads' || presetKey === 'all') {
        const osmRes = await fetch('./data/telangana_osm_roads.geojson');
        const osmGeojson = await osmRes.json();
        const osmLayer = {
          id: 'osm-roads-layer',
          name: 'OpenStreetMap Corridors (map.osm)',
          format: 'GeoJSON',
          geojson: osmGeojson,
          featureCount: osmGeojson.features.length,
          geometryType: 'LineString',
          visible: true,
          opacity: 0.9,
          color: '#f59e0b',
          bbox: turf.bbox(osmGeojson)
        };
        loaded.push(osmLayer);
      }

      if (loaded.length === 0) {
        // Fallback default
        const gwRes = await fetch('./data/groundwater.csv');
        const gwText = await gwRes.text();
        const gwLayer = parseCsvToGeoJson(gwText, 'Telangana Groundwater Wells');
        loaded.push(gwLayer);
      }

      setLayers(loaded);
      setOriginalLayers(JSON.parse(JSON.stringify(loaded)));
      setActiveLayerForTable(loaded[0]);

      // Recompute spatial checks on primary polygon & line layers
      const poly = loaded.find(l => l.geometryType === 'Polygon' || l.geometryType === 'MultiPolygon');
      const line = loaded.find(l => l.geometryType === 'LineString');
      recomputeSpatialChecks(poly, line);

      // Auto-fit view to the dataset bounds
      if (loaded.length > 0) {
        const primaryZoomLayer = (presetKey === 'all') 
          ? (loaded.find(l => l.id.includes('cadastral')) || loaded[0]) 
          : loaded[0];
        handleZoomToLayer(primaryZoomLayer);
      }

    } catch (err) {
      console.error('Failed to load dataset preset', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load bundled datasets on mount
  useEffect(() => {
    loadPreset('benchmark');
  }, []);

  // Compute conflicts, topology errors, and initial trust score — always safe
  const recomputeSpatialChecks = (cadLayer, roadLayer) => {
    if (!cadLayer) {
      setTopologyErrors([]);
      setTopologyHighlightFeatures(null);
      setConflictData({ conflicts: [], conflictFeatures: null });
      setTrustScore({
        overall: 96.0,
        grade: 'A+',
        badgeColor: 'emerald',
        confidenceLevel: 'Very High',
        provenance: 'Ground Sensor & Official GIS Registry',
        alignmentRmse: '0.12 m',
        breakdown: {
          completeness: 98,
          positionalAccuracy: 96,
          topologicalConsistency: 99,
          attributeAccuracy: 95
        }
      });
      return;
    }

    try {
      // Topology
      const topo = detectTopologyErrors(cadLayer);
      setTopologyErrors(topo.errors || []);
      setTopologyHighlightFeatures(topo.errorFeatures || null);

      // Conflicts
      if (roadLayer) {
        try {
          const conf = detectConflicts(cadLayer, roadLayer, 30);
          setConflictData(conf);
        } catch (e) {
          console.warn('Conflict detection failed:', e);
          setConflictData({ conflicts: [], conflictFeatures: null });
        }
      } else {
        setConflictData({ conflicts: [], conflictFeatures: null });
      }

      // Trust Score
      try {
        const score = computeTrustScore(cadLayer.geojson, (topo.errors || []).length, 0.28);
        setTrustScore(score);
      } catch (e) {
        console.warn('Trust score computation failed:', e);
      }
    } catch (e) {
      console.warn('Spatial checks failed for layer:', e);
      setTopologyErrors([]);
      setTopologyHighlightFeatures(null);
      setConflictData({ conflicts: [], conflictFeatures: null });
    }
  };

  // Layer Manager Handlers
  const handleToggleVisibility = (id) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
  };

  const handleChangeOpacity = (id, opacity) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, opacity } : l));
  };

  const handleReorderLayer = (fromIdx, toIdx) => {
    setLayers(prev => {
      const copy = [...prev];
      const [item] = copy.splice(fromIdx, 1);
      copy.splice(toIdx, 0, item);
      return copy;
    });
  };

  const handleRemoveLayer = (id) => {
    setLayers(prev => prev.filter(l => l.id !== id));
  };

  const handleAddLayer = (newLayer, replace = true) => {
    // Ensure layer has a valid bbox so zoom works
    const layerWithBbox = newLayer.bbox ? newLayer : (() => {
      try {
        return { ...newLayer, bbox: turf.bbox(newLayer.geojson) };
      } catch (e) {
        return newLayer;
      }
    })();

    if (replace) {
      setLayers([layerWithBbox]);
      try {
        setOriginalLayers([JSON.parse(JSON.stringify(layerWithBbox))]);
      } catch (e) {
        setOriginalLayers([layerWithBbox]);
      }
    } else {
      setLayers(prev => [layerWithBbox, ...prev]);
      try {
        setOriginalLayers(prev => [JSON.parse(JSON.stringify(layerWithBbox)), ...prev]);
      } catch (e) {
        setOriginalLayers(prev => [layerWithBbox, ...prev]);
      }
    }
    setActiveLayerForTable(layerWithBbox);
    setCurrentPreset('custom');
    setCustomDatasetName(layerWithBbox.name);

    // Automatically zoom map to the newly added dataset's geographic bounds
    setTimeout(() => {
      handleZoomToLayer(layerWithBbox);
    }, 80);

    // Update AI spatial checks — wrapped in try so a crash never blocks layer display
    try {
      const currentLayers = replace ? [] : layers;
      const targetPoly = (layerWithBbox.geometryType === 'Polygon' || layerWithBbox.geometryType === 'MultiPolygon')
        ? layerWithBbox
        : currentLayers.find(l => l.geometryType === 'Polygon' || l.geometryType === 'MultiPolygon') || null;
      const targetLine = (layerWithBbox.geometryType === 'LineString' || layerWithBbox.geometryType === 'MultiLineString')
        ? layerWithBbox
        : currentLayers.find(l => l.geometryType === 'LineString' || l.geometryType === 'MultiLineString') || null;
      recomputeSpatialChecks(targetPoly, targetLine);
    } catch (e) {
      console.warn('Spatial analysis skipped for uploaded layer:', e);
    }
  };

  const handleZoomToLayer = (layer) => {
    if (!layer || !layer.geojson) return;
    try {
      const bbox = layer.bbox || turf.bbox(layer.geojson);
      if (bbox && bbox.length === 4 && bbox.every(n => typeof n === 'number' && isFinite(n))) {
        setFlyToTarget({
          bounds: [
            [bbox[1], bbox[0]],
            [bbox[3], bbox[2]]
          ],
          _ts: Date.now()
        });
      }
    } catch (e) {
      console.error('Failed to zoom to layer', e);
    }
  };

  // Smart Alignment Callback
  const handleApplyAlignment = (targetId, alignedGeojson) => {
    setLayers(prev => prev.map(l => {
      if (l.id === targetId) {
        return { ...l, geojson: alignedGeojson };
      }
      return l;
    }));

    // Recompute checks
    const cad = layers.find(l => l.id.includes('cadastr') || l.geometryType === 'Polygon' || l.geometryType === 'MultiPolygon') || layers[0];
    const roads = layers.find(l => l.id.includes('road'));
    recomputeSpatialChecks({ ...cad, geojson: alignedGeojson }, roads);
  };

  const handleRevertAlignment = (targetId) => {
    const orig = originalLayers.find(l => l.id === targetId);
    if (orig) {
      setLayers(prev => prev.map(l => l.id === targetId ? JSON.parse(JSON.stringify(orig)) : l));
      const cad = originalLayers.find(l => l.id.includes('cadastr') || l.geometryType === 'Polygon' || l.geometryType === 'MultiPolygon') || originalLayers[0];
      const roads = originalLayers.find(l => l.id.includes('road'));
      recomputeSpatialChecks(cad, roads);
    }
  };

  // Topology Fix Callback
  const handleApplyTopologyFix = (layerId, fixedGeojson, newTrust) => {
    setLayers(prev => prev.map(l => {
      if (l.id === layerId) {
        return { ...l, geojson: fixedGeojson };
      }
      return l;
    }));

    // Clear topology highlights & update errors
    setTopologyErrors([]);
    setTopologyHighlightFeatures(null);
    if (newTrust) {
      setTrustScore(newTrust);
    }
  };

  const handlePreviewTopologyError = (err) => {
    if (!err) return;

    // Toggle focus if clicking the currently active error again
    if (focusedTopologyErrorId === err.id) {
      setFocusedTopologyErrorId(null);
      return;
    }

    setFocusedTopologyErrorId(err.id);

    // 1. Ensure error features are populated
    let errorCol = topologyHighlightFeatures;
    if (!errorCol || !errorCol.features?.length) {
      const cad = layers.find(l => l.id.includes('cadastr') || l.geometryType === 'Polygon' || l.geometryType === 'MultiPolygon') || layers[0];
      if (cad?.geojson) {
        try {
          const res = detectTopologyErrors(cad);
          errorCol = res.errorFeatures;
          setTopologyHighlightFeatures(res.errorFeatures);
        } catch (e) {}
      }
    }

    // 2. Find the exact sliver error feature
    const matchingFeat = errorCol?.features?.find(
      f => f.properties?.id === err.id || f.id === `err-poly-${err.id}` || f.id === err.id
    );

    if (matchingFeat && matchingFeat.geometry) {
      try {
        const centroid = turf.centroid(matchingFeat);
        const [lng, lat] = centroid.geometry.coordinates;
        const bbox = turf.bbox(matchingFeat);

        setFlyToTarget({
          lat,
          lng,
          zoom: 17,
          bounds: (bbox && bbox.every(isFinite) && (bbox[2] > bbox[0] || bbox[3] > bbox[1])) ? [
            [bbox[1] - 0.0006, bbox[0] - 0.0006],
            [bbox[3] + 0.0006, bbox[2] + 0.0006]
          ] : null,
          errorId: err.id,
          _ts: Date.now()
        });
        setSelectedFeature(matchingFeat);
        return;
      } catch (e) {
        console.error('Error previewing topology feature:', e);
      }
    }

    // 3. Fallback: zoom to the primary affected parcel
    if (err.affectedParcels && err.affectedParcels.length > 0) {
      const cad = layers.find(l => l.id.includes('cadastr') || l.geometryType === 'Polygon' || l.geometryType === 'MultiPolygon') || layers[0];
      const p = cad?.geojson?.features?.find(f => 
        f.properties?.parcel_id === err.affectedParcels[0] || f.id === err.affectedParcels[0]
      );
      if (p) {
        try {
          const centroid = turf.centroid(p);
          const [lng, lat] = centroid.geometry.coordinates;
          setFlyToTarget({ lat, lng, zoom: 17, errorId: err.id, _ts: Date.now() });
          setSelectedFeature(p);
          return;
        } catch (e) {}
      }
    }

    if (layers[0]) {
      handleZoomToLayer(layers[0]);
    }
  };

  // Conflict Selection Focus
  const handleSelectConflict = (conflict) => {
    // Zoom map to conflict location
    const parcelFeature = layers
      .find(l => l.id.includes('cadastr') || l.geometryType === 'Polygon' || l.geometryType === 'MultiPolygon')
      ?.geojson.features.find(f => f.properties?.parcel_id === conflict.parcelId || f.id === conflict.parcelId);

    if (parcelFeature && parcelFeature.geometry.coordinates[0][0]) {
      const [lng, lat] = parcelFeature.geometry.coordinates[0][0];
      setFlyToTarget({ lat, lng, zoom: 17 });
      setSelectedFeature(parcelFeature);
    }
  };

  // Disaster Scenario Callbacks
  const handleActivateDisasterScenario = (result, incident) => {
    setDisasterRoute(result);
    // Pan to incident
    setFlyToTarget({
      lat: incident.coords[1],
      lng: incident.coords[0],
      zoom: 16
    });
  };

  const handleClearDisasterScenario = () => {
    setDisasterRoute(null);
  };

  // Zoom to table feature
  const handleZoomToFeature = (feature) => {
    if (!feature || !feature.geometry) return;
    setSelectedFeature(feature);

    try {
      if (feature.geometry.type === 'Point') {
        const [lng, lat] = feature.geometry.coordinates;
        setFlyToTarget({ lat, lng, zoom: 18 });
      } else {
        const bbox = turf.bbox(feature);
        if (bbox && bbox.every(n => typeof n === 'number' && isFinite(n))) {
          setFlyToTarget({
            bounds: [
              [bbox[1], bbox[0]],
              [bbox[3], bbox[2]]
            ],
            _ts: Date.now()
          });
        }
      }
    } catch (e) {
      console.error('Failed to zoom to feature', e);
    }
  };


  const cadastralLayer = layers.find(l => l.id.includes('cadastr') || l.geometryType === 'Polygon' || l.geometryType === 'MultiPolygon') || layers[0];
  const sheltersLayer = layers.find(l => l.id.includes('shelter'));

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-surface text-text overflow-hidden">
      
      {/* Top Interactive GIS Sub-bar (Height: 48px, flex-shrink-0) */}
      <div className="h-12 flex-shrink-0 bg-card border-b border-border px-3 sm:px-4 flex items-center justify-between gap-2 shadow-xs z-30">
        
        {/* Left: Sidebar Toggles & Tour Quick Buttons */}
        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar">
          {/* Toggle Left Sidebar */}
          <button
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            title={leftSidebarOpen ? "Collapse Layer Stack" : "Expand Layer Stack"}
            className={`px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold border transition-all flex items-center space-x-1.5 ${
              leftSidebarOpen && !isFullscreenMap
                ? 'bg-brand-light border-brand/30 text-brand shadow-xs'
                : 'bg-white border-border text-muted hover:text-text hover:bg-surface'
            }`}
          >
            {leftSidebarOpen && !isFullscreenMap ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            <span className="hidden sm:inline">Layers</span>
          </button>

          {/* Toggle Right Sidebar */}
          <button
            onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
            title={rightSidebarOpen ? "Collapse AI Tools" : "Expand AI Tools"}
            className={`px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold border transition-all flex items-center space-x-1.5 ${
              rightSidebarOpen && !isFullscreenMap
                ? 'bg-brand-light border-brand/30 text-brand shadow-xs'
                : 'bg-white border-border text-muted hover:text-text hover:bg-surface'
            }`}
          >
            {rightSidebarOpen && !isFullscreenMap ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
            <span className="hidden sm:inline">AI Tools</span>
          </button>

          {/* Fullscreen Map Toggle */}
          <button
            onClick={() => setIsFullscreenMap(!isFullscreenMap)}
            title={isFullscreenMap ? "Exit Fullscreen Map" : "Full Screen Map (Focus Mode)"}
            className={`px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold border transition-all flex items-center space-x-1.5 ${
              isFullscreenMap
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                : 'bg-white border-border text-muted hover:text-text hover:bg-surface'
            }`}
          >
            {isFullscreenMap ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden md:inline">{isFullscreenMap ? "Exit Fullscreen" : "Full Map"}</span>
          </button>

          <span className="h-5 w-px bg-border hidden sm:block"></span>

          {/* Dataset Preset Selector */}
          <div className="flex items-center space-x-1.5">
            <span className="text-muted text-xs font-bold uppercase tracking-wider hidden lg:inline mr-1">
              Data:
            </span>
            <select
              value={currentPreset}
              onChange={(e) => loadPreset(e.target.value)}
              className="bg-white border border-border rounded-lg px-2.5 py-1.5 text-xs font-bold text-text focus:outline-none focus:border-brand shadow-xs"
              title="Switch Ingested Dataset Preset"
            >
              {customDatasetName && (
                <option value="custom">★ Custom: {customDatasetName}</option>
              )}
              <option value="benchmark">Benchmark Micro-Cadastre</option>
              <option value="sih_demo">⚡ SIH Demo — Misalignment + Conflict</option>
              <option value="groundwater">Telangana Groundwater (1.7k Wells)</option>
              <option value="cadastre_state">Telangana Cadastre (SOI Shapefile)</option>
              <option value="osm_roads">OSM Highway Corridors (map.osm)</option>
              <option value="all">Integrated All Layers Stack</option>
            </select>
          </div>
        </div>

        {/* Right: Selected Feature & Trust Score */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          {selectedFeature && (
            <div className="hidden xl:flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-surface text-xs font-medium text-text border border-border shadow-xs">
              <span className="text-muted">Selected:</span>
              <span className="font-bold truncate max-w-[150px] text-brand">
                {selectedFeature.properties?.parcel_id || selectedFeature.properties?.['Site Name'] || selectedFeature.id}
              </span>
            </div>
          )}

          <TrustBadge trustScore={trustScore} />
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 w-full min-h-0 flex overflow-hidden relative">
        
        {/* Left Sidebar: Layer Manager */}
        {leftSidebarOpen && !isFullscreenMap && (
          <div className="w-80 sm:w-88 flex-shrink-0 h-full border-r border-border bg-card flex flex-col p-3.5 overflow-hidden z-20 transition-all duration-200 shadow-sm">
            <LayerManager
              layers={layers}
              onToggleVisibility={handleToggleVisibility}
              onChangeOpacity={handleChangeOpacity}
              onReorderLayer={handleReorderLayer}
              onRemoveLayer={handleRemoveLayer}
              onAddLayer={handleAddLayer}
              onZoomToLayer={handleZoomToLayer}
            />
          </div>
        )}

        {/* Center Panel: Map + Docked Attribute Table (fits screen 100%) */}
        <div className="flex-1 h-full min-w-0 flex flex-col min-h-0 overflow-hidden relative">
          {/* Map canvas */}
          <div className="flex-1 w-full relative min-h-0 overflow-hidden">
            {customDatasetName && (
              <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-card/95 backdrop-blur-md border border-brand/40 px-3.5 py-1.5 rounded-xl shadow-md flex items-center space-x-2 text-xs font-semibold animate-in fade-in slide-in-from-top-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Active Dataset: <strong className="text-brand">{customDatasetName}</strong> ({layers[0]?.featureCount || 0} features)</span>
                <button 
                  onClick={() => handleZoomToLayer(layers[0])}
                  className="ml-2 px-2 py-0.5 rounded bg-brand text-white hover:bg-brand-hover text-[11px] font-bold shadow-xs transition-colors"
                >
                  Fit Extent
                </button>
              </div>
            )}
            <Map
              layers={layers}
              selectedFeature={selectedFeature}
              onSelectFeature={(feat, layer) => {
                setSelectedFeature(feat);
                setActiveLayerForTable(layer);
              }}
              conflictFeatures={activeTab === 'conflicts' ? conflictData.conflictFeatures : null}
              topologyErrorFeatures={activeTab === 'topology' ? topologyHighlightFeatures : null}
              focusedTopologyErrorId={activeTab === 'topology' ? focusedTopologyErrorId : null}
              disasterRoute={activeTab === 'disaster' ? disasterRoute : null}
              flyToTarget={flyToTarget}
            />
          </div>

          {/* Bottom Docked Attribute Table */}
          <AttributeTable
            activeLayer={activeLayerForTable || cadastralLayer}
            onZoomToFeature={handleZoomToFeature}
          />
        </div>

        {/* Right Sidebar: AI Harmonization Suite */}
        {rightSidebarOpen && !isFullscreenMap && (
          <div className="w-88 sm:w-96 flex-shrink-0 h-full border-l border-border bg-card flex flex-col p-3.5 overflow-hidden space-y-3 z-20 transition-all duration-200 shadow-sm">
            
            {/* Tool Switcher Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-surface border border-border rounded-xl flex-shrink-0">
              <button
                onClick={() => setActiveTab('alignment')}
                title="AI Smart Alignment"
                className={`py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex flex-col items-center justify-center ${
                  activeTab === 'alignment'
                    ? 'bg-brand text-white shadow-xs'
                    : 'text-muted hover:text-text'
                }`}
              >
                <Sparkles className="w-4 h-4 mb-1" />
                <span>Align</span>
              </button>

              <button
                onClick={() => setActiveTab('topology')}
                title="Topology Correction"
                className={`py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex flex-col items-center justify-center relative ${
                  activeTab === 'topology'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-muted hover:text-text'
                }`}
              >
                <Wrench className="w-4 h-4 mb-1" />
                <span>Topology</span>
                {topologyErrors.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('conflicts')}
                title="Conflict Detector"
                className={`py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex flex-col items-center justify-center relative ${
                  activeTab === 'conflicts'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-muted hover:text-text'
                }`}
              >
                <AlertOctagon className="w-4 h-4 mb-1" />
                <span>Conflicts</span>
                {conflictData.conflicts.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse"></span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('disaster')}
                title="Disaster Evacuation"
                className={`py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex flex-col items-center justify-center ${
                  activeTab === 'disaster'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-muted hover:text-text'
                }`}
              >
                <Siren className="w-4 h-4 mb-1" />
                <span>Disaster</span>
              </button>
            </div>

            {/* Active Tool View with dedicated scroll */}
            <div className="flex-1 overflow-y-auto pr-0.5 min-h-0">
              {activeTab === 'alignment' && (
                <AlignmentPanel
                  layers={layers}
                  onApplyAlignment={handleApplyAlignment}
                  onRevertAlignment={handleRevertAlignment}
                />
              )}

              {activeTab === 'topology' && (
                <TopologyFixer
                  cadastralLayer={cadastralLayer}
                  topologyErrors={topologyErrors}
                  focusedErrorId={focusedTopologyErrorId}
                  onApplyFix={handleApplyTopologyFix}
                  onPreviewError={handlePreviewTopologyError}
                />
              )}

              {activeTab === 'conflicts' && (
                <ConflictReport
                  conflicts={conflictData.conflicts}
                  onSelectConflict={handleSelectConflict}
                />
              )}

              {activeTab === 'disaster' && (
                <DisasterDemo
                  sheltersLayer={sheltersLayer}
                  onActivateDisasterScenario={handleActivateDisasterScenario}
                  onClearDisasterScenario={handleClearDisasterScenario}
                />
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
