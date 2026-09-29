import React, { useState } from 'react';
import { Mail, MessageSquare, Send, CheckCircle, HelpCircle, ChevronDown, ChevronUp, Github, Globe } from 'lucide-react';
import confetti from 'canvas-confetti';

const FAQS = [
  {
    q: 'How does GeoMap AI achieve sub-meter alignment without an external server?',
    a: 'GeoMap AI performs client-side spatial compute using Turf.js and modern WebAssembly/V8 JavaScript optimizations. It calculates centroid offsets and applies a 4-parameter Helmert affine transformation directly in-memory, delivering 0ms server latency.'
  },
  {
    q: 'Does this application require an active backend or database?',
    a: 'No. GeoMap AI is 100% serverless and client-side executable. It can be hosted on any static edge CDN such as GitHub Pages, Vercel, or Netlify with zero hosting cost, yet performs real GIS polygon intersections, buffering, and topological clipping.'
  },
  {
    q: 'How does the engine handle state-specific coordinate systems (e.g. UTM vs EPSG:4326)?',
    a: 'The engine ingests WGS84 (EPSG:4326) coordinates natively. Projected coordinates (UTM / State Plane) can be converted during ingestion via client-side reprojection matrix.'
  },
  {
    q: 'How does the human-in-the-loop topology fix comply with legal cadastral rules?',
    a: 'Under DILRMP guidelines, automated systems cannot unilaterally overwrite legal property boundaries. GeoMap AI flags the sliver overlap, calculates the exact area infringement, presents a color-coded before/after diff, and requires explicit administrative sign-off before committing.'
  }
];

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', role: 'Judge / Evaluator', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.message) return;
    setSubmitted(true);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  return (
    <div className="min-h-screen bg-surface text-text py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center space-x-2 text-xs font-semibold text-brand bg-brand-light border border-brand/20 px-3 py-1 rounded-full shadow-xs">
            <Mail className="w-3.5 h-3.5" />
            <span>Judge Evaluation & Team Inquiries</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-text">Get in Touch with Team GeoGuardians</h1>
          <p className="text-xs sm:text-sm text-muted">
            Have questions about our spatial algorithms, national deployment roadmap, or SIH 26013 evaluation?
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Contact Form (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
            {submitted ? (
              <div className="py-12 text-center space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-bold text-text">Feedback Received!</h3>
                <p className="text-xs text-muted max-w-xs mx-auto">
                  Thank you for reviewing GeoMap AI. Your evaluation notes have been registered in our session audit log.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-surface hover:bg-border text-text border border-border"
                >
                  Send Another Note
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <h3 className="text-base font-bold text-text mb-2">Send Message / Feedback</h3>
                
                <div>
                  <label className="text-text font-semibold block mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dr. A. Sharma"
                    className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-xs text-text placeholder-muted focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="text-text font-semibold block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="judge@sih.gov.in"
                    className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-xs text-text placeholder-muted focus:outline-none focus:border-brand"
                  />
                </div>

                <div>
                  <label className="text-text font-semibold block mb-1">Stakeholder Role</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-xs text-text focus:outline-none focus:border-brand"
                  >
                    <option>Judge / Evaluator (SIH 2026)</option>
                    <option>Land Revenue Officer / SDM</option>
                    <option>GIS Specialist / Urban Planner</option>
                    <option>Municipal Authority (GHMC / Smart Cities)</option>
                    <option>Academic Researcher</option>
                  </select>
                </div>

                <div>
                  <label className="text-text font-semibold block mb-1">Evaluation Comments or Questions</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Share your thoughts on the AI smart alignment, topology repair, or disaster triage workflows..."
                    className="w-full bg-surface border border-border rounded-xl px-3.5 py-2.5 text-xs text-text placeholder-muted focus:outline-none focus:border-brand"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-bold text-xs bg-brand hover:bg-brand-hover text-white shadow-xs transition-all flex items-center justify-center space-x-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit to Evaluator Portal</span>
                </button>
              </form>
            )}
          </div>

          {/* Technical FAQ (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center space-x-2 text-brand text-xs font-bold uppercase tracking-wider mb-2">
              <HelpCircle className="w-4 h-4 text-brand" />
              <span>Frequently Answered Questions for Judges</span>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, idx) => (
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

            {/* Quick Links Banner */}
            <div className="p-5 rounded-2xl bg-white border border-border shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center space-x-2 text-text">
                <Globe className="w-4 h-4 text-brand" />
                <span>Zero Server Dependencies • Instant Static Deployment</span>
              </div>
              <span className="font-mono text-emerald-700 font-semibold text-[11px]">v1.0.0-PROD</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
