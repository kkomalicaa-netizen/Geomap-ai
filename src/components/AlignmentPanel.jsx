import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, RotateCcw, ArrowRight, Gauge, Cpu, Check } from 'lucide-react';
import { alignLayers } from '../services/spatialApi';

export default function AlignmentPanel({
  layers = [],
  onApplyAlignment = () => {},
  onRevertAlignment = () => {}
}) {
  const [selectedTargetId, setSelectedTargetId] = useState(layers[0]?.id || '');
  const [isAligning, setIsAligning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [alignmentResult, setAlignmentResult] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);

  const prevFirstLayerIdRef = React.useRef(layers[0]?.id);

  // Sync selected layer when preset or layers change
  useEffect(() => {
    if (layers && layers.length > 0) {
      const topChanged = layers[0]?.id !== prevFirstLayerIdRef.current;
      prevFirstLayerIdRef.current = layers[0]?.id;

      if (topChanged || !layers.some(l => l.id === selectedTargetId)) {
        setSelectedTargetId(layers[0].id);
        setAlignmentResult(null);
        setHasApplied(false);
      }
    } else {
      setSelectedTargetId('');
      setAlignmentResult(null);
      setHasApplied(false);
    }
  }, [layers]);

  const handleRunAlignment = () => {
    const targetLayer = layers.find(l => l.id === selectedTargetId) || layers[0];
    if (!targetLayer) return;

    // Pick a reference layer — prefer a different layer with polygon geometry
    const refLayer = layers.find(l => l.id !== targetLayer.id && (l.geometryType === 'Polygon' || l.geometryType === 'MultiPolygon')) || null;

    setIsAligning(true);
    setProgress(0);
    setAlignmentResult(null);

    // Simulated multi-stage AI affine ICP registration pipeline
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 95;
        }
        return prev + 25;
      });
    }, 180);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      try {
        const res = alignLayers(targetLayer, refLayer);
        setAlignmentResult(res);
        onApplyAlignment(targetLayer.id, res.alignedGeojson);
        setHasApplied(true);
      } catch (err) {
        console.error(err);
      } finally {
        setIsAligning(false);
      }
    }, 1100);
  };

  const handleRevert = () => {
    onRevertAlignment(selectedTargetId);
    setHasApplied(false);
    setAlignmentResult(null);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 text-text shadow-sm flex flex-col space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-brand-light text-brand">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-text">AI Smart Alignment</h3>
            <p className="text-xs text-muted">Sub-meter ICP & Affine Registration</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Automated
        </span>
      </div>

      {/* Target Layer Selector */}
      <div className="space-y-1.5 text-sm">
        <label className="text-text font-semibold flex items-center justify-between">
          <span>Target Layer to Align</span>
          <span className="text-muted text-xs">Active Cadastre</span>
        </label>
        <select
          value={selectedTargetId}
          onChange={(e) => {
            setSelectedTargetId(e.target.value);
            setAlignmentResult(null);
            setHasApplied(false);
          }}
          className="w-full bg-white border border-border rounded-lg px-3 py-2.5 text-sm text-text focus:outline-none focus:border-brand shadow-xs"
        >
          {layers.map(layer => (
            <option key={layer.id} value={layer.id}>
              {layer.name} ({layer.format || 'GeoJSON'})
            </option>
          ))}
        </select>
      </div>

      {/* Action Button & Progress */}
      <div className="space-y-2">
        <button
          disabled={isAligning || layers.length === 0}
          onClick={handleRunAlignment}
          className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-brand hover:bg-brand-hover text-white shadow-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
        >
          {isAligning ? (
            <>
              <Cpu className="w-4 h-4 animate-spin text-white" />
              <span>Registering Coordinate Frames ({progress}%)...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Run AI Alignment</span>
            </>
          )}
        </button>

        {isAligning && (
          <div className="w-full bg-border rounded-full h-2 overflow-hidden">
            <div
              className="bg-brand h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Alignment Results & Residual Metrics */}
      {alignmentResult && (
        <div className="bg-surface border border-border rounded-xl p-3.5 space-y-3 text-xs sm:text-sm animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-emerald-700 font-semibold border-b border-border pb-2">
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-bold">Alignment Achieved</span>
            </div>
            <span className="text-xs font-mono bg-emerald-50 px-2 py-0.5 rounded text-emerald-700 border border-emerald-200">
              Confidence {alignmentResult.metrics.confidence}
            </span>
          </div>

          {/* Metric Comparison Cards */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div className="p-3 rounded-lg bg-white border border-border shadow-xs">
              <span className="text-xs text-muted block font-medium">Pre-Alignment RMSE</span>
              <span className="text-base font-bold font-mono text-rose-600">
                {alignmentResult.metrics.initialRmse}
              </span>
              <span className="text-xs text-muted block mt-0.5">Raw Survey Bias</span>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 shadow-xs">
              <span className="text-xs text-emerald-700 block font-medium">Post-Alignment RMSE</span>
              <span className="text-base font-bold font-mono text-emerald-800">
                {alignmentResult.metrics.residualRmse}
              </span>
              <span className="text-xs text-emerald-600 block mt-0.5">Sub-Meter Precision</span>
            </div>
          </div>

          {/* Transformation details */}
          <div className="space-y-1.5 text-xs text-muted bg-white p-3 rounded-lg border border-border shadow-xs">
            <div className="flex justify-between">
              <span>Residual Error Reduction:</span>
              <span className="font-bold text-emerald-700">{alignmentResult.metrics.accuracyImprovement}</span>
            </div>
            <div className="flex justify-between">
              <span>Affine Model:</span>
              <span className="text-text font-medium">Helmert 4-Param (Rot/Scale/Shift)</span>
            </div>
            {alignmentResult.metrics.featuresAligned && (
              <div className="flex justify-between">
                <span>Features Aligned:</span>
                <span className="text-text font-medium">{alignmentResult.metrics.featuresAligned} polygons</span>
              </div>
            )}
            {alignmentResult.metrics.diagonalSpanM && (
              <div className="flex justify-between">
                <span>Dataset Span:</span>
                <span className="text-text font-medium">{alignmentResult.metrics.diagonalSpanM}</span>
              </div>
            )}
          </div>

          {/* Revert / Undo action */}
          {hasApplied && (
            <button
              onClick={handleRevert}
              className="w-full py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold text-text hover:bg-surface bg-white border border-border shadow-xs transition-colors flex items-center justify-center space-x-1.5"
            >
              <RotateCcw className="w-4 h-4 text-muted" />
              <span>Revert to Raw Coordinates</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
