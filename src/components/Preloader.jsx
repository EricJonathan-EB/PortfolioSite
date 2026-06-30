import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { colors } from '../styles/theme'

// ─── Preloader ───────────────────────────────────────────
// Plays once on page load. Inspired by the GTA VI trailer's
// sunset-glitch title card, kept minimal for a portfolio:
//   sunset glow fades in → logo glitches into focus (RGB-split
//   ghosts jitter, then snap together with a flash) → brief
//   hold → punch-zoom + fade reveals the real site.
//
// Call onComplete to flip the parent's `loading` state to false.
const Preloader = ({ onComplete }) => {
  const containerRef = useRef(null)
  const flashRef      = useRef(null)
  const sunRef        = useRef(null)
  const logoBoxRef    = useRef(null)
  const ghostCyanRef  = useRef(null)
  const ghostPinkRef  = useRef(null)
  const baseLogoRef   = useRef(null)

  // Shared mask styling so both ghosts are tinted silhouettes of the
  // real logo shape (alpha-masked, not a flat box) rather than approximations.
  const maskStyle = {
    WebkitMaskImage: 'url(/pics/logo.PNG)',
    maskImage: 'url(/pics/logo.PNG)',
    WebkitMaskSize: 'contain',
    maskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
    mixBlendMode: 'screen',
  }

  useEffect(() => {
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const ctx = gsap.context(() => {
      gsap.set(containerRef.current, { opacity: 1 })
      gsap.set(flashRef.current,     { opacity: 1 })
      gsap.set(sunRef.current,       { opacity: 0, scale: 0.85 })
      gsap.set(logoBoxRef.current,   { opacity: 0, scale: 0.92 })
      gsap.set(baseLogoRef.current,  { opacity: 0 })
      gsap.set(ghostCyanRef.current, { opacity: 0.9, x: -10, y: 3 })
      gsap.set(ghostPinkRef.current, { opacity: 0.9, x: 10, y: -3 })

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: () => {
          document.body.style.overflow = prevOverflow
          onComplete?.()
        },
      })

      tl
        // Cinematic cut-in: white flash burns off, sunset glow rises
        .to(flashRef.current, { opacity: 0, duration: 0.35, ease: 'power2.out' }, 0)
        .to(sunRef.current,   { opacity: 1, scale: 1, duration: 0.9, ease: 'power2.out' }, 0.05)

        // Logo appears already mid-glitch (ghosts offset, base hidden)
        .to(logoBoxRef.current, { opacity: 1, scale: 1, duration: 0.25, ease: 'power2.out' }, 0.3)

        // Glitch jitter — a few quick stepped snaps, not a smooth tween
        .to(ghostCyanRef.current, { x: 6,  y: -2, duration: 0.05, ease: 'none' }, 0.35)
        .to(ghostPinkRef.current, { x: -5, y: 2,  duration: 0.05, ease: 'none' }, 0.35)
        .to(logoBoxRef.current,   { skewX: 2, duration: 0.04, ease: 'none' }, 0.38)
        .to(ghostCyanRef.current, { x: -8, y: 2,  duration: 0.05, ease: 'none' }, 0.43)
        .to(ghostPinkRef.current, { x: 7,  y: -2, duration: 0.05, ease: 'none' }, 0.43)
        .to(logoBoxRef.current,   { skewX: -1.5, duration: 0.04, ease: 'none' }, 0.47)
        .to(baseLogoRef.current,  { opacity: 0.5, duration: 0.03, ease: 'none' }, 0.5)
        .to(baseLogoRef.current,  { opacity: 0,   duration: 0.03, ease: 'none' }, 0.53)
        .to(ghostCyanRef.current, { x: 3, y: -1, duration: 0.05, ease: 'none' }, 0.56)
        .to(ghostPinkRef.current, { x: -3, y: 1, duration: 0.05, ease: 'none' }, 0.56)
        .to(logoBoxRef.current,   { skewX: 0, duration: 0.05, ease: 'none' }, 0.6)

        // Snap into focus: ghosts converge + fade, base logo locks in, flash pop
        .to([ghostCyanRef.current, ghostPinkRef.current], { x: 0, y: 0, opacity: 0, duration: 0.22, ease: 'power2.out' }, 0.65)
        .to(baseLogoRef.current, { opacity: 1, duration: 0.15, ease: 'power1.out' }, 0.65)
        .to(flashRef.current,    { opacity: 0.55, duration: 0.04 }, 0.65)
        .to(flashRef.current,    { opacity: 0, duration: 0.25, ease: 'power2.out' }, 0.69)

        // Hold, gentle glow breathe
        .to(sunRef.current, { scale: 1.06, duration: 0.9, ease: 'power1.inOut' }, 1.1)

        // Punch-zoom out, fade overlay to reveal the real site
        .to(logoBoxRef.current, { scale: 1.08, duration: 0.6, ease: 'power3.in' }, 2.0)
        .to(containerRef.current, {
          opacity: 0,
          scale: 1.12,
          filter: 'blur(18px)',
          duration: 0.6,
          ease: 'power3.in',
        }, 2.15)
    }, containerRef)

    return () => {
      document.body.style.overflow = prevOverflow
      ctx.revert()
    }
  }, [onComplete])

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100000] flex items-center justify-center overflow-hidden"
      style={{ background: '#0a0610' }}
    >
      {/* Sunset glow — the "GTA VI horizon" beat, minimal: one warm orb */}
      <div
        ref={sunRef}
        className="absolute pointer-events-none"
        style={{
          width: '620px',
          height: '620px',
          background: `radial-gradient(circle, ${colors.pink}55 0%, ${colors.amber}33 35%, ${colors.violet}22 60%, transparent 75%)`,
          filter: 'blur(70px)',
        }}
      />

      {/* Faint scanlines for a VHS/CRT texture, kept subtle */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.12]"
        style={{
          backgroundImage: 'repeating-linear-gradient(to bottom, rgba(255,255,255,0.5) 0px, transparent 1px, transparent 3px)',
        }}
      />

      {/* Film grain, matching the texture already used in Socials.jsx */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.15] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Logo — real asset, glitched into focus via RGB-split ghosts */}
      <div ref={logoBoxRef} className="relative" style={{ width: '200px', height: '200px' }}>
        {/* Cyan ghost: flat-tinted silhouette of the actual logo shape */}
        <div
          ref={ghostCyanRef}
          aria-hidden="true"
          className="absolute inset-0"
          style={{ backgroundColor: colors.cyan, ...maskStyle }}
        />
        {/* Pink ghost: flat-tinted silhouette of the actual logo shape */}
        <div
          ref={ghostPinkRef}
          aria-hidden="true"
          className="absolute inset-0"
          style={{ backgroundColor: colors.pink, ...maskStyle }}
        />
        {/* Crisp, true-color logo on top — this is what stays once it locks in */}
        <img
          ref={baseLogoRef}
          src="/pics/logo.PNG"
          alt="Logo"
          className="absolute inset-0 w-full h-full object-contain"
        />
      </div>
    </div>
  )
}

export default Preloader