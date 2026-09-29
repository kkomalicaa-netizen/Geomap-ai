import React from 'react';
import { Award, Shield, Users, Landmark, MapPin, Layers, CheckCircle, GitBranch, ArrowRight } from 'lucide-react';

export default function About({ setActivePage }) {
  return (
    <div className="min-h-screen bg-surface text-text py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-brand bg-brand-light border border-brand/20 px-3.5 py-1.5 rounded-full shadow-xs">
            <Award className="w-4 h-4" />
            <span>Enterprise Geospatial Platform Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-text">
            About GeoMap AI
          </h1>
          <p className="text-sm sm:text-base text-muted">
            “Harmonizing Maps, Empowering Cities” — One City. Multiple Data Sources. One Trusted Land Intelligence Layer.
          </p>
        </div>

        {/* Platform Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white border border-border shadow-xs">
            <span className="text-xs text-muted font-semibold block">Architecture Standard</span>
            <span className="text-lg font-bold text-brand font-mono">OGC / EPSG:4326</span>
            <span className="text-[11px] text-muted block mt-1">Planar & Spherical WGS84</span>
          </div>
          <div className="p-4 rounded-xl bg-white border border-border shadow-xs">
            <span className="text-xs text-muted font-semibold block">Compute Framework</span>
            <span className="text-lg font-bold text-emerald-700">Turf.js Client V8</span>
            <span className="text-[11px] text-muted block mt-1">Zero Cloud Latency</span>
          </div>
          <div className="p-4 rounded-xl bg-white border border-border shadow-xs">
            <span className="text-xs text-muted font-semibold block">Target Deployment</span>
            <span className="text-lg font-bold text-text">Urban Agglomerations</span>
            <span className="text-[11px] text-muted block mt-1">Municipal & Revenue Cadastre</span>
          </div>
          <div className="p-4 rounded-xl bg-white border border-border shadow-xs">
            <span className="text-xs text-muted font-semibold block">Core Innovation</span>
            <span className="text-lg font-bold text-brand">Automated Alignment</span>
            <span className="text-[11px] text-muted block mt-1">Proactive Encroachment Auditing</span>
          </div>
        </div>

        {/* Problem Statement Details */}
        <div className="p-8 rounded-3xl bg-white border border-border space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 text-brand text-xs font-bold uppercase tracking-wider">
            <Landmark className="w-4 h-4" />
            <span>Official Problem Statement Description</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-text leading-snug">
            Automated Integration and Intelligent Harmonization of Multi-source Geospatial Data for Urban Land Record Management
          </h2>
          <p className="text-xs sm:text-sm text-muted leading-relaxed">
            Land records are severely fragmented across cadastral maps, revenue records, municipal GIS layers, GNSS surveys, and drone imagery — presenting mismatched formats, coordinate reference systems, duplicate entries, and boundary conflicts. GeoMap AI auto-integrates and harmonizes these multi-source land datasets into one trusted geospatial layer with intelligent disaster-response capabilities.
          </p>
        </div>

        {/* Stakeholder Impact Grid (Slide 5) */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-text text-center">
            Measurable Impact Across Key Stakeholders
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-5 rounded-2xl bg-white border border-border shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-brand-light text-brand flex items-center justify-center font-bold text-xs">
                GOV
              </div>
              <h4 className="font-bold text-sm text-text">State Government</h4>
              <ul className="text-xs text-muted space-y-1.5 pt-1">
                <li>• Accelerated cadastral data integration</li>
                <li>• 85% reduction in manual GIS backlogs</li>
                <li>• Seamless inter-departmental data sharing</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-border shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                REV
              </div>
              <h4 className="font-bold text-sm text-text">Land Officers & Courts</h4>
              <ul className="text-xs text-muted space-y-1.5 pt-1">
                <li>• Automated conflict prioritization</li>
                <li>• Objective verification with RMSE metrics</li>
                <li>• Explainable confidence scores (Grade A+)</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-border shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs">
                URB
              </div>
              <h4 className="font-bold text-sm text-text">Urban Planners</h4>
              <ul className="text-xs text-muted space-y-1.5 pt-1">
                <li>• Accurate spatial intelligence layer</li>
                <li>• Infrastructure corridor buffer audits</li>
                <li>• Zero-latency client-side simulation</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-border shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-brand-light text-brand flex items-center justify-center font-bold text-xs">
                CIT
              </div>
              <h4 className="font-bold text-sm text-text">Citizens & Buyers</h4>
              <ul className="text-xs text-muted space-y-1.5 pt-1">
                <li>• Elimination of fraudulent boundary overlaps</li>
                <li>• Transparent title verification</li>
                <li>• Faster mutation and registration</li>
              </ul>
            </div>

          </div>
        </div>

        {/* Strategic Government Alignment */}
        <div className="p-8 rounded-3xl bg-white border border-border shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-text">Alignment with National Programmes</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted">
            <div className="p-4 rounded-xl bg-surface border border-border">
              <span className="font-bold text-brand block mb-1">DoLR NAKSHA Programme</span>
              <span className="text-muted">Direct compliance with the Department of Land Resources urban land record modernization guidelines.</span>
            </div>
            <div className="p-4 rounded-xl bg-surface border border-border">
              <span className="font-bold text-emerald-700 block mb-1">NIC BhuNaksha Interoperability</span>
              <span className="text-muted">Exports and validates GeoJSON boundary records compatible with National Informatics Centre cadastre databases.</span>
            </div>
            <div className="p-4 rounded-xl bg-surface border border-border">
              <span className="font-bold text-brand block mb-1">DILRMP Standards</span>
              <span className="text-muted">Conforms to the Digital India Land Records Modernization Programme geodetic accuracy benchmarks.</span>
            </div>
          </div>
        </div>

        <div className="text-center pt-4">
          <button
            onClick={() => setActivePage('demo')}
            className="px-6 py-3 rounded-xl font-bold text-xs bg-brand hover:bg-brand-hover text-white shadow-xs transition-all inline-flex items-center space-x-2"
          >
            <span>Experience the Solution in the Live GIS Demo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
