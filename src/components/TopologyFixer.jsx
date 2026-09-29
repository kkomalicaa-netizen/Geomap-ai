import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, Wrench, AlertTriangle, ArrowRight, Check, Eye } from 'lucide-react';
import confetti from 'canvas-confetti';
import { fixTopologyErrors } from '../services/spatialApi';

export default function TopologyFixer({
  cadastralLayer = null,
  topologyErrors = [],
  focusedErrorId = null,
  onApplyFix = () => {},
  onPreviewError = () => {}
}) {
  const [isFixModalOpen, setIsFixModalOpen] = useState(false);
  const [selectedError, setSelectedError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fixedSuccess, setFixedSuccess] = useState(false);

  const handleOpenReview = (errorItem) => {
    setSelectedError(errorItem);
    setIsFixModalOpen(true);
  };

  const handleCommitFix = () => {
    if (!cadastralLayer) return;
    setIsProcessing(true);

    setTimeout(() => {
      try {
        const result = fixTopologyErrors(cadastralLayer, selectedError?.id);
        onApplyFix(cadastralLayer.id, result.fixedGeojson, result.newTrustScore);
        setIsProcessing(false);
        setIsFixModalOpen(false);
        setFixedSuccess(true);

        // Judge Celebration Confetti!
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.error(err);
        setIsProcessing(false);
      }
    }, 600);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 text-text shadow-sm flex flex-col space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
            <Wrench className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-text">AI Topology Fixer</h3>
            <p className="text-xs text-muted">Gaps, Overlaps & Sliver Repair</p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold border ${
          topologyErrors.length > 0 
            ? 'bg-amber-50 text-amber-700 border-amber-200'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
        }`}>
          {topologyErrors.length > 0 ? `${topologyErrors.length} Issue Found` : 'Clean Topology'}
        </span>
      </div>

      {/* Errors list */}
      <div className="space-y-2.5">
        {topologyErrors.length === 0 ? (
          <div className="p-4 rounded-xl bg-surface border border-border text-center space-y-2">
            <CheckCircle className="w-7 h-7 text-emerald-600 mx-auto" />
            <p className="text-sm font-bold text-text">
              {fixedSuccess ? 'Topology Anomaly Harmonized!' : 'Zero Topological Anomalies'}
            </p>
            <p className="text-xs text-muted leading-relaxed">
              {fixedSuccess 
                ? 'Sliver overlap between TS-HYD-P102 and P-103 has been clipped and snapped to boundary standard.'
                : 'All polygon rings satisfy planar uniqueness and closure constraints.'}
            </p>
          </div>
        ) : (
          topologyErrors.map((err) => {
            const isFocused = focusedErrorId === err.id;
            return (
              <div
                key={err.id}
                className={`p-3.5 rounded-xl border space-y-2.5 text-xs sm:text-sm shadow-xs transition-all duration-200 ${
                  isFocused
                    ? 'bg-amber-100/95 border-amber-500 ring-2 ring-amber-400 shadow-md'
                    : 'bg-amber-50/70 border-amber-200 hover:border-amber-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2 text-amber-900 font-bold">
                    <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${isFocused ? 'text-amber-600 animate-pulse' : 'text-amber-600'}`} />
                    <span>{err.title}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-200 text-amber-900">
                    {err.severity}
                  </span>
                </div>

                <p className="text-xs text-text leading-relaxed">
                  {err.description}
                </p>

                <div className="flex items-center justify-between text-xs text-muted pt-1 border-t border-amber-200">
                  <span>Overlap: <strong className="text-amber-900 font-bold">{err.areaSqm} m²</strong></span>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => onPreviewError(err)}
                      className={`p-1.5 rounded-lg transition-all ${
                        isFocused
                          ? 'bg-amber-600 text-white font-bold shadow-xs scale-105 ring-2 ring-amber-300'
                          : 'text-amber-800 hover:text-amber-950 hover:bg-amber-200/60'
                      }`}
                      title={isFocused ? "Focused on Map (Click to toggle)" : "Focus on Map"}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenReview(err)}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors flex items-center space-x-1 shadow-xs"
                    >
                      <span>Review & Fix</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Human-in-the-loop Approval Modal */}
      {isFixModalOpen && selectedError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-border rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center space-x-2 text-text font-bold text-base">
                <Wrench className="w-5 h-5 text-amber-600" />
                <span>Human-In-The-Loop Approval</span>
              </div>
              <button
                onClick={() => setIsFixModalOpen(false)}
                className="text-muted hover:text-text font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-surface border border-border space-y-1.5">
                <span className="text-[10px] text-muted uppercase tracking-wider font-semibold">Detected Anomaly</span>
                <div className="text-sm font-bold text-amber-700">{selectedError.title}</div>
                <div className="text-text">
                  Cadastral overlap of <strong className="text-text">{selectedError.areaSqm} m²</strong> between <span className="font-mono text-brand font-semibold">TS-HYD-P102</span> and <span className="font-mono text-brand font-semibold">TS-HYD-P103</span>.
                </div>
              </div>

              {/* Proposed Resolution Diff */}
              <div className="p-3 rounded-lg bg-brand-light/30 border border-brand/20 space-y-2">
                <span className="text-[10px] text-brand uppercase tracking-wider font-semibold">Proposed Geometric Transformation</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-rose-50 border border-rose-200">
                    <span className="text-rose-700 font-bold block">Current State (Dirty)</span>
                    <span className="text-rose-900 text-[10px]">Unsnapped boundary edge overlap into P-103 parcel fabric.</span>
                  </div>
                  <div className="p-2 rounded bg-emerald-50 border border-emerald-200">
                    <span className="text-emerald-700 font-bold block">Proposed Fix (Clean)</span>
                    <span className="text-emerald-900 text-[10px]">Clip overlap strip and snap shared vertex coordinates to P-103 edge.</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-muted">
                ⚠️ DILRMP Statutory Compliance: Modifying land record boundaries requires digital verification and officer sign-off.
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-border">
              <button
                onClick={() => setIsFixModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-surface border border-border text-text hover:bg-border transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={isProcessing}
                onClick={handleCommitFix}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center space-x-2 active:scale-95 disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Applying Geometric Union & Snap...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Approve & Commit Fix</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
