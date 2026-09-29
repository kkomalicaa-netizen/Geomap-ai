/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ─── Brand ────────────────────────────────────────────────
        brand:         '#7B1E2D',
        'brand-hover': '#6A1826',
        'brand-deep':  '#3D0F18',
        'brand-light': 'var(--color-brand-light, #F5E8EB)',
        'brand-muted': '#C97B88',
        // ─── Surface ──────────────────────────────────────────────
        surface: 'var(--color-bg, #F8F6F4)',
        card:    'var(--color-card, #FFFFFF)',
        border:  'var(--color-border, #E8E0DC)',
        // ─── Actions ──────────────────────────────────────────────
        accent:        '#00B37E',
        'accent-hover':'#009668',
        'accent-light':'var(--color-accent-light, #E8F9F3)',
        link:          '#0F6FFF',
        'link-hover':  '#0057D9',
        'link-light':  'var(--color-link-light, #EFF6FF)',
        // ─── Text ─────────────────────────────────────────────────
        text:  'var(--color-text, #1F2937)',
        muted: 'var(--color-muted, #6B7280)',
        faint: 'var(--color-faint, #9CA3AF)',
        // ─── Semantic ─────────────────────────────────────────────
        warn:         '#F59E0B',
        'warn-light': 'var(--color-warn-light, #FFFBEB)',
        danger:       '#EF4444',
        'danger-light':'var(--color-danger-light, #FEF2F2)',
      },
      fontFamily: {
        sans:    ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        card:  'var(--shadow-card, 0 1px 4px rgba(123,30,45,0.06), 0 4px 16px rgba(0,0,0,0.06))',
        panel: '4px 0 24px rgba(0,0,0,0.18)',
        nav:   '0 1px 0 var(--color-border, #E8E0DC)',
        lift:  '0 4px 24px rgba(123,30,45,0.15)',
        modal: '0 20px 60px rgba(0,0,0,0.3)',
      },
      animation: {
        'pulse-fast':  'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow':   'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'slide-left':  'slideLeft 0.2s ease-out',
        'slide-right': 'slideRight 0.2s ease-out',
      },
      keyframes: {
        slideLeft:  { '0%': { transform:'translateX(-8px)', opacity:'0' }, '100%': { transform:'translateX(0)', opacity:'1' } },
        slideRight: { '0%': { transform:'translateX(8px)',  opacity:'0' }, '100%': { transform:'translateX(0)', opacity:'1' } },
      },
      spacing: { '18':'4.5rem', '22':'5.5rem', '88':'22rem' },
    },
  },
  plugins: [],
}
