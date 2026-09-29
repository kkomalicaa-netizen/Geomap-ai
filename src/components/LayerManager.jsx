import React, { useState, useRef } from 'react';
import { 
  Layers, Eye, EyeOff, Sliders, ArrowUp, ArrowDown, Trash2, 
  Plus, Upload, FileText, CheckCircle, AlertCircle, RefreshCw, ZoomIn
} from 'lucide-react';
import { uploadLayer } from '../services/spatialApi';

export default function LayerManager({
  layers = [],
  onToggleVisibility = () => {},
  onChangeOpacity = () => {},
  onReorderLayer = () => {},
  onRemoveLayer = () => {},
  onAddLayer = () => {},
  onZoomToLayer = () => {}
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const newLayer = await uploadLayer(file);
      onAddLayer(newLayer, replaceExisting);
      setIsModalOpen(false);
    } catch (err) {
      setUploadError(err.message || 'Failed to parse spatial layer.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="flex flex-col h-full text-text overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
        <div className="flex items-center space-x-2.5">
          <Layers className="w-5 h-5 text-brand" />
          <h3 className="font-bold text-base text-text">Layer Stack</h3>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-brand-light text-brand border border-brand/20">
            {layers.length} Active
          </span>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold bg-brand hover:bg-brand-hover text-white shadow-xs transition-all duration-150 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Ingest Data</span>
        </button>
      </div>

      {/* Layer List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-0">
        {layers.length === 0 ? (
          <div className="text-center py-10 text-muted text-sm">
            No active layers. Ingest GeoJSON or CSV to begin.
          </div>
        ) : (
          layers.map((layer, index) => (
            <div
              key={layer.id}
              className={`p-3.5 rounded-xl border transition-all ${
                layer.visible
                  ? 'bg-white border-border shadow-xs'
                  : 'bg-surface border-border opacity-60'
              }`}
            >
              {/* Row 1: Title & Main Toggles */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center space-x-2.5 truncate">
                  <div
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: layer.color || '#7B1E2D' }}
                  />
                  <span className="text-sm font-bold text-text truncate">
                    {layer.name}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5">
                  {/* Zoom to layer extent */}
                  <button
                    onClick={() => onZoomToLayer(layer)}
                    title="Zoom to Extent"
                    className="p-1.5 rounded text-muted hover:text-text hover:bg-surface transition-colors"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>

                  {/* Visibility Toggle */}
                  <button
                    onClick={() => onToggleVisibility(layer.id)}
                    title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                    className={`p-1.5 rounded transition-colors ${
                      layer.visible ? 'text-brand hover:opacity-80' : 'text-muted hover:text-text'
                    }`}
                  >
                    {layer.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>

                  {/* Delete Layer */}
                  <button
                    onClick={() => onRemoveLayer(layer.id)}
                    title="Remove Layer"
                    className="p-1.5 rounded text-muted hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Row 2: Badges & Specs */}
              <div className="flex items-center space-x-2 text-xs text-muted mb-2.5">
                <span className="px-2 py-0.5 rounded bg-surface border border-border text-text font-medium">
                  {layer.format || 'GeoJSON'}
                </span>
                <span>{layer.featureCount || layer.geojson?.features?.length || 0} features</span>
                <span>•</span>
                <span className="capitalize">{layer.geometryType || 'Geometry'}</span>
              </div>

              {/* Row 3: Opacity Slider & Order Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                <div className="flex items-center space-x-2 flex-1 max-w-[160px]">
                  <Sliders className="w-3.5 h-3.5 text-muted flex-shrink-0" />
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={layer.opacity ?? 0.8}
                    onChange={(e) => onChangeOpacity(layer.id, parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-[#7B1E2D]"
                  />
                  <span className="text-xs font-mono text-text w-7">
                    {Math.round((layer.opacity ?? 0.8) * 100)}%
                  </span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    disabled={index === 0}
                    onClick={() => onReorderLayer(index, index - 1)}
                    className="p-1 rounded text-muted hover:text-brand disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move Layer Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={index === layers.length - 1}
                    onClick={() => onReorderLayer(index, index + 1)}
                    className="p-1 rounded text-muted hover:text-brand disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move Layer Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Ingestion Dropzone Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center space-x-2">
                <Upload className="w-5 h-5 text-brand" />
                <h3 className="font-bold text-base text-text">Ingest Geospatial Dataset</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted hover:text-text text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              Upload multi-source GIS datasets into the active memory pipeline. Supports GeoJSON polygons/lines, CSV/TSV tables, and KML (EPSG:4326 & Web Mercator auto-detected).
            </p>

            {/* Drop Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-brand rounded-xl p-8 text-center cursor-pointer transition-colors bg-surface hover:bg-surface/80 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".geojson,.json,.csv,.tsv,.kml,.txt"
                onChange={(e) => handleFileUpload(e.target.files?.[0])}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-brand-light text-brand mx-auto flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                {isUploading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
              </div>
              <p className="text-sm font-semibold text-text">
                {isUploading ? 'Parsing & projecting spatial features...' : 'Click to browse or drag file here'}
              </p>
              <p className="text-xs text-muted mt-1">
                Accepted: .geojson, .json, .csv, .tsv, .kml (Auto-reprojects to WGS84)
              </p>
            </div>

            {/* Replace vs Overlay Toggle */}
            <label className={`flex items-center space-x-2.5 p-2.5 rounded-xl border cursor-pointer select-none transition-colors ${
              replaceExisting
                ? 'border-amber-300 bg-amber-50 hover:bg-amber-100'
                : 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100'
            }`}>
              <input
                type="checkbox"
                checked={replaceExisting}
                onChange={(e) => setReplaceExisting(e.target.checked)}
                className="w-4 h-4 rounded text-brand focus:ring-brand accent-brand cursor-pointer"
              />
              <div className="flex-1 text-xs">
                {replaceExisting ? (
                  <>
                    <span className="font-bold text-amber-800 block">⚠ Replace all layers</span>
                    <span className="text-[11px] text-amber-600">Clears the map and loads only this file</span>
                  </>
                ) : (
                  <>
                    <span className="font-bold text-emerald-800 block">✓ Add as overlay (stack)</span>
                    <span className="text-[11px] text-emerald-600">Keeps existing layers — adds this on top</span>
                  </>
                )}
              </div>
            </label>

            {/* Quick-Load Ingested Datasets from Folder */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-2">
                Or Ingest Curated Datasets from Workspace:
              </span>
              <div className="grid grid-cols-1 gap-1.5">


                <button
                  type="button"
                  onClick={async () => {
                    setIsUploading(true);
                    try {
                      const res = await fetch('./data/telangana_groundwater_wells.geojson');
                      const json = await res.json();
                      onAddLayer({
                        id: `gw-${Date.now()}`,
                        name: 'Telangana Groundwater (1.7k Wells)',
                        format: 'GeoJSON',
                        geojson: json,
                        featureCount: json.features?.length || 0,
                        geometryType: 'Point',
                        visible: true,
                        opacity: 0.9,
                        color: '#10b981'
                      }, replaceExisting);
                      setIsModalOpen(false);
                    } catch (e) {
                      setUploadError('Failed to load Telangana Groundwater layer.');
                    } finally {
                      setIsUploading(false);
                    }
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl border border-border bg-surface hover:border-brand/40 text-xs font-semibold text-text flex items-center justify-between transition-colors"
                >
                  <span className="truncate">Telangana SGWD Groundwater (1,769 Wells)</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">188k CSV</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    setIsUploading(true);
                    try {
                      const res = await fetch('./data/telangana_cadastral_villages.geojson');
                      const json = await res.json();
                      onAddLayer({
                        id: `cad-${Date.now()}`,
                        name: 'Telangana Village Cadastre (SOI)',
                        format: 'GeoJSON',
                        geojson: json,
                        featureCount: json.features?.length || 0,
                        geometryType: 'Polygon',
                        visible: true,
                        opacity: 0.75,
                        color: '#3b82f6'
                      }, replaceExisting);
                      setIsModalOpen(false);
                    } catch (e) {
                      setUploadError('Failed to load Telangana Cadastre layer.');
                    } finally {
                      setIsUploading(false);
                    }
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl border border-border bg-surface hover:border-brand/40 text-xs font-semibold text-text flex items-center justify-between transition-colors"
                >
                  <span className="truncate">Telangana Cadastral Boundaries (SOI)</span>
                  <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">10.4k SHP</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    setIsUploading(true);
                    try {
                      const res = await fetch('./data/telangana_osm_roads.geojson');
                      const json = await res.json();
                      onAddLayer({
                        id: `osm-${Date.now()}`,
                        name: 'OSM Transport Corridors (map.osm)',
                        format: 'GeoJSON',
                        geojson: json,
                        featureCount: json.features?.length || 0,
                        geometryType: 'LineString',
                        visible: true,
                        opacity: 0.9,
                        color: '#f59e0b'
                      }, replaceExisting);
                      setIsModalOpen(false);
                    } catch (e) {
                      setUploadError('Failed to load OSM Road layer.');
                    } finally {
                      setIsUploading(false);
                    }
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl border border-border bg-surface hover:border-brand/40 text-xs font-semibold text-text flex items-center justify-between transition-colors"
                >
                  <span className="truncate">OpenStreetMap Corridors (map.osm)</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">OSM XML</span>
                </button>
              </div>
            </div>

            {uploadError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{uploadError}</span>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-surface border border-border text-text hover:bg-border transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
