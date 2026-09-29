import React, { useState } from 'react';
import { Terminal, Activity } from 'lucide-react';

const INITIAL_LOGS = [
  { id: 1, time: '14:48:12', type: 'INGEST', text: 'Loaded Telangana Cadastral master layer (12 parcels, EPSG:4326).', status: 'SUCCESS' },
  { id: 2, time: '14:48:15', type: 'TOPO_SCAN', text: 'Detected 1 sliver overlap anomaly (248.5 m²) between P-102 & P-103.', status: 'WARN' },
  { id: 3, time: '14:48:18', type: 'CONFLICT', text: 'Right-of-Way infringement flagged: NH-65 corridor vs P-104 (542.4 m²).', status: 'CRITICAL' },
  { id: 4, time: '14:49:05', type: 'SENSOR_SYNC', text: 'Groundwater piezometer records parsed (15 monitoring wells).', status: 'SUCCESS' },
  { id: 5, time: '14:50:22', type: 'AI_ALIGN', text: 'ICP Affine registration model converged: RMSE reduced from 14.2m to 0.28m.', status: 'SUCCESS' }
];

export default function Admin() {
  const [logs, setLogs] = useState(INITIAL_LOGS);

  return (
    <div className="min-h-screen bg-surface text-text py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-semibold text-brand mb-1">
              <Terminal className="w-4 h-4" />
              <span>Administrative Operations & Diagnostics</span>
            </div>
            <h1 className="text-3xl font-extrabold text-text">GIS Engine Admin Console</h1>
            <p className="text-xs sm:text-sm text-muted mt-1">
              System health, active spatial workers, and harmonization audit ledger.
            </p>
          </div>

          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono self-start sm:self-center shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Cluster Healthy (0 Errors)</span>
          </div>
        </div>

        {/* Engine Performance Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-border shadow-xs">
            <span className="text-xs text-muted font-semibold block">Spatial Compute Engine</span>
            <span className="text-xl font-bold text-brand font-mono">Turf.js v7.2</span>
            <span className="text-[11px] text-emerald-700 block mt-1 font-medium">Client In-Memory V8</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-border shadow-xs">
            <span className="text-xs text-muted font-semibold block">Mean Processing Latency</span>
            <span className="text-xl font-bold text-emerald-700 font-mono">1.8 ms</span>
            <span className="text-[11px] text-muted block mt-1">0ms Network Transfer</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-border shadow-xs">
            <span className="text-xs text-muted font-semibold block">Active Memory Buffer</span>
            <span className="text-xl font-bold text-text font-mono">4.2 MB</span>
            <span className="text-[11px] text-muted block mt-1">37 Features Loaded</span>
          </div>
          <div className="p-4 rounded-2xl bg-white border border-border shadow-xs">
            <span className="text-xs text-muted font-semibold block">Statutory Compliance</span>
            <span className="text-xl font-bold text-brand font-mono">DILRMP 100%</span>
            <span className="text-[11px] text-emerald-700 block mt-1 font-medium">Human Sign-off Active</span>
          </div>
        </div>

        {/* Audit Log Ledger */}
        <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm font-bold text-text">
              <Activity className="w-4 h-4 text-emerald-600" />
              <span>Spatial Harmonization Audit Ledger (Append-Only)</span>
            </div>
            <span className="text-xs font-mono text-muted">{logs.length} Transactions</span>
          </div>

          <div className="divide-y divide-border">
            {logs.map(log => (
              <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-surface transition-colors text-xs">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-muted text-[11px]">{log.time}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                    log.status === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border-rose-200' : log.status === 'WARN' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                    {log.type}
                  </span>
                  <span className="text-text">{log.text}</span>
                </div>
                <span className="text-[11px] text-muted font-mono sm:self-center">
                  status={log.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
