import React, { useState } from 'react';
import { Layers, Activity, Database, Sparkles, ShieldCheck, MapPin, Menu, X, Cpu, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ activePage, setActivePage }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, isDark, toggleTheme } = useTheme();

  const navItems = [
    { id: 'home',     label: 'Overview',         icon: Sparkles  },
    { id: 'demo',     label: 'GIS Map',           icon: Layers,  highlight: true },
    { id: 'datasets', label: 'Data Catalog',      icon: Database  },
    { id: 'features', label: 'Capabilities',      icon: ShieldCheck },
    { id: 'about',    label: 'Impact',            icon: MapPin    },
    { id: 'admin',    label: 'Console',           icon: Cpu       },
    { id: 'contact',  label: 'Contact',           icon: Activity  },
  ];

  const handleNavClick = (pageId) => {
    setActivePage(pageId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border flex-shrink-0 transition-colors duration-200">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 py-0" style={{ height: '60px' }}>

          {/* Brand */}
          <div
            className="flex items-center space-x-3 cursor-pointer group flex-shrink-0"
            onClick={() => handleNavClick('home')}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-xs"
              style={{ background: 'linear-gradient(135deg, #7B1E2D 0%, #C97B88 100%)' }}>
              <Layers className="w-4.5 h-4.5 text-white" style={{ width: '18px', height: '18px' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-text">
                  GeoMap<span className="text-brand">.AI</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-brand-light text-brand border border-brand/20">
                  Enterprise GIS
                </span>
              </div>
              <p className="text-xs text-muted font-medium hidden sm:block" style={{ lineHeight: '1.2', marginTop: '1px' }}>
                Intelligent Spatial Harmonization
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-light text-brand font-semibold border border-brand/25 shadow-xs'
                      : item.highlight
                      ? 'text-brand font-semibold hover:bg-brand-light'
                      : 'text-muted hover:text-text hover:bg-surface'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isActive || item.highlight ? 'text-brand' : ''}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Status indicator */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-accent-light text-accent border border-accent/20">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span>Turf.js Active</span>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Theme"
              className="p-2 rounded-xl text-muted hover:text-text bg-surface hover:bg-card border border-border transition-all duration-200 active:scale-95 shadow-xs flex items-center justify-center group"
            >
              {isDark ? (
                <Sun className="w-4.5 h-4.5 text-amber-400 group-hover:rotate-45 transition-transform duration-300" style={{ width: '18px', height: '18px' }} />
              ) : (
                <Moon className="w-4.5 h-4.5 text-slate-700 group-hover:-rotate-12 transition-transform duration-300" style={{ width: '18px', height: '18px' }} />
              )}
            </button>

            {/* Launch Map CTA */}
            <button
              onClick={() => handleNavClick('demo')}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-brand hover:bg-brand-hover transition-all duration-150 active:scale-95 shadow-sm"
            >
              <Layers className="w-4 h-4" />
              <span>Launch Map</span>
            </button>
          </div>

          {/* Mobile Actions */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Theme"
              className="p-2 rounded-lg text-muted hover:text-text bg-surface border border-border transition-colors"
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>
            <button
              onClick={() => handleNavClick('demo')}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-brand hover:bg-brand-hover"
            >
              Map
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-muted hover:text-text hover:bg-surface focus:outline-none transition-colors border border-border"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-card border-b border-border px-4 pt-3 pb-5 space-y-1 animate-fade-in shadow-panel">
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted border-b border-border mb-2 flex items-center justify-between">
            <span>Navigation</span>
            <span className="text-[10px] font-semibold text-brand">GeoMap.AI</span>
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand text-white font-semibold' : 'text-muted hover:text-text hover:bg-surface'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
