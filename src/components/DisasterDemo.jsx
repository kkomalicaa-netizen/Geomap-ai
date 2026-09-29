import React, { useState } from 'react';
import { Siren, Shield, Users, Clock, Zap, Phone, CheckCircle, Navigation, XCircle } from 'lucide-react';
import { findNearestShelter } from '../services/spatialApi';

const INCIDENTS = [
  {
    id: 'flood',
    name: 'Urban Flash Flood Zone',
    severity: 'Level-3 High Flood',
    description: 'Severe inundation in Madhapur valley catchment basin. Water logging exceeding 1.2m.',
    coords: [78.3810, 17.4360]
  },
  {
    id: 'gas',
    name: 'Industrial Hazmat Gas Leak',
    severity: 'Toxic Vapor Perimeter',
    description: 'Pipeline valve failure near logistics corridor. 800m downwind evacuation radius.',
    coords: [78.3890, 17.4410]
  },
  {
    id: 'earthquake',
    name: 'Seismic Structural Threat',
    severity: 'Building Integrity Hazard',
    description: 'Vibration tremors reported. Immediate non-structural evacuation to open stadium grounds.',
    coords: [78.3750, 17.4400]
  }
];

export default function DisasterDemo({
  sheltersLayer = null,
  onActivateDisasterScenario = () => {},
  onClearDisasterScenario = () => {}
}) {
  const [selectedIncident, setSelectedIncident] = useState(INCIDENTS[0]);
  const [triageData, setTriageData] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulate = async (incident) => {
    setSelectedIncident(incident);
    setIsSimulating(true);

    try {
      let geojson = sheltersLayer?.geojson;
      if (!geojson) {
        const res = await fetch('./data/shelters.geojson');
        geojson = await res.json();
      }
      const result = findNearestShelter(incident.coords, geojson);
      setTriageData(result);
      onActivateDisasterScenario(result, incident);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleClear = () => {
    setTriageData(null);
    onClearDisasterScenario();
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 text-text shadow-sm flex flex-col space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
            <Siren className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-base text-text">Disaster Evacuation & Triage</h3>
            <p className="text-xs text-muted">Rapid Relief Routing & Shelter Allocation</p>
          </div>
        </div>

        {triageData && (
          <button
            onClick={handleClear}
            className="text-muted hover:text-rose-600 text-xs sm:text-sm font-semibold flex items-center space-x-1 transition-colors"
            title="Clear Route"
          >
            <XCircle className="w-4 h-4" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Incident Selection Buttons */}
      <div className="space-y-2 text-sm">
        <label className="text-text font-semibold block">Select Emergency Incident Scenario:</label>
        <div className="grid grid-cols-3 gap-2">
          {INCIDENTS.map(inc => (
            <button
              key={inc.id}
              onClick={() => handleSimulate(inc)}
              className={`p-2.5 rounded-xl text-left transition-all border shadow-xs ${
                selectedIncident.id === inc.id && triageData
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                  : 'bg-white border-border text-text hover:bg-surface'
              }`}
            >
              <div className="text-xs sm:text-sm truncate font-bold">{inc.name}</div>
              <div className="text-xs text-muted mt-0.5 truncate">{inc.severity}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Triage Output Card */}
      {triageData && (
        <div className="bg-surface border border-emerald-300 rounded-xl p-4 space-y-3.5 animate-in fade-in duration-200 shadow-xs">
          <div className="flex items-start justify-between border-b border-border pb-2.5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center space-x-1.5">
                <Navigation className="w-3.5 h-3.5" />
                <span>Nearest Operational Facility</span>
              </span>
              <h4 className="text-sm font-bold text-text mt-1">
                {triageData.nearestShelter.name}
              </h4>
            </div>
            <span className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              {triageData.distanceMeters}m Away
            </span>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
            <div className="p-2.5 rounded-lg bg-white border border-border flex items-center space-x-2.5 shadow-xs">
              <Clock className="w-4 h-4 text-brand flex-shrink-0" />
              <div>
                <span className="text-[10px] text-muted block">Evacuation ETA</span>
                <span className="text-[11px] font-bold text-text">{triageData.walkingEta} (Walk) / {triageData.vehicleEta} (Transit)</span>
              </div>
            </div>

            <div className="p-2 rounded bg-white border border-border flex items-center space-x-2 shadow-xs">
              <Users className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <div>
                <span className="text-[10px] text-muted block">Available Capacity</span>
                <span className="text-[11px] font-bold text-emerald-700">
                  {triageData.nearestShelter.capacity - triageData.nearestShelter.current_occupancy} spots left
                </span>
              </div>
            </div>
          </div>

          {/* Facility Status Badges */}
          <div className="flex flex-wrap gap-1.5 text-[10px]">
            <span className="px-2 py-0.5 rounded bg-white border border-border text-text flex items-center space-x-1 shadow-xs">
              <span>🩺</span>
              <span>Medical Team: {triageData.nearestShelter.medical_team ? 'Deployed' : 'Standby'}</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-white border border-border text-text flex items-center space-x-1 shadow-xs">
              <Zap className="w-3 h-3 text-amber-500" />
              <span>Aux Power: 24/7 Generator</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-white border border-border text-text flex items-center space-x-1 shadow-xs">
              <span>🥫</span>
              <span>Rations: {triageData.nearestShelter.supplies_days} Days</span>
            </span>
          </div>

          {/* Emergency Contact */}
          <div className="pt-2 border-t border-border flex items-center justify-between text-[11px]">
            <span className="text-muted">Incident Commander:</span>
            <span className="text-text font-semibold flex items-center space-x-1">
              <Phone className="w-3 h-3 text-emerald-600" />
              <span>{triageData.nearestShelter.phone}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
