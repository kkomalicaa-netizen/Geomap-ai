import React from 'react';
import { Layers, ShieldCheck, MapPin, GitBranch, Terminal, Globe, Award } from 'lucide-react';

export default function Footer({ setActivePage }) {
  return (
    <footer className="bg-card border-t border-border text-muted py-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1: GeoMap AI Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg p-0.5" style={{ background: 'linear-gradient(135deg, #7B1E2D 0%, #10B981 100%)' }}>
                <div className="w-full h-full bg-white rounded-[6px] flex items-center justify-center shadow-xs">
                  <Layers className="w-4 h-4" style={{ color: '#7B1E2D' }} />
                </div>
              </div>
              <span className="text-lg font-bold text-text tracking-tight">
                GeoMap<span style={{ color: '#7B1E2D' }}>.AI</span>
              </span>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Automated Integration and Intelligent Harmonization of Multi-source Geospatial Data for Urban Land Record Management.
            </p>
            <div className="flex items-center space-x-2 text-xs font-semibold" style={{ color: '#059669' }}>
              <Award className="w-4 h-4" />
              <span>Next-Gen Spatial Intelligence Engine</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Enterprise Multi-Source Cadastral Harmonization
            </p>
          </div>

          {/* Col 2: National Initiatives & Standards */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text">
              Framework Alignment
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center space-x-1.5 hover:text-text transition-colors">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#7B1E2D' }}></span>
                <span>DoLR NAKSHA Programme</span>
              </li>
              <li className="flex items-center space-x-1.5 hover:text-text transition-colors">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#7B1E2D' }}></span>
                <span>NIC BhuNaksha Integration</span>
              </li>
              <li className="flex items-center space-x-1.5 hover:text-text transition-colors">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#7B1E2D' }}></span>
                <span>DILRMP Modernization Mandate</span>
              </li>
              <li className="flex items-center space-x-1.5 hover:text-text transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                <span>OGC Interoperability Standard</span>
              </li>
              <li className="flex items-center space-x-1.5 hover:text-text transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                <span>EPSG:4326 / WGS 84 Cadastre</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Core Features */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text">
              Harmonization Suite
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => setActivePage('demo')}
                  className="hover:underline transition-colors text-left text-muted hover:text-brand"
                >
                  AI Smart Alignment (Affine / Helmert)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePage('demo')}
                  className="hover:underline transition-colors text-left text-muted hover:text-brand"
                >
                  Topology Repair (Sliver & Gap Clip)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePage('demo')}
                  className="hover:underline transition-colors text-left text-muted hover:text-brand"
                >
                  Right-of-Way Encroachment Audit
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePage('demo')}
                  className="hover:underline transition-colors text-left text-muted hover:text-brand"
                >
                  Explainable Trust Score Matrix
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActivePage('demo')}
                  className="hover:underline transition-colors text-left text-emerald-700 font-medium"
                >
                  Emergency Triage & Evacuation Routing
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Quick Navigation & Deploy */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text">
              Deployment & Specs
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg bg-card border border-border space-y-1.5 shadow-xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted">Host Targets</span>
                  <span className="text-emerald-700 font-mono font-medium">Pages / Vercel</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted">GIS Engine</span>
                  <span className="font-mono font-medium" style={{ color: '#7B1E2D' }}>Turf.js + Leaflet</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted">Zero Server Cost</span>
                  <span className="text-text font-mono font-semibold">100% Client-Side</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  onClick={() => setActivePage('admin')}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white border border-border hover:bg-surface text-text transition-colors text-xs font-medium shadow-xs"
                >
                  <Terminal className="w-3.5 h-3.5 text-muted" />
                  <span>Admin Panel</span>
                </button>
                <button
                  onClick={() => setActivePage('datasets')}
                  className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white border border-border hover:bg-surface text-text transition-colors text-xs font-medium shadow-xs"
                >
                  <Globe className="w-3.5 h-3.5 text-muted" />
                  <span>Data Catalog</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-muted gap-4">
          <p>© 2026 GeoMap AI • Smart India Hackathon. Open Geospatial Architecture for Smart Urban Governance.</p>
          <div className="flex items-center space-x-6 font-medium">
            <span className="hover:text-brand transition-colors cursor-pointer" onClick={() => setActivePage('about')}>Architecture</span>
            <span className="hover:text-brand transition-colors cursor-pointer" onClick={() => setActivePage('features')}>Documentation</span>
            <span className="hover:text-brand transition-colors cursor-pointer" onClick={() => setActivePage('contact')}>Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

