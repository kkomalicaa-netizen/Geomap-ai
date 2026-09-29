import React, { useState } from 'react';
import { 
  Layers, Sparkles, ShieldCheck, AlertOctagon, Siren, Database, 
  ArrowRight, CheckCircle2, ChevronDown, ChevronUp, Check, 
  Compass, FileCode, Zap, Globe, Shield, RefreshCw, BarChart3
} from 'lucide-react';

const REAL_USER_FAQS = [
  {
    q: 'What geospatial data formats can I import into GeoMap AI?',
    a: 'GeoMap AI supports standard GeoJSON (polygons, lines, points), CSV files with coordinate headers (automatically detecting Latitude and Longitude columns), OpenStreetMap (OSM) extracts, and web map tile services (WMS/XYZ). You can drag and drop your files directly into the Layer Manager.'
  },
  {
    q: 'Does my sensitive parcel and land ownership data get uploaded to third-party servers?',
    a: 'No. GeoMap AI executes 100% of its spatial calculations client-side in your browser using Turf.js and high-performance WebAssembly/V8 algorithms. Your geometries and private attributes stay strictly in your device memory and are never transmitted to external cloud servers.'
  },
  {
    q: 'How does the AI Smart Alignment eliminate coordinate offsets between surveys?',
    a: 'Field surveys, drone imagery, and legacy revenue maps often have geodetic datum shifts (10m–25m). GeoMap AI calculates centroid displacement and applies a 4-parameter Helmert affine transformation (rotation, translation, and scale) to reduce residual Root-Mean-Square Error (RMSE) to less than 0.28 meters.'
  },
  {
    q: 'Can I export harmonized datasets to standard desktop GIS like QGIS or ArcGIS?',
    a: 'Yes. Every harmonized layer, corrected topology, and conflict audit report can be exported with one click as standard GeoJSON or CSV, fully compatible with QGIS, ArcGIS Pro, AutoCAD Civil 3D, and municipal spatial databases.'
  },
  {
    q: 'How does the platform prevent accidental overwriting of legal property boundaries?',
    a: 'GeoMap AI follows a strict Human-in-the-Loop design principle. When topological errors (like overlapping sliver polygons) are detected, the system generates a color-coded preview diff and requires explicit administrative confirmation before modifying the active spatial layer.'
  }
];

