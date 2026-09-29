import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ThemeProvider } from './context/ThemeContext';

import Home from './pages/Home';
import Demo from './pages/Demo';
import Datasets from './pages/Datasets';
import Features from './pages/Features';
import About from './pages/About';
import Contact from './pages/Contact';
import Admin from './pages/Admin';

function MainApp() {
  // Sync page state with window.location.hash, defaulting to 'demo' (the interactive GIS map)
  const getPageFromHash = () => {
    const hash = window.location.hash.replace('#', '').trim().toLowerCase();
    const validPages = ['demo', 'home', 'datasets', 'features', 'about', 'contact', 'admin'];
    return validPages.includes(hash) ? hash : 'demo';
  };

  const [activePage, setActivePageState] = useState(getPageFromHash());

  const setActivePage = (page) => {
    setActivePageState(page);
    window.location.hash = page;
  };

  useEffect(() => {
    // If user opens root URL with no hash, initialize to #demo
    if (!window.location.hash || window.location.hash === '#') {
      window.location.hash = 'demo';
    }

    const handleHashChange = () => {
      setActivePageState(getPageFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Global interceptors: prevent whole-page zoom (pinch / Ctrl+wheel / Ctrl+/-) so ONLY the map zooms
  useEffect(() => {
    const handleWheel = (e) => {
      // On Windows trackpads, pinch gesture sends wheel with ctrlKey: true
      if (e.ctrlKey) {
        e.preventDefault();
        const mapContainer = document.querySelector('.leaflet-container');
        if (mapContainer && (mapContainer === e.target || mapContainer.contains(e.target))) {
          window.dispatchEvent(new CustomEvent('geomap:zoom', {
            detail: { delta: e.deltaY }
          }));
        }
      }
    };

    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in an input or textarea
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || document.activeElement?.isContentEditable) {
        return;
      }

      // Zoom shortcuts
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=' || e.key === '-' || e.key === '_' || e.key === '0')) {
        e.preventDefault();
        if (e.key === '+' || e.key === '=') {
          window.dispatchEvent(new CustomEvent('geomap:zoom', { detail: { type: 'in' } }));
        } else if (e.key === '-' || e.key === '_') {
          window.dispatchEvent(new CustomEvent('geomap:zoom', { detail: { type: 'out' } }));
        } else if (e.key === '0') {
          window.dispatchEvent(new CustomEvent('geomap:zoom', { detail: { type: 'reset' } }));
        }
        return;
      }

      // Keyboard arrow keys or WASD to move map (pan)
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('geomap:pan', { detail: { direction: 'left' } }));
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('geomap:pan', { detail: { direction: 'right' } }));
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('geomap:pan', { detail: { direction: 'up' } }));
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('geomap:pan', { detail: { direction: 'down' } }));
      }
    };

    const handleGesture = (e) => {
      e.preventDefault();
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('gesturestart', handleGesture);
    window.addEventListener('gesturechange', handleGesture);
    window.addEventListener('gestureend', handleGesture);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('gesturestart', handleGesture);
      window.removeEventListener('gesturechange', handleGesture);
      window.removeEventListener('gestureend', handleGesture);
    };
  }, []);

  const isDemo = activePage === 'demo';
  
  return (
    <div className="h-full w-full flex flex-col bg-surface text-text selection:bg-brand-light selection:text-brand overflow-hidden transition-colors duration-200">
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      <main className="flex-1 w-full min-h-0 flex flex-col overflow-hidden relative">
        {isDemo ? (
          <div className="h-full w-full flex flex-col min-h-0 overflow-hidden">
            <Demo />
          </div>
        ) : (
          <div className="h-full w-full overflow-y-auto overflow-x-hidden flex flex-col">
            <div className="flex-1">
              {activePage === 'home' && <Home setActivePage={setActivePage} />}
              {activePage === 'datasets' && <Datasets setActivePage={setActivePage} />}
              {activePage === 'features' && <Features setActivePage={setActivePage} />}
              {activePage === 'about' && <About setActivePage={setActivePage} />}
              {activePage === 'contact' && <Contact />}
              {activePage === 'admin' && <Admin />}
            </div>
            <Footer setActivePage={setActivePage} />
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}
