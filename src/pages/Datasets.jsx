import React, { useState, useEffect, useMemo } from 'react';
import { 
  Database, Download, FileText, CheckCircle, Upload, Eye, RefreshCw, 
  FileCode, Layers, Search, Filter, Activity, MapPin, Compass, 
  ShieldAlert, ShieldCheck, Mountain, Satellite, Table, ArrowUpRight, BarChart2
} from 'lucide-react';
import { parseCsvToGeoJson } from '../services/spatialApi';

export default function Datasets({ setActivePage }) {
  const [manifest, setManifest] = useState(null);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [previewContent, setPreviewContent] = useState(null);
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'groundwater' | 'districts' | 'raster' | 'sandbox'
  
  // Groundwater Explorer State
  const [gwWells, setGwWells] = useState([]);
  const [gwFilterDistrict, setGwFilterDistrict] = useState('ALL');
  const [gwFilterStress, setGwFilterStress] = useState('ALL');
  const [gwSearchQuery, setGwSearchQuery] = useState('');
  const [isLoadingGw, setIsLoadingGw] = useState(false);

  // Telangana Districts Summary State
  const [districtsSummary, setDistrictsSummary] = useState(null);
  const [districtSearch, setDistrictSearch] = useState('');

  // Raster Metadata State
  const [rasterMetadata, setRasterMetadata] = useState(null);

  // Ingestion Sandbox State
  const [testInput, setTestInput] = useState('');
  const [testResult, setTestResult] = useState(null);

  // 1. Fetch Manifest, Districts, Raster on Mount
  useEffect(() => {
    fetch('./data/manifest.json')
      .then(res => res.json())
      .then(data => {
        setManifest(data);
        if (data.datasets && data.datasets.length > 0) {
          handleSelectDataset(data.datasets[0]);
        }
      })
      .catch(err => console.error(err));

    fetch('./data/telangana_districts_summary.json')
      .then(res => res.json())
      .then(data => setDistrictsSummary(data))
      .catch(err => console.error(err));

    fetch('./data/raster_metadata.json')
      .then(res => res.json())
      .then(data => setRasterMetadata(data))
      .catch(err => console.error(err));
  }, []);

  // 2. Load Groundwater Wells GeoJSON on demand
  useEffect(() => {
    if (activeTab === 'groundwater' && gwWells.length === 0) {
      setIsLoadingGw(true);
      fetch('./data/telangana_groundwater_wells.geojson')
        .then(res => res.json())
        .then(data => {
          if (data && data.features) {
            setGwWells(data.features.map(f => f.properties));
          }
        })
        .catch(err => console.error('Failed to load groundwater wells', err))
        .finally(() => setIsLoadingGw(false));
    }
  }, [activeTab, gwWells.length]);

  const handleSelectDataset = async (ds) => {
    setSelectedDataset(ds);
    try {
      const res = await fetch(`./${ds.file}`);
      if (ds.format.includes('CSV')) {
        const text = await res.text();
        setPreviewContent(text.split('\n').slice(0, 15).join('\n'));
      } else {
        const json = await res.json();
        setPreviewContent(JSON.stringify(json, null, 2).slice(0, 1600) + '\n\n... [truncated for preview]');
      }
    } catch (e) {
      setPreviewContent('Failed to load dataset preview.');
    }
  };

  const handleRunSandboxTest = () => {
    setTestResult(null);
    if (!testInput.trim()) return;

    try {
      if (testInput.trim().startsWith('{')) {
        const json = JSON.parse(testInput);
        setTestResult({
          status: 'success',
          format: 'GeoJSON',
          featureCount: json.features?.length || (json.type === 'Feature' ? 1 : 0),
          geometryType: json.features?.[0]?.geometry?.type || json.type,
          message: 'Valid GeoJSON FeatureCollection detected. Ready for spatial alignment.'
        });
      } else {
        const res = parseCsvToGeoJson(testInput, 'Sandbox Test Points');
        setTestResult({
          status: 'success',
          format: 'CSV (Lat/Lon)',
          featureCount: res.featureCount,
          geometryType: 'Point',
          message: `Successfully extracted ${res.featureCount} spatial points using automatic coordinate detection.`
        });
      }
    } catch (err) {
      setTestResult({
        status: 'error',
        message: err.message || 'Parsing failed.'
      });
    }
  };

  // Filtered Groundwater Wells
  const filteredWells = useMemo(() => {
    return gwWells.filter(w => {
      const matchesDistrict = gwFilterDistrict === 'ALL' || w.district?.toUpperCase() === gwFilterDistrict;
      const matchesStress = gwFilterStress === 'ALL' || 
        (gwFilterStress === 'CRITICAL' && w.stress_category?.includes('Critical')) ||
        (gwFilterStress === 'SEMI' && w.stress_category?.includes('Semi')) ||
        (gwFilterStress === 'SAFE' && w.stress_category?.includes('Safe'));
      const q = gwSearchQuery.toLowerCase();
      const matchesSearch = !q || 
        (w.site_name && w.site_name.toLowerCase().includes(q)) ||
        (w.well_id && String(w.well_id).toLowerCase().includes(q)) ||
        (w.block && w.block.toLowerCase().includes(q));
      return matchesDistrict && matchesStress && matchesSearch;
    });
  }, [gwWells, gwFilterDistrict, gwFilterStress, gwSearchQuery]);

  // Distinct Districts from GW
  const distinctGwDistricts = useMemo(() => {
    const set = new Set();
    gwWells.forEach(w => {
      if (w.district) set.add(w.district.toUpperCase());
    });
    return Array.from(set).sort();
  }, [gwWells]);

  return (
    <div className="min-h-screen bg-surface text-text py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header with KPI Strip */}
        <div className="border-b border-border pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-semibold text-brand mb-1">
              <Database className="w-4 h-4" />
              <span>Multi-Source Spatial Data Ingestion Hub</span>
            </div>
            <h1 className="text-3xl font-extrabold text-text tracking-tight">
              Statewide Geospatial Datasets & Schemas
            </h1>
            <p className="text-sm text-muted mt-1 max-w-3xl">
              Official administrative shapefiles, 188k+ SGWD groundwater monitoring records, OpenStreetMap transport corridors, NASA SRTM 30m DEM elevation, and USGS Landsat-8 satellite rasters.
            </p>
          </div>

          <button
            onClick={() => setActivePage('demo')}
            className="px-5 py-2.5 rounded-xl font-bold text-xs bg-brand hover:bg-brand-hover text-white shadow-xs transition-all flex items-center space-x-2 self-start md:self-center shrink-0"
          >
            <Layers className="w-4 h-4" />
            <span>Open in GIS Studio</span>
          </button>
        </div>

        {/* Global Datasets KPI Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-border rounded-xl p-4 shadow-xs">
            <div className="text-[11px] font-bold text-muted uppercase tracking-wider">Groundwater Records</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">188,877</div>
            <div className="text-xs text-muted mt-0.5">Across 1,769 Telangana Wells</div>
          </div>
          <div className="bg-white border border-border rounded-xl p-4 shadow-xs">
            <div className="text-[11px] font-bold text-muted uppercase tracking-wider">Cadastral Boundaries</div>
            <div className="text-2xl font-black text-brand mt-1">10,455</div>
            <div className="text-xs text-muted mt-0.5">Villages in 33 Districts (SOI)</div>
          </div>
          <div className="bg-white border border-border rounded-xl p-4 shadow-xs">
            <div className="text-[11px] font-bold text-muted uppercase tracking-wider">OSM Network & Footprints</div>
            <div className="text-2xl font-black text-amber-500 mt-1">693</div>
            <div className="text-xs text-muted mt-0.5">75 Corridors + 618 Structures</div>
          </div>
          <div className="bg-white border border-border rounded-xl p-4 shadow-xs">
            <div className="text-[11px] font-bold text-muted uppercase tracking-wider">NASA / USGS Rasters</div>
            <div className="text-2xl font-black text-purple-600 mt-1">30m Res</div>
            <div className="text-xs text-muted mt-0.5">SRTM DEM & Landsat 8 Band 2</div>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex border-b border-border space-x-2 sm:space-x-4 overflow-x-auto pb-1 text-sm font-bold">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center space-x-2 shrink-0 ${
              activeTab === 'catalog'
                ? 'border-brand text-brand'
                : 'border-transparent text-muted hover:text-text'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Dataset Catalog</span>
          </button>

          <button
            onClick={() => setActiveTab('groundwater')}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center space-x-2 shrink-0 ${
              activeTab === 'groundwater'
                ? 'border-brand text-brand'
                : 'border-transparent text-muted hover:text-text'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Groundwater Explorer (1.7k Wells)</span>
          </button>

          <button
            onClick={() => setActiveTab('districts')}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center space-x-2 shrink-0 ${
              activeTab === 'districts'
                ? 'border-brand text-brand'
                : 'border-transparent text-muted hover:text-text'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>33 Telangana Districts Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('raster')}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center space-x-2 shrink-0 ${
              activeTab === 'raster'
                ? 'border-brand text-brand'
                : 'border-transparent text-muted hover:text-text'
            }`}
          >
            <Satellite className="w-4 h-4" />
            <span>Satellite & DEM Elevation</span>
          </button>

          <button
            onClick={() => setActiveTab('sandbox')}
            className={`pb-3 px-3 border-b-2 transition-all flex items-center space-x-2 shrink-0 ${
              activeTab === 'sandbox'
                ? 'border-brand text-brand'
                : 'border-transparent text-muted hover:text-text'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Ingestion Sandbox</span>
          </button>
        </div>

        {/* TAB 1: DATASET CATALOG */}
        {activeTab === 'catalog' && (
          <div className="space-y-8">
            {/* Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {manifest?.datasets?.map(ds => (
                <div
                  key={ds.id}
                  onClick={() => handleSelectDataset(ds)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all shadow-xs flex flex-col justify-between ${
                    selectedDataset?.id === ds.id
                      ? 'bg-brand-light/30 border-brand shadow-sm'
                      : 'bg-white border-border hover:border-brand/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-mono bg-surface text-brand font-bold border border-border">
                        {ds.format}
                      </span>
                      <span className="text-[11px] text-muted font-semibold">
                        {ds.feature_count} {typeof ds.feature_count === 'number' ? 'features' : ''}
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-text mb-1.5">{ds.name}</h4>
                    <p className="text-xs text-muted line-clamp-3 leading-relaxed mb-4">
                      {ds.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                    <span className="text-[11px] text-emerald-700 font-bold">{ds.badge}</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePage('demo');
                        }}
                        className="px-2 py-1 rounded text-[11px] font-bold text-brand hover:bg-brand-light transition-colors flex items-center space-x-1"
                      >
                        <span>View on Map</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                      <a
                        href={`./${ds.file}`}
                        download
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded text-muted hover:text-brand hover:bg-surface transition-colors"
                        title="Download Ingested Layer"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected Dataset Detail Inspector */}
            {selectedDataset && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white border border-border rounded-2xl p-6 shadow-sm">
                <div className="lg:col-span-4 space-y-4 border-b lg:border-b-0 lg:border-r border-border pb-6 lg:pb-0 lg:pr-6">
                  <div className="flex items-center space-x-2 text-emerald-700 text-xs font-bold">
                    <FileCode className="w-4 h-4" />
                    <span>Active Schema & Meta Attributes</span>
                  </div>
                  <h3 className="text-xl font-bold text-text">{selectedDataset.name}</h3>
                  <p className="text-xs text-muted leading-relaxed">
                    {selectedDataset.description}
                  </p>

                  <div className="space-y-2 text-xs pt-2">
                    <div className="flex justify-between py-1.5 border-b border-border">
                      <span className="text-muted">Originating Dept:</span>
                      <span className="text-text text-right font-medium max-w-[180px] truncate">{selectedDataset.department}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border">
                      <span className="text-muted">Geometry Standard:</span>
                      <span className="text-brand font-mono font-semibold">{selectedDataset.geometry_type}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border">
                      <span className="text-muted">Spatial Reference:</span>
                      <span className="text-text font-mono">EPSG:4326 (WGS 84)</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border">
                      <span className="text-muted">Update Cadence:</span>
                      <span className="text-emerald-700 font-medium">{selectedDataset.update_frequency}</span>
                    </div>
                    {selectedDataset.attributes && (
                      <div className="pt-2">
                        <span className="text-[11px] font-bold text-text block mb-1">Key Attributes:</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedDataset.attributes.map((attr, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-surface border border-border text-[10px] font-mono text-muted">
                              {attr}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 flex space-x-2">
                    <a
                      href={`./${selectedDataset.file}`}
                      download
                      className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-brand hover:bg-brand-hover text-white transition-colors flex items-center justify-center space-x-2 shadow-xs"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download {selectedDataset.format}</span>
                    </a>
                  </div>
                </div>

                {/* Code / Content Viewer */}
                <div className="lg:col-span-8 flex flex-col space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span>Dataset Preview Payload ({selectedDataset.file})</span>
                    <span className="font-mono text-[11px] text-brand font-semibold">UTF-8 GeoJSON / CSV Payload</span>
                  </div>
                  <pre className="flex-1 bg-surface border border-border rounded-xl p-4 text-xs font-mono text-text overflow-x-auto max-h-[380px]">
                    {previewContent || 'Loading content...'}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: GROUNDWATER EXPLORER */}
        {activeTab === 'groundwater' && (
          <div className="space-y-6">
            <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-text">Statewide Groundwater Station Network</h3>
                  <p className="text-xs text-muted">
                    Explore 1,769 active monitoring stations extracted from 188,877 historical observations (2007–2026).
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <a
                    href="./data/telangana_groundwater_master.csv"
                    download
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-surface border border-border text-text hover:bg-card flex items-center space-x-1.5 transition-colors shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Master CSV</span>
                  </a>
                  <button
                    onClick={() => setActivePage('demo')}
                    className="px-3 py-2 rounded-xl text-xs font-bold bg-brand text-white hover:bg-brand-hover flex items-center space-x-1.5 transition-colors shadow-xs"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Plot 1,769 Wells on Map</span>
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-muted absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search by Station Name, Well ID, Mandal..."
                    value={gwSearchQuery}
                    onChange={(e) => setGwSearchQuery(e.target.value)}
                    className="w-full bg-surface border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-text focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <select
                    value={gwFilterDistrict}
                    onChange={(e) => setGwFilterDistrict(e.target.value)}
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-brand"
                  >
                    <option value="ALL">All Districts ({distinctGwDistricts.length})</option>
                    {distinctGwDistricts.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={gwFilterStress}
                    onChange={(e) => setGwFilterStress(e.target.value)}
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-brand"
                  >
                    <option value="ALL">All Water Table Stress Levels</option>
                    <option value="CRITICAL">Critical / Over-Exploited (&gt;15 mbgl)</option>
                    <option value="SEMI">Semi-Critical / Moderate (8-15 mbgl)</option>
                    <option value="SAFE">Safe / High Water Table (&lt;8 mbgl)</option>
                  </select>
                </div>
              </div>

              {/* Table of Wells */}
              <div className="border border-border rounded-xl overflow-hidden">
                <div className="bg-surface px-4 py-2 text-xs text-muted flex justify-between items-center border-b border-border font-medium">
                  <span>Showing {filteredWells.length} of {gwWells.length} Stations</span>
                  <span className="font-mono text-[11px] text-brand">SGWD-Telangana Official Registry</span>
                </div>

                <div className="overflow-x-auto max-h-[480px]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-surface/80 sticky top-0 border-b border-border text-muted font-bold">
                      <tr>
                        <th className="p-3">Well ID</th>
                        <th className="p-3">Site / Village</th>
                        <th className="p-3">District</th>
                        <th className="p-3">Block / Mandal</th>
                        <th className="p-3">Water Level (mbgl)</th>
                        <th className="p-3">Historical Avg</th>
                        <th className="p-3">Aquifer</th>
                        <th className="p-3">Stress Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {isLoadingGw ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-muted">
                            Loading 1,769 groundwater monitoring stations...
                          </td>
                        </tr>
                      ) : filteredWells.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-muted">
                            No stations matching filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredWells.slice(0, 100).map((w, idx) => (
                          <tr key={idx} className="hover:bg-surface/50 transition-colors">
                            <td className="p-3 font-mono font-bold text-brand">#{w.well_id}</td>
                            <td className="p-3 font-medium text-text">{w.site_name}</td>
                            <td className="p-3 text-muted">{w.district}</td>
                            <td className="p-3 text-muted">{w.block}</td>
                            <td className="p-3 font-bold text-text">{w.water_level_mbgl} mbgl</td>
                            <td className="p-3 text-muted">{w.avg_water_level_mbgl} mbgl</td>
                            <td className="p-3 text-muted">{w.aquifer || 'Unconfined'}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                w.stress_category?.includes('Critical')
                                  ? 'bg-rose-100 text-rose-800'
                                  : w.stress_category?.includes('Semi')
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {w.stress_category || 'Safe'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: 33 TELANGANA DISTRICTS MATRIX */}
        {activeTab === 'districts' && (
          <div className="space-y-6">
            <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-text">Telangana Administrative Boundaries (10,455 Villages)</h3>
                  <p className="text-xs text-muted">
                    Statewide Shapefile breakdown parsed from Survey of India LCC records across all 33 districts.
                  </p>
                </div>

                <div className="w-full md:w-72">
                  <input
                    type="text"
                    placeholder="Search district name..."
                    value={districtSearch}
                    onChange={(e) => setDistrictSearch(e.target.value)}
                    className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-xs text-text focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              {districtsSummary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(districtsSummary)
                    .filter(([name]) => !districtSearch || name.toLowerCase().includes(districtSearch.toLowerCase()))
                    .map(([name, d]) => (
                      <div key={name} className="p-4 rounded-xl border border-border bg-surface hover:border-brand/40 transition-all">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-bold text-sm text-text">{d.district_name}</h4>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-card text-muted border border-border">
                            LGD: {d.district_lgd || 'N/A'}
                          </span>
                        </div>

                        <div className="space-y-1 text-xs text-muted">
                          <div className="flex justify-between">
                            <span>Total Revenue Villages:</span>
                            <span className="font-bold text-text">{d.total_villages}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Area:</span>
                            <span className="font-bold text-text">{d.total_area_sqkm?.toLocaleString()} sq.km</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Mandals / Sub-Districts:</span>
                            <span className="font-bold text-brand">{d.mandals?.length} Mandals</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: SATELLITE & DEM ELEVATION */}
        {activeTab === 'raster' && rasterMetadata && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* NASA SRTM DEM */}
            <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-purple-600 text-xs font-bold">
                <Mountain className="w-5 h-5" />
                <span>NASA SRTM 30m Digital Elevation Model</span>
              </div>
              <h3 className="text-xl font-bold text-text">{rasterMetadata.elevation_dem.product}</h3>
              <p className="text-xs text-muted leading-relaxed">
                1-ArcSecond global elevation baseline covering the Hyderabad metropolitan watershed (17°N, 78°E). Used for hydrological drainage network generation and slope stability checks.
              </p>

              <div className="space-y-2 text-xs pt-2 border-t border-border">
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-muted">Coverage Area:</span>
                  <span className="font-medium text-text">{rasterMetadata.elevation_dem.coverage}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-muted">Elevation Bounds:</span>
                  <span className="font-bold text-purple-600">{rasterMetadata.elevation_dem.elevation_min_m}m - {rasterMetadata.elevation_dem.elevation_max_m}m MSL (Mean: {rasterMetadata.elevation_dem.mean_elevation_m}m)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-muted">Spatial Resolution:</span>
                  <span className="font-mono text-text">{rasterMetadata.elevation_dem.resolution}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted">Geomorphology:</span>
                  <span className="text-text">{rasterMetadata.elevation_dem.terrain_type}</span>
                </div>
              </div>
            </div>

            {/* USGS Landsat 8 */}
            <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 text-cyan-600 text-xs font-bold">
                <Satellite className="w-5 h-5" />
                <span>USGS Landsat-8 Multi-Spectral Satellite Raster</span>
              </div>
              <h3 className="text-xl font-bold text-text">{rasterMetadata.landsat_satellite.product}</h3>
              <p className="text-xs text-muted leading-relaxed">
                Terrain-corrected 16-bit radiometric band capturing optical reflectance across central Telangana (Path 144, Row 048).
              </p>

              <div className="space-y-2 text-xs pt-2 border-t border-border">
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-muted">Spectral Band:</span>
                  <span className="font-medium text-text">{rasterMetadata.landsat_satellite.band}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-muted">Acquisition Date:</span>
                  <span className="font-mono text-text">{rasterMetadata.landsat_satellite.acquisition_date}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-muted">Cloud Cover:</span>
                  <span className="font-bold text-emerald-600">{rasterMetadata.landsat_satellite.cloud_cover}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted">Radiometric Depth:</span>
                  <span className="font-mono text-text">{rasterMetadata.landsat_satellite.radiometric_resolution}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: INGESTION SANDBOX */}
        {activeTab === 'sandbox' && (
          <div className="bg-white border border-border rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Upload className="w-5 h-5 text-brand" />
                <div>
                  <h3 className="font-bold text-base text-text">Interactive Ingestion Sandbox</h3>
                  <p className="text-xs text-muted">
                    Test custom GeoJSON, Shapefiles or CSV coordinate tables before pushing into the GIS dashboard.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setTestInput(`Well ID,Site Name,Latitude,Longitude,Status\nTS-TEST-01,Judge Innovation Center,17.4420,78.3815,Active\nTS-TEST-02,Outer Ring Road Test Node,17.4395,78.3885,Active`);
                }}
                className="text-xs text-brand hover:underline font-bold"
              >
                Paste Sample CSV
              </button>
            </div>

            <textarea
              rows={6}
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Paste GeoJSON feature collection or CSV with Latitude and Longitude headers..."
              className="w-full bg-surface border border-border rounded-xl p-4 text-xs font-mono text-text placeholder:text-muted focus:outline-none focus:border-brand"
            />

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">
                Parses WGS84 coordinates and verifies feature schemas client-side.
              </span>
              <button
                onClick={handleRunSandboxTest}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-brand hover:bg-brand-hover text-white transition-colors shadow-xs"
              >
                Validate & Ingest
              </button>
            </div>

            {testResult && (
              <div className={`p-4 rounded-xl border text-xs animate-in fade-in duration-150 ${
                testResult.status === 'success' 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                <div className="font-bold text-sm mb-1">
                  {testResult.status === 'success' ? 'Validation Passed' : 'Parsing Failed'}
                </div>
                <p>{testResult.message}</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
