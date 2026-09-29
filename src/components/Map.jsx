import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, Eye, EyeOff, Maximize2, MapPin, AlertTriangle, ShieldCheck, Compass, Plus, Minus, RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Crosshair } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// Fix Leaflet's default marker icons in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const BASEMAPS = {
  dark: {
    name: 'Tactical Dark',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    className: 'map-tiles-dark',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  satellite: {
    name: 'Satellite Hybrid',
    url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    attribution: '&copy; Google Maps'
  },
  light: {
    name: 'Street Light',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  osm: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }
};

export default function Map({
  layers = [],
  selectedFeature = null,
  onSelectFeature = () => {},
  conflictFeatures = null,
  topologyErrorFeatures = null,
  focusedTopologyErrorId = null,
  disasterRoute = null,
  flyToTarget = null
}) {
  const { theme, isDark } = useTheme();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const baseTileLayerRef = useRef(null);
  const vectorLayersRef = useRef({});
  const overlayLayersRef = useRef({});
  const topologySublayersRef = useRef({});

  const [activeBasemap, setActiveBasemap] = useState(isDark ? 'dark' : 'light');
  const [cursorCoords, setCursorCoords] = useState({ lat: 17.4385, lng: 78.3845 });
  const [zoomLevel, setZoomLevel] = useState(15);

  // Sync basemap when theme changes if currently on default dark/light
  useEffect(() => {
    setActiveBasemap(prev => {
      if (prev === 'dark' && !isDark) return 'light';
      if (prev === 'light' && isDark) return 'dark';
      return prev;
    });
  }, [isDark]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centered at HITEC City / Gachibowli urban cadastral zone
    const map = L.map(mapContainerRef.current, {
      center: [17.4385, 78.3845],
      zoom: 15,
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: true,
      wheelPxPerZoomLevel: 60,
      touchZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true
    });

    // Prevent scroll propagation from escaping map container
    L.DomEvent.disableScrollPropagation(mapContainerRef.current);

    // Initial base layer
    const initialCfg = BASEMAPS[isDark ? 'dark' : 'light'] || BASEMAPS.dark;
    const initialBase = L.tileLayer(initialCfg.url, {
      attribution: initialCfg.attribution,
      subdomains: initialCfg.subdomains || 'abc',
      className: initialCfg.className || '',
      maxZoom: 20
    }).addTo(map);
    baseTileLayerRef.current = initialBase;

    // Track mouse coordinates & zoom
    map.on('mousemove', (e) => {
      setCursorCoords({
        lat: Number(e.latlng.lat.toFixed(5)),
        lng: Number(e.latlng.lng.toFixed(5))
      });
    });

    map.on('zoomend', () => {
      setZoomLevel(map.getZoom());
    });

    mapInstanceRef.current = map;

    // Observe container resize to auto-adjust Leaflet canvas seamlessly
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Basemap Switch
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
    }

    const cfg = BASEMAPS[activeBasemap] || BASEMAPS.dark;
    const newBase = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      subdomains: cfg.subdomains || 'abc',
      className: cfg.className || '',
      maxZoom: 20
    }).addTo(map);

    // Ensure base tiles stay below vector overlays
    newBase.bringToBack();
    baseTileLayerRef.current = newBase;
  }, [activeBasemap]);

  // Render Vector Layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing rendered layers not in props
    const currentLayerIds = layers.map(l => l.id);
    Object.keys(vectorLayersRef.current).forEach(id => {
      if (!currentLayerIds.includes(id)) {
        map.removeLayer(vectorLayersRef.current[id]);
        delete vectorLayersRef.current[id];
      }
    });

    layers.forEach(layer => {
      if (!layer.geojson) return;

      // If already rendered, remove and re-render to reflect updates
      if (vectorLayersRef.current[layer.id]) {
        map.removeLayer(vectorLayersRef.current[layer.id]);
        delete vectorLayersRef.current[layer.id];
      }

      if (!layer.visible) return;

      const geoJsonLayer = L.geoJSON(layer.geojson, {
        style: (feature) => {
          // Cadastral Parcels & Administrative Boundaries
          if (layer.id.includes('cadastr') || feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
            const isDisputed = feature.properties?.status === 'Disputed Overlap';
            const isCorridorConflict = feature.properties?.status === 'Corridor Encroachment';
            const isHarmonized = feature.properties?.status === 'Harmonized (Clean)';

            let fillColor = layer.color || '#0f6fff';
            let strokeColor = '#38bdf8';

            if (isDisputed) {
              fillColor = '#f59e0b';
              strokeColor = '#fbbf24';
            } else if (isCorridorConflict) {
              fillColor = '#f43f5e';
              strokeColor = '#fb7185';
            } else if (isHarmonized) {
              fillColor = '#00b37e';
              strokeColor = '#34d399';
            }

            return {
              color: strokeColor,
              weight: 2,
              opacity: 0.95,
              fillColor: fillColor,
              fillOpacity: (layer.opacity || 0.6) * 0.45,
              dashArray: isDisputed ? '4, 4' : null
            };
          }

          // Roads and infrastructure corridors
          if (layer.id.includes('road') || feature.geometry.type === 'LineString' || feature.geometry.type === 'MultiLineString') {
            return {
              color: layer.color || '#f97316',
              weight: feature.properties?.lanes >= 6 ? 5 : 3.5,
              opacity: layer.opacity || 0.9,
              dashArray: feature.properties?.status?.includes('Statutory') ? '6, 6' : null
            };
          }

          return {
            color: layer.color || '#3b82f6',
            weight: 2,
            opacity: layer.opacity || 0.8
          };
        },

        pointToLayer: (feature, latlng) => {
          // Groundwater Monitoring Wells (Statewide SGWD dataset or sample)
          if (layer.id.includes('groundwater') || layer.id.includes('gw') || layer.format?.includes('CSV')) {
            const stress = feature.properties?.stress_category || '';
            const risk = feature.properties['Contamination Risk'] || feature.properties.contamination_risk || '';
            
            let markerColor = '#10b981'; // Safe
            if (stress.includes('Critical') || risk === 'High' || (feature.properties?.water_level_mbgl > 15)) {
              markerColor = '#ef4444'; // Red for Over-exploited
            } else if (stress.includes('Semi-Critical') || risk === 'Moderate' || (feature.properties?.water_level_mbgl > 8)) {
              markerColor = '#f59e0b'; // Amber
            }

            const markerHtml = `
              <div style="
                width: 12px; 
                height: 12px; 
                border-radius: 50%; 
                background: ${markerColor}; 
                border: 2px solid #ffffff; 
                box-shadow: 0 0 8px ${markerColor};
              "></div>
            `;
            const icon = L.divIcon({
              className: 'custom-gw-marker',
              html: markerHtml,
              iconSize: [12, 12],
              iconAnchor: [6, 6]
            });
            return L.marker(latlng, { icon });
          }

          // Emergency Relief Shelters
          if (layer.id.includes('shelter')) {
            const markerHtml = `
              <div style="
                width: 28px; 
                height: 28px; 
                border-radius: 8px; 
                background: #0f172a; 
                border: 2px solid #00b37e; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                box-shadow: 0 4px 12px rgba(0, 179, 126, 0.4);
                color: #00b37e;
                font-weight: bold;
                font-size: 13px;
              ">⛑️</div>
            `;
            const icon = L.divIcon({
              className: 'custom-shelter-marker',
              html: markerHtml,
              iconSize: [28, 28],
              iconAnchor: [14, 14]
            });
            return L.marker(latlng, { icon });
          }

          return L.circleMarker(latlng, {
            radius: 6,
            fillColor: layer.color || '#3b82f6',
            color: '#ffffff',
            weight: 1.5,
            opacity: 1,
            fillOpacity: 0.8
          });
        },

        onEachFeature: (feature, leafletLayer) => {
          leafletLayer.on('click', () => {
            onSelectFeature(feature, layer);
          });

          // Build rich popup content
          const props = feature.properties || {};
          let popupHtml = `<div class="p-2 space-y-1.5 text-xs">`;

          // 1. Telangana Revenue Village Cadastre
          if (props.village_name || props.Vill_name) {
            const vName = props.village_name || props.Vill_name;
            const mandal = props.mandal || props.Sub_dist;
            const dist = props.district || props.DISTRICT;
            const area = props.area_sqkm || (props.Shape_Area ? (props.Shape_Area / 1000000).toFixed(2) : 'N/A');
            const cat = props.category || props.Vill_cat || 'Cadastre';

            popupHtml += `
              <div class="font-bold text-sm text-sky-400 flex items-center justify-between border-b border-slate-700 pb-1 mb-1.5">
                <span>${vName}</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-500/30">${cat}</span>
              </div>
              <div class="text-slate-300"><strong class="text-slate-400">Mandal:</strong> ${mandal}</div>
              <div class="text-slate-300"><strong class="text-slate-400">District:</strong> ${dist}</div>
              <div class="text-slate-300"><strong class="text-slate-400">Area:</strong> ${area} sq.km</div>
              ${props.village_lgd ? `<div class="text-slate-300"><strong class="text-slate-400">Village LGD:</strong> ${props.village_lgd}</div>` : ''}
              <div class="text-slate-400 text-[10px] pt-1">Survey of India / Telangana Land Records</div>
            `;
          }
          // 2. Micro Parcel Cadastre (Benchmark)
          else if (props.parcel_id) {
            popupHtml += `
              <div class="font-bold text-sm text-blue-400 flex items-center justify-between border-b border-slate-700 pb-1 mb-1.5">
                <span>${props.parcel_id}</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/50 text-blue-300 border border-blue-500/30">${props.survey_no || 'Cadastre'}</span>
              </div>
              <div class="text-slate-300"><strong class="text-slate-400">Owner:</strong> ${props.owner_name}</div>
              <div class="text-slate-300"><strong class="text-slate-400">Zoning:</strong> ${props.zoning}</div>
              <div class="text-slate-300"><strong class="text-slate-400">Area:</strong> ${props.area_sqm?.toLocaleString()} m²</div>
              <div class="text-slate-300"><strong class="text-slate-400">Status:</strong> <span class="${props.status === 'Disputed Overlap' ? 'text-amber-400 font-semibold' : props.status === 'Corridor Encroachment' ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-semibold'}">${props.status}</span></div>
            `;
          }
          // 3. Groundwater Station
          else if (props.well_id || props['Well ID']) {
            const wId = props.well_id || props['Well ID'];
            const site = props.site_name || props['Site Name'] || props.village || props['Site / Village'];
            const mbgl = props.water_level_mbgl || props['Water Level (mbgl)'] || 'N/A';
            const depth = props.depth_m || props['Depth (m)'] || props['Well Depth, m'] || 'N/A';
            const stress = props.stress_category || props['Stress Status'] || (props['Contamination Risk'] ? `Risk: ${props['Contamination Risk']}` : 'Active');
            const aquifer = props.aquifer || props['Aquifer Tapped (Unconfined, Semi-Confined, Confined)'] || 'Unconfined';
            const dist = props.district || props['District'];

            popupHtml += `
              <div class="font-bold text-sm text-emerald-400 flex items-center justify-between border-b border-slate-700 pb-1 mb-1.5">
                <span>${site}</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">Well #${wId}</span>
              </div>
              ${dist ? `<div class="text-slate-300"><strong class="text-slate-400">District:</strong> ${dist}</div>` : ''}
              <div class="text-slate-300"><strong class="text-slate-400">Water Level:</strong> <span class="font-bold text-emerald-300">${mbgl} mbgl</span></div>
              <div class="text-slate-300"><strong class="text-slate-400">Well Depth:</strong> ${depth} m</div>
              <div class="text-slate-300"><strong class="text-slate-400">Aquifer:</strong> ${aquifer}</div>
              <div class="text-slate-300"><strong class="text-slate-400">Status:</strong> <span class="font-bold ${stress.includes('Critical') || stress.includes('High') ? 'text-rose-400' : stress.includes('Semi') || stress.includes('Moderate') ? 'text-amber-400' : 'text-emerald-400'}">${stress}</span></div>
            `;
          }
          // 4. OSM Highway / Infrastructure Corridors
          else if (props.highway || props.corridor_id || props.name) {
            popupHtml += `
              <div class="font-bold text-sm text-amber-400 border-b border-slate-700 pb-1 mb-1.5">${props.name || 'Infrastructure Corridor'}</div>
              ${props.highway ? `<div class="text-slate-300"><strong class="text-slate-400">Highway Type:</strong> ${props.highway}</div>` : ''}
              ${props.type ? `<div class="text-slate-300"><strong class="text-slate-400">Type:</strong> ${props.type}</div>` : ''}
              ${props.lanes ? `<div class="text-slate-300"><strong class="text-slate-400">Lanes:</strong> ${props.lanes}</div>` : ''}
              ${props.surface ? `<div class="text-slate-300"><strong class="text-slate-400">Surface:</strong> ${props.surface}</div>` : ''}
              ${props.row_buffer_m ? `<div class="text-slate-300"><strong class="text-slate-400">Statutory RoW:</strong> ${props.row_buffer_m}m Buffer</div>` : ''}
            `;
          }
          // 5. Disaster Shelters
          else if (props.shelter_id) {
            popupHtml += `
              <div class="font-bold text-sm text-emerald-400 border-b border-slate-700 pb-1 mb-1.5">${props.name}</div>
              <div class="text-slate-300"><strong class="text-slate-400">Capacity:</strong> ${props.capacity?.toLocaleString()} persons</div>
              <div class="text-slate-300"><strong class="text-slate-400">Occupancy:</strong> ${props.current_occupancy?.toLocaleString()}</div>
              <div class="text-slate-300"><strong class="text-slate-400">Medical Team:</strong> ${props.medical_team ? '✅ Present' : '❌ Standby'}</div>
              <div class="text-slate-300"><strong class="text-slate-400">Aux Generator:</strong> ${props.generator_backup ? '✅ 24/7 Active' : '❌ None'}</div>
              <div class="text-slate-300"><strong class="text-slate-400">Supplies:</strong> ${props.supplies_days} days reserve</div>
            `;
          } else {
            // General key-value fallback
            Object.entries(props).slice(0, 5).forEach(([k, v]) => {
              popupHtml += `<div class="text-slate-300"><strong class="text-slate-400">${k}:</strong> ${v}</div>`;
            });
          }

          popupHtml += `</div>`;
          leafletLayer.bindPopup(popupHtml);
        }
      }).addTo(map);

      vectorLayersRef.current[layer.id] = geoJsonLayer;
    });
  }, [layers]);

  // Render Overlays: Conflicts, Topology Fixes, Disaster Route
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous overlays
    ['conflict', 'topology', 'disaster_route', 'disaster_corridor'].forEach(key => {
      if (overlayLayersRef.current[key]) {
        map.removeLayer(overlayLayersRef.current[key]);
        delete overlayLayersRef.current[key];
      }
    });

    // 1. Conflict Highlights
    if (conflictFeatures && conflictFeatures.features?.length > 0) {
      const conflictLayer = L.geoJSON(conflictFeatures, {
        style: {
          color: '#f43f5e',
          weight: 3,
          fillColor: '#f43f5e',
          fillOpacity: 0.65,
          className: 'leaflet-conflict-pulse'
        },
        onEachFeature: (feature, l) => {
          l.bindPopup(`
            <div class="p-2 text-xs space-y-1">
              <div class="font-bold text-rose-400 flex items-center space-x-1">
                <span>⚠️ Right-of-Way Encroachment</span>
              </div>
              <div><strong>Parcel:</strong> ${feature.properties.parcelId}</div>
              <div><strong>Corridor:</strong> ${feature.properties.corridorName}</div>
              <div><strong>Infringement Area:</strong> ${feature.properties.encroachmentAreaSqm} m² (${feature.properties.percentageOfParcel})</div>
              <div class="text-rose-300 mt-1 font-semibold">Severity: ${feature.properties.severity}</div>
            </div>
          `);
        }
      }).addTo(map);
      overlayLayersRef.current.conflict = conflictLayer;
    }

    // 2. Topology Error Highlights
    topologySublayersRef.current = {};
    if (topologyErrorFeatures && topologyErrorFeatures.features?.length > 0) {
      const topoLayer = L.geoJSON(topologyErrorFeatures, {
        style: (feature) => {
          const fid = feature.properties?.id || feature.id;
          const isFocused = Boolean(
            focusedTopologyErrorId && (
              fid === focusedTopologyErrorId ||
              feature.id === `err-poly-${focusedTopologyErrorId}` ||
              feature.id === focusedTopologyErrorId
            )
          );
          return {
            color: isFocused ? '#ef4444' : '#f59e0b',
            weight: isFocused ? 5 : 3,
            fillColor: isFocused ? '#ea580c' : '#f59e0b',
            fillOpacity: isFocused ? 0.95 : 0.65,
            dashArray: isFocused ? '6, 3' : '4, 4',
            className: isFocused ? 'leaflet-focused-topology-pulse' : ''
          };
        },
        onEachFeature: (feature, l) => {
          const fid = feature.properties?.id || feature.id;
          if (fid) topologySublayersRef.current[fid] = l;
          if (feature.id) topologySublayersRef.current[feature.id] = l;
          if (feature.properties?.id) topologySublayersRef.current[`err-poly-${feature.properties.id}`] = l;

          l.bindPopup(`
            <div class="p-2.5 text-xs space-y-1.5 min-w-[210px]">
              <div class="font-bold text-sm text-amber-500 flex items-center space-x-1">
                <span>⚠️ Topology Sliver Overlap</span>
              </div>
              <div class="text-slate-200"><strong>Parcels:</strong> <span class="text-amber-300 font-mono font-semibold">${feature.properties.affectedParcels?.join(' & ') || 'Cadastral Boundary'}</span></div>
              <div class="text-slate-200"><strong>Overlap Area:</strong> <span class="font-bold text-amber-400 font-mono">${feature.properties.areaSqm} m²</span></div>
              <div class="text-slate-300 text-[11px] pt-1.5 border-t border-slate-700"><strong>Suggested Action:</strong> Clip overlapping polygon & snap adjacent boundary.</div>
            </div>
          `);
        }
      }).addTo(map);
      overlayLayersRef.current.topology = topoLayer;
    }

    // 3. Disaster Route & Evacuation Corridor
    if (disasterRoute) {
      if (disasterRoute.corridorBufferFeature) {
        const corridor = L.geoJSON(disasterRoute.corridorBufferFeature, {
          style: {
            color: '#00b37e',
            weight: 1,
            fillColor: '#00b37e',
            fillOpacity: 0.2
          }
        }).addTo(map);
        overlayLayersRef.current.disaster_corridor = corridor;
      }

      if (disasterRoute.routeFeature) {
        const route = L.geoJSON(disasterRoute.routeFeature, {
          style: {
            color: '#10b981',
            weight: 5,
            className: 'leaflet-route-dash'
          }
        }).addTo(map);
        overlayLayersRef.current.disaster_route = route;

        // Auto fly to route bounds
        map.fitBounds(route.getBounds(), { padding: [50, 50], maxZoom: 16 });
      }
    }
  }, [conflictFeatures, topologyErrorFeatures, focusedTopologyErrorId, disasterRoute]);

  // Auto-open popup and bring to front when an error is focused
  useEffect(() => {
    if (!focusedTopologyErrorId || !mapInstanceRef.current) return;
    const sublayer = topologySublayersRef.current[focusedTopologyErrorId] ||
                     topologySublayersRef.current[`err-poly-${focusedTopologyErrorId}`];
    if (sublayer) {
      if (sublayer.bringToFront) sublayer.bringToFront();
      setTimeout(() => {
        try {
          if (sublayer.openPopup) sublayer.openPopup();
        } catch (e) {}
      }, 300);
    }
  }, [focusedTopologyErrorId, topologyErrorFeatures]);

  // Fly to target feature or coordinates
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !flyToTarget) return;

    if (flyToTarget.bounds) {
      map.fitBounds(flyToTarget.bounds, { padding: [40, 40], maxZoom: 17 });
    } else if (flyToTarget.lat && flyToTarget.lng) {
      map.flyTo([flyToTarget.lat, flyToTarget.lng], flyToTarget.zoom || 17, { duration: 1.2 });
    }
  }, [flyToTarget]);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([17.4385, 78.3845], 15);
    }
  };

  const handleFitAllLayers = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const featureGroups = Object.values(vectorLayersRef.current).filter(Boolean);
    if (featureGroups.length > 0) {
      try {
        const group = L.featureGroup(featureGroups);
        const bounds = group.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 });
          return;
        }
      } catch (err) {
        console.warn('Could not fit bounds', err);
      }
    }
    handleResetView();
  };

  const handlePan = (direction) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const offset = 220;
    switch (direction) {
      case 'left':
        map.panBy([-offset, 0], { animate: true, duration: 0.25 });
        break;
      case 'right':
        map.panBy([offset, 0], { animate: true, duration: 0.25 });
        break;
      case 'up':
        map.panBy([0, -offset], { animate: true, duration: 0.25 });
        break;
      case 'down':
        map.panBy([0, offset], { animate: true, duration: 0.25 });
        break;
      default:
        break;
    }
  };

  // Listen to custom global zoom & pan events (touchpad pinch / Ctrl+wheel / arrow keys / shortcuts)
  // NOTE: All logic reads mapInstanceRef.current directly to avoid stale closure issues.
  useEffect(() => {
    const handleGlobalZoom = (e) => {
      const map = mapInstanceRef.current;
      if (!map) return;
      if (e.detail?.type === 'in') {
        map.zoomIn();
      } else if (e.detail?.type === 'out') {
        map.zoomOut();
      } else if (e.detail?.type === 'reset') {
        map.flyTo([17.4385, 78.3845], 15);
      } else if (e.detail?.type === 'fit') {
        // fit all visible layers
        const featureGroups = Object.values(vectorLayersRef.current).filter(Boolean);
        if (featureGroups.length > 0) {
          try {
            const group = L.featureGroup(featureGroups);
            const bounds = group.getBounds();
            if (bounds.isValid()) {
              map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 });
              return;
            }
          } catch (_) {}
        }
        map.flyTo([17.4385, 78.3845], 15);
      } else if (typeof e.detail?.delta === 'number') {
        if (e.detail.delta < 0) {
          map.zoomIn();
        } else if (e.detail.delta > 0) {
          map.zoomOut();
        }
      }
    };

    const handleGlobalPan = (e) => {
      const map = mapInstanceRef.current;
      if (!map || !e.detail?.direction) return;
      const offset = 220;
      switch (e.detail.direction) {
        case 'left':  map.panBy([-offset, 0], { animate: true, duration: 0.25 }); break;
        case 'right': map.panBy([offset,  0], { animate: true, duration: 0.25 }); break;
        case 'up':    map.panBy([0, -offset], { animate: true, duration: 0.25 }); break;
        case 'down':  map.panBy([0,  offset], { animate: true, duration: 0.25 }); break;
        default: break;
      }
    };

    window.addEventListener('geomap:zoom', handleGlobalZoom);
    window.addEventListener('geomap:pan', handleGlobalPan);
    return () => {
      window.removeEventListener('geomap:zoom', handleGlobalZoom);
      window.removeEventListener('geomap:pan', handleGlobalPan);
    };
  }, []);

  return (
    <div className="relative w-full h-full bg-[#111625] overflow-hidden">
      {/* Leaflet Map Div with TabIndex for keyboard pan focus */}
      <div ref={mapContainerRef} tabIndex={0} className="w-full h-full outline-none select-none" />

      {/* Floating Basemap Selector */}
      <div className="absolute top-4 left-4 z-20 flex items-center space-x-1.5 p-1.5 bg-card/95 backdrop-blur-md rounded-xl border border-border shadow-md">
        {Object.entries(BASEMAPS).map(([key, item]) => (
          <button
            key={key}
            onClick={() => setActiveBasemap(key)}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeBasemap === key
                ? 'bg-brand text-white shadow-xs'
                : 'text-muted hover:text-text hover:bg-surface'
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>

      {/* Dedicated Floating Map Navigation: Directional Pan & Zoom Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-center space-y-2">
        
        {/* 4-Way Directional Pan Controller */}
        <div className="bg-card/95 backdrop-blur-md rounded-xl border border-border shadow-md p-1.5 flex flex-col items-center">
          <span className="text-[11px] font-bold text-muted tracking-wider uppercase mb-1 select-none">
            Pan Map
          </span>

          {/* Pan Up */}
          <button
            onClick={() => handlePan('up')}
            title="Move Map Up / North (ArrowUp or W)"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text hover:text-white hover:bg-brand transition-all active:scale-90"
          >
            <ArrowUp className="w-4 h-4" />
          </button>

          {/* Left, Center/Reset, Right Row */}
          <div className="flex items-center space-x-1 my-1">
            <button
              onClick={() => handlePan('left')}
              title="Move Map Left / West (ArrowLeft or A)"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-text hover:text-white hover:bg-brand transition-all active:scale-90"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleResetView}
              title="Re-Center View (0)"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-brand hover:text-white hover:bg-brand transition-all active:scale-90"
            >
              <Crosshair className="w-4 h-4" />
            </button>

            <button
              onClick={() => handlePan('right')}
              title="Move Map Right / East (ArrowRight or D)"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-text hover:text-white hover:bg-brand transition-all active:scale-90"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Pan Down */}
          <button
            onClick={() => handlePan('down')}
            title="Move Map Down / South (ArrowDown or S)"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text hover:text-white hover:bg-brand transition-all active:scale-90"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="bg-card/95 backdrop-blur-md rounded-xl border border-border shadow-md p-1 flex flex-col items-center space-y-1">
          {/* Zoom In */}
          <button
            onClick={handleZoomIn}
            title="Zoom In (Scroll up or +)"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text hover:text-white hover:bg-brand transition-all active:scale-90"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Current Zoom Level Badge */}
          <div 
            title={`Current Zoom Level: ${zoomLevel}x`}
            className="w-8 py-0.5 text-center text-xs font-mono font-bold text-brand select-none border-y border-border"
          >
            {zoomLevel}x
          </div>

          {/* Zoom Out */}
          <button
            onClick={handleZoomOut}
            title="Zoom Out (Scroll down or -)"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text hover:text-white hover:bg-brand transition-all active:scale-90"
          >
            <Minus className="w-4 h-4" />
          </button>

          <div className="w-6 h-px bg-border my-0.5"></div>

          {/* Fit All Layers */}
          <button
            onClick={handleFitAllLayers}
            title="Fit All Layers to Screen"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-text hover:bg-surface transition-all active:scale-90"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Reset Extent */}
          <button
            onClick={handleResetView}
            title="Reset View to Cadastral Extent"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-text hover:bg-surface transition-all active:scale-90"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Bottom Floating Status Bar */}
      <div className="absolute bottom-2.5 left-4 right-4 z-20 pointer-events-none flex flex-wrap items-center justify-between gap-2.5">
        {/* Active Legends Indicator */}
        <div className="pointer-events-auto flex items-center space-x-2.5 px-3.5 py-2 bg-card/95 backdrop-blur-md rounded-xl border border-border text-xs sm:text-sm text-text shadow-md">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#7B1E2D]"></span>
            <span className="font-semibold text-text">Cadastre</span>
          </div>
          <span className="text-border">•</span>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-sm bg-amber-500"></span>
            <span className="font-medium text-muted">Road Corridors</span>
          </div>
          <span className="text-border">•</span>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span className="font-medium text-muted">Wells / Shelters</span>
          </div>
          {conflictFeatures?.features?.length > 0 && (
            <>
              <span className="text-border">•</span>
              <div className="flex items-center space-x-1.5 text-rose-600 font-semibold">
                <span className="w-3 h-3 rounded-sm bg-rose-500 animate-pulse"></span>
                <span>Conflicts ({conflictFeatures.features.length})</span>
              </div>
            </>
          )}
        </div>

        {/* Live Coordinate Display */}
        <div className="pointer-events-auto px-4 py-2 bg-card/95 backdrop-blur-md rounded-xl border border-border text-xs sm:text-sm font-mono text-text shadow-md flex items-center space-x-3.5">
          <div className="flex items-center space-x-1.5 text-muted">
            <Compass className="w-4 h-4 text-brand" />
            <span className="font-semibold text-text">EPSG:4326</span>
          </div>
          <span>Lat: {cursorCoords.lat}° N</span>
          <span>Lng: {cursorCoords.lng}° E</span>
          <span className="text-brand font-bold">Zoom {zoomLevel}x</span>
          <span className="text-muted hidden md:inline">• Arrow keys or Pan buttons to Move</span>
        </div>
      </div>
    </div>
  );
}