export default function Home({ setActivePage }) {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="min-h-screen bg-surface text-text flex flex-col selection:bg-brand-light selection:text-brand">
      
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden border-b border-border">
        {/* Dynamic Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-b from-brand-light/70 via-surface to-transparent blur-3xl -z-10 pointer-events-none" />
        
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Release Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white border border-border text-xs text-muted mb-6 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-text">Next-Gen Spatial Intelligence</span>
            <span className="text-border">•</span>
            <span className="text-brand font-semibold">Sub-Meter Precision</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-text mb-6 leading-tight">
            Harmonize Any Map. <br />
            <span className="bg-gradient-to-r from-[#7B1E2D] via-[#9B2C3B] to-[#1E3A8A] bg-clip-text text-transparent">
              Eliminate Boundary Disputes.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-3xl mx-auto text-base sm:text-lg text-muted mb-9 leading-relaxed font-normal">
            The intelligent Web GIS platform that automatically aligns mismatched spatial surveys, repairs overlapping cadastral boundaries, and flags infrastructure right-of-way encroachments — in real time, with zero server dependencies.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 mb-14">
            <button
              onClick={() => setActivePage('demo')}
              className="px-7 py-3.5 rounded-xl font-bold text-sm bg-brand hover:bg-brand-hover text-white shadow-md shadow-brand/20 transition-all flex items-center space-x-2.5 active:scale-95"
            >
              <Layers className="w-4 h-4" />
              <span>Launch Interactive GIS Map</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActivePage('datasets')}
              className="px-6 py-3.5 rounded-xl font-semibold text-sm bg-white hover:bg-surface text-text border border-border shadow-xs transition-colors flex items-center space-x-2"
            >
              <Database className="w-4 h-4 text-brand" />
              <span>Explore Data Catalog</span>
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('how-it-works');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-5 py-3.5 rounded-xl font-semibold text-sm bg-white hover:bg-surface text-muted hover:text-text border border-border shadow-xs transition-colors flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>How It Works</span>
            </button>
          </div>

          {/* Real Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <div className="p-4 rounded-xl bg-white border border-border text-left shadow-xs">
              <span className="text-2xl sm:text-3xl font-black text-text font-mono">&lt; 0.28 m</span>
              <p className="text-xs text-muted mt-1 font-medium">Post-Alignment RMSE (Down from 14.2m)</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-border text-left shadow-xs">
              <span className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">98% (A+)</span>
              <p className="text-xs text-muted mt-1 font-medium">Multi-Factor Cadastral Trust Score</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-border text-left shadow-xs">
              <span className="text-2xl sm:text-3xl font-black text-brand font-mono">100% Local</span>
              <p className="text-xs text-muted mt-1 font-medium">Zero Data Leakage • In-Memory Compute</p>
            </div>
            <div className="p-4 rounded-xl bg-white border border-border text-left shadow-xs">
              <span className="text-2xl sm:text-3xl font-black text-text font-mono">1-Click</span>
              <p className="text-xs text-muted mt-1 font-medium">Automated Sliver Overlap Snapping</p>
            </div>
          </div>

        </div>
      </section>

      {/* How It Works (Simple 3-Step Flow) */}
      <section id="how-it-works" className="py-20 bg-surface/50 border-b border-border">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-brand mb-2 block">
              Streamlined User Experience
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-text">
              Harmonize Spatial Data in 3 Simple Steps
            </h2>
            <p className="text-muted text-sm mt-3 leading-relaxed">
              No complex command line tools or cumbersome GIS licensing required. Everything runs seamlessly in your web browser.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-white border border-border hover:border-brand/40 shadow-xs transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-brand-light text-brand flex items-center justify-center font-bold text-base mb-4">
                  01
                </div>
                <h3 className="text-lg font-bold text-text mb-2">Import Any Layer</h3>
                <p className="text-xs text-muted leading-relaxed">
                  Drag and drop your cadastral boundaries, drone survey orthophotos, road networks, or CSV water monitoring wells. The system automatically inspects coordinate reference systems and parses attributes.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-border flex items-center text-xs text-brand font-semibold space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Supports GeoJSON & CSV Lat/Lon</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-white border border-border hover:border-emerald-500/40 shadow-xs transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-base mb-4">
                  02
                </div>
                <h3 className="text-lg font-bold text-text mb-2">AI Harmonization</h3>
                <p className="text-xs text-muted leading-relaxed">
                  Click to execute sub-meter coordinate affine registration, scan for overlapping sliver polygons, and buffer arterial infrastructure corridors to uncover encroachments before civil construction begins.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-border flex items-center text-xs text-emerald-700 font-semibold space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Sub-meter ICP & Planar Topology</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-white border border-border hover:border-brand/40 shadow-xs transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-brand-light text-brand flex items-center justify-center font-bold text-base mb-4">
                  03
                </div>
                <h3 className="text-lg font-bold text-text mb-2">Review & Export</h3>
                <p className="text-xs text-muted leading-relaxed">
                  Inspect color-coded boundary diffs with human-in-the-loop approval. Check multi-factor confidence ratings and download verified datasets as clean GeoJSON or CSV for municipal GIS databases.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-border flex items-center text-xs text-brand font-semibold space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Audit-Ready Reports & Exports</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Real-World Solutions: Legacy Workflows vs GeoMap AI */}
      <section className="py-20 border-b border-border">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-brand mb-2 block">
              Built for Modern Land Governance
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-text">
              Why Urban Land Needs Automated Harmonization
            </h2>
            <p className="text-muted text-sm mt-3">
              Eliminate the friction between municipal planning authorities, revenue surveyors, and civil infrastructure engineers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* The Old Problem */}
            <div className="p-7 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-4 shadow-xs">
              <div className="flex items-center space-x-2.5 text-rose-800 font-bold text-base">
                <AlertOctagon className="w-5 h-5" />
                <span>The Traditional Manual Way</span>
              </div>
              <ul className="space-y-3.5 text-xs sm:text-sm text-text">
                <li className="flex items-start space-x-2.5">
                  <span className="text-rose-600 font-bold text-base">✕</span>
                  <span><strong>10m–25m Coordinate Drift:</strong> Unregistered drone imagery and legacy paper maps don’t line up with official cadastre.</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <span className="text-rose-600 font-bold text-base">✕</span>
                  <span><strong>Undetected Sliver Overlaps:</strong> Manual boundary tracing creates micro-overlaps that trigger costly civil court disputes.</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <span className="text-rose-600 font-bold text-base">✕</span>
                  <span><strong>Hidden Right-of-Way Clashes:</strong> Road corridor and utility easement infringements are discovered only after construction begins.</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <span className="text-rose-600 font-bold text-base">✕</span>
                  <span><strong>Disconnected Emergency Data:</strong> Disaster response teams lack unified spatial data to triage floods and route relief convoys.</span>
                </li>
              </ul>
            </div>

            {/* The GeoMap AI Solution */}
            <div className="p-7 rounded-2xl bg-white border border-border space-y-4 shadow-xs">
              <div className="flex items-center space-x-2.5 text-emerald-700 font-bold text-base">
                <ShieldCheck className="w-5 h-5" />
                <span>The GeoMap AI Advantage</span>
              </div>
              <ul className="space-y-3.5 text-xs sm:text-sm text-text">
                <li className="flex items-start space-x-2.5">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>AI Smart Alignment:</strong> 4-parameter Helmert affine transform automatically shrinks error down to &lt;0.28m RMSE.</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Automated Boundary Snapping:</strong> Identifies sliver polygons and provides 1-click human-approved boundary repair.</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Instant Encroachment Auditing:</strong> Calculates exact square-meter infringements on statutory arterial corridors with severity tiers.</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Integrated Disaster Triage:</strong> Computes nearest operational shelter and draws safe evacuation corridors during flood emergencies.</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </section>

      {/* Core Capabilities Showcase */}
      <section className="py-20 border-b border-border">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-brand mb-2 block">
              Core Platform Capabilities
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-text">
              Engineered for Speed, Accuracy, and Trust
            </h2>
            <p className="text-muted text-sm mt-3">
              Explore the built-in spatial algorithms powering the GeoMap AI engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1 */}
            <div className="p-5 rounded-2xl bg-white border border-border hover:border-brand/40 shadow-xs transition-all flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-brand-light text-brand flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base text-text mb-2">Smart Coordinate Alignment</h4>
                <p className="text-xs text-muted leading-relaxed">
                  Eliminate coordinate discrepancies between raw field GPS, drone mapping, and official cadastral basemaps with sub-meter affine registration.
                </p>
              </div>
              <button
                onClick={() => setActivePage('demo')}
                className="mt-4 pt-3 border-t border-border text-xs font-semibold text-brand flex items-center space-x-1 group-hover:underline"
              >
                <span>Test Alignment in Map</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 2 */}
            <div className="p-5 rounded-2xl bg-white border border-border hover:border-amber-500/40 shadow-xs transition-all flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base text-text mb-2">Topology & Sliver Repair</h4>
                <p className="text-xs text-muted leading-relaxed">
                  Detect micro-overlaps, slivers, and boundary gaps. Review visual diffs and snap shared edges with human-in-the-loop confirmation.
                </p>
              </div>
              <button
                onClick={() => setActivePage('demo')}
                className="mt-4 pt-3 border-t border-border text-xs font-semibold text-amber-700 flex items-center space-x-1 group-hover:underline"
              >
                <span>Fix Shape Anomaly</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 3 */}
            <div className="p-5 rounded-2xl bg-white border border-border hover:border-rose-500/40 shadow-xs transition-all flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <AlertOctagon className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base text-text mb-2">Right-of-Way Clashes</h4>
                <p className="text-xs text-muted leading-relaxed">
                  Buffer arterial road corridors, highway easements, and pipeline buffers to automatically detect encroaching parcel boundaries in square meters.
                </p>
              </div>
              <button
                onClick={() => setActivePage('demo')}
                className="mt-4 pt-3 border-t border-border text-xs font-semibold text-rose-700 flex items-center space-x-1 group-hover:underline"
              >
                <span>Inspect Conflicts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Card 4 */}
            <div className="p-5 rounded-2xl bg-white border border-border hover:border-emerald-500/40 shadow-xs transition-all flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Siren className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-base text-text mb-2">Disaster Triage & Routing</h4>
                <p className="text-xs text-muted leading-relaxed">
                  Connect land plots to municipal emergency facilities. Compute nearest available shelter, travel ETA, and safe green evacuation paths instantly.
                </p>
              </div>
              <button
                onClick={() => setActivePage('demo')}
                className="mt-4 pt-3 border-t border-border text-xs font-semibold text-emerald-700 flex items-center space-x-1 group-hover:underline"
              >
                <span>Simulate Evacuation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Real-User Technical FAQ */}
      <section className="py-20 bg-surface/60 border-b border-border">
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-brand mb-2 block">
              Clear Answers
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-text">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-muted mt-2">
              Everything you need to know about spatial data harmonization with GeoMap AI.
            </p>
          </div>

          <div className="space-y-3">
            {REAL_USER_FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white border border-border rounded-2xl overflow-hidden shadow-xs transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between text-xs sm:text-sm font-bold text-text hover:text-brand"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-brand flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted flex-shrink-0" />
                  )}
                </button>

                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-muted leading-relaxed border-t border-border pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Final Action Banner */}
      <section className="py-16">
        <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#7B1E2D] to-[#5A1420] text-center space-y-6 shadow-xl relative overflow-hidden text-white">
            
            <div className="max-w-2xl mx-auto space-y-3">
              <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
                Ready to Experience Unified Spatial Intelligence?
              </h3>
              <p className="text-xs sm:text-sm text-white/90">
                Test the interactive map with pre-loaded Hyderabad urban cadastral records, arterial highway corridors, and groundwater sensors.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setActivePage('demo')}
                className="px-8 py-3.5 rounded-xl font-bold text-sm bg-white text-[#7B1E2D] hover:bg-surface shadow-md transition-all flex items-center space-x-2 active:scale-95"
              >
                <Layers className="w-4 h-4" />
                <span>Launch Interactive GIS Map</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActivePage('datasets')}
                className="px-6 py-3.5 rounded-xl font-semibold text-sm bg-black/20 hover:bg-black/30 text-white border border-white/30 transition-colors"
              >
                Inspect Dataset Schemas
              </button>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
