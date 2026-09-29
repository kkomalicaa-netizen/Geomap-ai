import React, { useState } from 'react';
import { AlertOctagon, Download, Eye, ShieldAlert, ChevronRight, CheckCircle } from 'lucide-react';

export default function ConflictReport({
  conflicts = [],
  onSelectConflict = () => {}
}) {
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  const filtered = conflicts.filter(c => {
    if (filterSeverity === 'ALL') return true;
    return c.severity.toUpperCase() === filterSeverity;
  });

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(conflicts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `geomap_conflicts_audit_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 text-text shadow-sm flex flex-col space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-text">Land Conflicts & RoW</h3>
            <p className="text-xs text-muted">Arterial Right-of-Way Encroachments</p>
          </div>
        </div>

        {conflicts.length > 0 && (
          <button
            onClick={handleExportJson}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold bg-white hover:bg-surface border border-border text-text shadow-xs transition-colors"
            title="Export Audit Report"
          >
            <Download className="w-4 h-4 text-brand" />
            <span>Audit JSON</span>
          </button>
        )}
      </div>

      {/* Severity Filter Tabs */}
      <div className="flex items-center space-x-1 p-1 bg-surface border border-border rounded-lg text-xs sm:text-sm">
        {['ALL', 'HIGH', 'MEDIUM'].map(sev => (
          <button
            key={sev}
            onClick={() => setFilterSeverity(sev)}
            className={`flex-1 py-1.5 rounded text-xs font-bold transition-colors ${
              filterSeverity === sev
                ? 'bg-brand text-white shadow-xs'
                : 'text-muted hover:text-text'
            }`}
          >
            {sev}
          </button>
        ))}
      </div>

      {/* Conflicts List */}
      <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="p-4 rounded-xl bg-surface border border-border text-center space-y-1.5">
            <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto" />
            <p className="text-sm font-bold text-text">No Active Infringements</p>
            <p className="text-xs text-muted">All surveyed parcels respect statutory transit buffers.</p>
          </div>
        ) : (
          filtered.map(c => {
            const isHigh = c.severity === 'High';
            return (
              <div
                key={c.id}
                onClick={() => onSelectConflict(c)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all hover:translate-x-0.5 shadow-xs ${
                  isHigh 
                    ? 'bg-rose-50/70 border-rose-200 hover:bg-rose-50' 
                    : 'bg-amber-50/70 border-amber-200 hover:bg-amber-50'
                }`}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${isHigh ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`} />
                    <span className="text-sm font-bold text-text">
                      {c.parcelId}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    isHigh ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {c.severity} Severity
                  </span>
                </div>

                <div className="text-xs text-text font-semibold mb-1">
                  {c.ownerName}
                </div>

                <div className="text-xs text-muted">
                  Infringing: <span className="text-text font-medium">{c.corridorName}</span>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 mt-2 border-t border-border">
                  <span className="font-mono text-rose-700 font-bold">
                    {c.encroachmentAreaSqm} m² ({c.percentageOfParcel})
                  </span>
                  <div className="flex items-center space-x-1 text-brand text-xs font-semibold">
                    <span>Inspect on Map</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
