// ─── Site-wide Vice City × GTA VI Theme ─────────────────
// Import this into any component that needs colours.
// e.g. import { colors, gradients } from '../styles/theme'

export const colors = {
  // Backgrounds
  bgDeep:     '#06060f',   // deepest black — page root
  bgMid:      '#0c0c1e',   // slightly lifted — cards, overlays
  bgSurface:  '#12122a',   // highest surface — borders, hover states

  // Accents
  pink:       '#ff3c6e',   // hot coral-pink — primary CTA, tags, highlights
  cyan:       '#00f5ff',   // electric cyan — secondary glow, b0 hover
  amber:      '#ff8c42',   // warm amber — tertiary, donut ring
  violet:     '#7b2fff',   // deep violet — bloom backlight, donut outer ring

  // Text
  textPrimary:   '#f0ede8',          // near-white warm
  textSecondary: 'rgba(240,237,232,0.55)',  // muted body
  textDim:       'rgba(240,237,232,0.25)',  // taglines, hints

  // Borders
  borderSubtle: 'rgba(255,255,255,0.06)',
  borderGlow:   'rgba(255,60,110,0.35)',
}

export const gradients = {
  bg: 'radial-gradient(ellipse at 65% 35%, #1a1535 0%, #0d0d20 35%, #08080f 65%, #06060f 100%)',

  backlightStatic:
    'radial-gradient(circle, rgba(123,47,255,0.14) 0%, rgba(255,60,110,0.07) 40%, transparent 70%)',

  overlayModal:
    'radial-gradient(ellipse at 65% 35%, #1a1535 0%, #0d0d20 35%, #08080f 65%, #06060f 100%)',

  tagAccent:  'linear-gradient(90deg, #ff3c6e, #ff8c42)',
  cardBorder: 'linear-gradient(135deg, rgba(255,60,110,0.3), rgba(0,245,255,0.15))',
}

export const glow = {
  pink:   '0 0 30px rgba(255,60,110,0.45)',
  cyan:   '0 0 40px rgba(0,245,255,0.45)',
  violet: '0 0 50px rgba(123,47,255,0.35)',
}

export const font = {
  display: "'Inter', sans-serif",  // swap for a custom font later
}