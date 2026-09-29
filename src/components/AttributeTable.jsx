import React, { useState, useMemo, useEffect } from 'react';
import { Table, ChevronDown, ChevronUp, Search, Download, ZoomIn, ArrowUpDown } from 'lucide-react';
import Papa from 'papaparse';

export default function AttributeTable({
  activeLayer = null,
  onZoomToFeature = () => {}
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;

  // Reset page when layer or search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeLayer, searchQuery]);

  const features = useMemo(() => {
    if (!activeLayer || !activeLayer.geojson || !activeLayer.geojson.features) return [];
    return activeLayer.geojson.features;
  }, [activeLayer]);

  // Extract all unique property keys
  const columns = useMemo(() => {
    if (features.length === 0) return [];
    const keys = new Set();
    features.slice(0, 15).forEach(f => {
      Object.keys(f.properties || {}).forEach(k => keys.add(k));
    });
    return Array.from(keys);
  }, [features]);

  // Filtered and sorted rows
  const processedRows = useMemo(() => {
    let result = [...features];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(f => {
        return Object.values(f.properties || {}).some(v => 
          String(v).toLowerCase().includes(q)
        );
      });
    }

    if (sortColumn) {
      result.sort((a, b) => {
        const valA = a.properties?.[sortColumn] ?? '';
        const valB = b.properties?.[sortColumn] ?? '';
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [features, searchQuery, sortColumn, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(processedRows.length / rowsPerPage) || 1;
  const paginatedRows = processedRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleSort = (col) => {
    if (sortColumn === col) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(col);
      setSortDirection('asc');
    }
  };

  const handleExportCsv = () => {
    if (features.length === 0) return;
    const exportData = features.map(f => f.properties || {});
    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeLayer.name || 'features'}_attributes.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (!activeLayer) return null;

  return (
    <div className="bg-card border-t border-border text-text shadow-lg transition-all flex-shrink-0 z-30">
      {/* Header bar / Toggle */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-4 py-2.5 cursor-pointer bg-surface hover:bg-surface/80 transition-colors border-b border-border"
      >
        <div className="flex items-center space-x-2.5 text-sm">
          <Table className="w-4 h-4 text-brand" />
          <span className="font-bold text-text">
            Attribute Table: <span className="text-brand">{activeLayer.name}</span>
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white border border-border text-muted shadow-xs">
            {processedRows.length} Records
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs text-muted">
          <span className="hidden sm:inline">Click to inspect table</span>
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>
      </div>

      {/* Expanded Table Content */}
      {isOpen && (
        <div className="p-4 space-y-3 max-h-[35vh] min-h-[160px] overflow-hidden flex flex-col bg-card">
          {/* Controls Bar: Search & Export */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
            <div className="relative w-72 max-w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted" />
              <input
                type="text"
                placeholder="Search attributes..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-3 py-2 bg-white border border-border rounded-lg text-sm text-text placeholder-muted focus:outline-none focus:border-brand shadow-xs"
              />
            </div>

            <button
              onClick={handleExportCsv}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-white hover:bg-surface border border-border text-text shadow-xs transition-colors"
            >
              <Download className="w-4 h-4 text-brand" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-x-auto overflow-y-auto rounded-lg border border-border bg-white shadow-xs">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead className="bg-surface text-muted sticky top-0 border-b border-border">
                <tr>
                  <th className="p-2.5 w-12 text-center">Action</th>
                  {columns.map(col => (
                    <th
                      key={col}
                      onClick={() => handleSort(col)}
                      className="p-2.5 font-semibold text-text hover:text-brand cursor-pointer select-none whitespace-nowrap"
                    >
                      <div className="flex items-center space-x-1">
                        <span>{col}</span>
                        <ArrowUpDown className="w-3 h-3 text-muted" />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="p-6 text-center text-muted text-xs">
                      No matching records found.
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((feat, idx) => (
                    <tr 
                      key={feat.id || idx}
                      className="hover:bg-brand-light/25 transition-colors group"
                    >
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => onZoomToFeature(feat)}
                          title="Zoom to feature on map"
                          className="p-1 rounded text-muted hover:text-brand hover:bg-brand-light transition-colors"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                      </td>
                      {columns.map(col => (
                        <td key={col} className="p-2.5 whitespace-nowrap text-text">
                          {String(feat.properties?.[col] ?? '-')}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          <div className="flex items-center justify-between pt-1 text-xs text-muted">
            <span>
              Showing {Math.min((currentPage - 1) * rowsPerPage + 1, processedRows.length)} to {Math.min(currentPage * rowsPerPage, processedRows.length)} of {processedRows.length} entries
            </span>
            <div className="flex items-center space-x-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="px-2.5 py-1 rounded bg-white hover:bg-surface border border-border disabled:opacity-30 disabled:cursor-not-allowed text-xs text-text shadow-xs"
              >
                Prev
              </button>
              <span className="px-2 font-mono text-text font-medium">{currentPage} / {totalPages}</span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="px-2.5 py-1 rounded bg-white hover:bg-surface border border-border disabled:opacity-30 disabled:cursor-not-allowed text-xs text-text shadow-xs"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
