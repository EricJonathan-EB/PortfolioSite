import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { colors, gradients } from '../styles/theme'

// ─── 1) IMPORT DYNAMIC DATA ──────────────────────────────
import experienceData from '../data/experience.json'

// Map the string keys from JSON to actual theme colors
const roles = experienceData.map((role) => ({
  ...role,
  accent: colors[role.accentKey] || colors.pink // fallback to pink if typo in JSON
}))

// ── defined once at module level so JSX can always read it ──
const NUM = roles.length

// Dynamically calculates the "Hold" peak for ANY number of cards added to the JSON
const windowFor = (i) => {
  const WINDOW = 0.80 / NUM
  return { holdEnd: 0.10 + (i * WINDOW) + (WINDOW * 0.85) }
}

// ─── Ease Helper ─────────────────────────────────────────
const easeOut = (t) => 1 - Math.pow(1 - t, 4)

// ─── Engine ──────────────────────────────────────────────
const computeSectionState = (p) => {
  let titleOpacity = 0, titleScale = 15, titleY = 0, titleBlur = 0
  let arrowOpacity = 1

  if (p <= 0.10) {
    const t      = easeOut(p / 0.10)
    titleOpacity = t
    titleScale   = 15 - (14 * t)
    titleY       = -25 * t
    titleBlur    = 0
  } else if (p <= 0.90) {
    titleOpacity = 1; titleScale = 1; titleY = -25
    const blurT = Math.min(1, (p - 0.10) / 0.05)
    titleBlur = blurT * 12
  } else {
    const t      = easeOut((p - 0.90) / 0.10)
    titleOpacity = 1 - t; titleScale = 1; titleY = -25 - (20 * t)
    titleBlur    = 12
    arrowOpacity = 1 - t
  }

  const range  = 0.80
  const WINDOW = range / NUM

  const cards = roles.map((_, i) => {
    const start   = 0.10 + i * WINDOW
    const inEnd   = start + WINDOW * 0.15 
    const holdEnd = start + WINDOW * 0.85 
    const end     = start + WINDOW

    let opacity = 0, y = 60, scale = 0.9, lineW = 0, skillsY = 20, skillsOpacity = 0

    if (p < start) {
      opacity = 0; y = 60; scale = 0.9; lineW = 0; skillsY = 20; skillsOpacity = 0
    } else if (p <= inEnd) {
      const t = easeOut((p - start) / (WINDOW * 0.15))
      opacity = t; y = 60 * (1 - t); scale = 0.9 + 0.1 * t
      lineW = t * 100; skillsY = 20 * (1 - t); skillsOpacity = t
    } else if (p <= holdEnd) {
      opacity = 1; y = 0; scale = 1; lineW = 100; skillsY = 0; skillsOpacity = 1
    } else if (i < NUM - 1 && p <= end) {
      const t = easeOut((p - holdEnd) / (WINDOW * 0.15))
      opacity = 1 - t; y = -40 * t; scale = 1 - 0.05 * t
      lineW = 100; skillsY = -10 * t; skillsOpacity = 1 - t
    } else if (i === NUM - 1) {
      opacity = 1; y = 0; scale = 1; lineW = 100; skillsY = 0; skillsOpacity = 1
    } else {
      opacity = 0; y = -40; scale = 0.95; lineW = 100; skillsY = -10; skillsOpacity = 0
    }

    return { opacity, y, scale, lineW, skillsY, skillsOpacity }
  })

  return { titleOpacity, titleScale, titleY, titleBlur, arrowOpacity, cards }
}

// ─── Component ───────────────────────────────────────────
const Experience = () => {
  const sectionRef   = useRef(null)
  const bgTitleRef   = useRef(null)
  const backlightRef = useRef(null)
  const taglineRef   = useRef(null)

  const cardRefs  = useRef([])
  const lineRefs  = useRef([])
  const skillRefs = useRef([])

  const scrollStateRef   = useRef(0)
  const scrollTriggerRef = useRef(null)

  const handleNextSection = () => {
    if (!scrollTriggerRef.current) return
    const p  = scrollStateRef.current
    const st = scrollTriggerRef.current

    const nextCardIdx = Array.from({ length: NUM }).findIndex((_, i) => p < windowFor(i).holdEnd - 0.02)

    let targetY
    if (nextCardIdx !== -1) {
      targetY = st.start + (st.end - st.start) * windowFor(nextCardIdx).holdEnd
    } else {
      const nextST = ScrollTrigger.getAll().find(t => t.trigger?.id === 'published' && t.vars.pin)
      if (nextST) targetY = nextST.start + (nextST.end - nextST.start) * 0.10
      else return
    }

    const proxy = { y: window.scrollY || document.documentElement.scrollTop }
    const tween = gsap.to(proxy, { y: targetY, duration: 2, ease: 'power3.inOut', onUpdate: () => window.scrollTo(0, proxy.y) })
    const killTween = () => tween.kill()
    window.addEventListener('wheel', killTween, { once: true, passive: true })
    window.addEventListener('touchstart', killTween, { once: true, passive: true })
  }

  useEffect(() => {
    if (NUM === 0) return // Safety check if JSON is empty

    gsap.set(bgTitleRef.current,  { opacity: 0, scale: 15, transformOrigin: '50% 50%', filter: 'blur(0px)' })
    gsap.set(backlightRef.current,{ opacity: 0 })
    cardRefs.current.forEach(el  => { if (el) gsap.set(el, { opacity: 0, y: 60, scale: 0.9 }) })
    lineRefs.current.forEach(el  => { if (el) gsap.set(el, { width: '0%' }) })
    skillRefs.current.forEach(el => { if (el) gsap.set(el, { opacity: 0, y: 20 }) })

    gsap.to(backlightRef.current, {
      opacity: 1, duration: 1.4, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
    })

    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: sectionRef.current,
      start:   'top top',
      end:     `+=${NUM * 1200}`, // Automatically scales based on JSON entries!
      pin:     true,
      scrub:   0.7, // Responsive tracking
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p     = self.progress
        scrollStateRef.current = p
        const state = computeSectionState(p)

        if (bgTitleRef.current) gsap.set(bgTitleRef.current, {
          opacity: state.titleOpacity, scale: state.titleScale,
          y: `${state.titleY}vh`, filter: `blur(${state.titleBlur}px)`, transformOrigin: '50% 50%',
        })
        if (taglineRef.current) gsap.set(taglineRef.current, {
          opacity: state.arrowOpacity,
          pointerEvents: state.arrowOpacity > 0.5 ? 'auto' : 'none',
        })

        state.cards.forEach((s, i) => {
          if (cardRefs.current[i])  gsap.set(cardRefs.current[i],  { opacity: s.opacity, y: s.y, scale: s.scale, transformOrigin: '50% 50%' })
          if (lineRefs.current[i])  gsap.set(lineRefs.current[i],  { width: `${s.lineW}%` })
          if (skillRefs.current[i]) gsap.set(skillRefs.current[i], { opacity: s.skillsOpacity, y: s.skillsY })
        })
      },
    })

    return () => { scrollTriggerRef.current?.kill() }
  }, [])

  if (NUM === 0) return null

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden flex items-center justify-center"
    >
      {/* Backlight */}
      <div
        ref={backlightRef}
        className="absolute pointer-events-none z-[6]"
        style={{ width: '600px', height: '600px', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: gradients.backlightStatic, filter: 'blur(90px)' }}
      />

      {/* 15x zoom title */}
      <div
        ref={bgTitleRef}
        className="absolute pointer-events-none select-none text-center w-full z-[5]"
        style={{ top: '50%', fontSize: 'min(16vw, 140px)', fontWeight: 900, fontStyle: 'italic', color: 'transparent', WebkitTextStroke: `2px ${colors.pink}`, textShadow: `0 0 100px ${colors.pink}44, 0 0 200px ${colors.pink}22`, letterSpacing: '-3px', textTransform: 'uppercase', whiteSpace: 'nowrap', lineHeight: 0.85 }}
      >
        EXPERIENCE
      </div>

      {/* Section label */}
      <div className="absolute top-10 left-10 z-[50] flex items-center gap-4 pointer-events-none">
        <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: colors.pink }}>01</span>
        <div style={{ width: '32px', height: '1px', background: gradients.tagAccent }} />
        <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: colors.textDim }}>Experience</span>
      </div>

      {/* Cards */}
      <div className="absolute inset-0 flex items-center justify-center z-[20]">
        {roles.map((role, i) => (
          <div
            key={role.id}
            ref={el => (cardRefs.current[i] = el)}
            // Increased max-width to handle the side-by-side layout nicely
            className="absolute w-full max-w-[950px] px-4 md:px-0"
            style={{ pointerEvents: 'none' }}
          >
            <div
              className="rounded-2xl flex flex-col md:flex-row relative overflow-hidden"
              style={{ background: 'rgba(12,12,30,0.72)', border: `1px solid rgba(255,255,255,0.06)`, backdropFilter: 'blur(24px)', boxShadow: `0 32px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)` }}
            >
              {/* Corner glow */}
              <div
                className="absolute top-0 right-0 pointer-events-none z-0"
                style={{ width: '300px', height: '300px', background: `radial-gradient(circle at top right, ${role.accent}18 0%, transparent 65%)`, borderRadius: '50%' }}
              />

              {/* ─── LEFT COLUMN: Text Content ─── */}
              <div className="flex-1 flex flex-col justify-center p-8 md:p-10 relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: role.accent }}>{role.tag}</span>
                  <span style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '2px', color: colors.textDim }}>{role.period}</span>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  {role.logo && (
                    <img 
                      src={role.logo} 
                      alt={`${role.company} Logo`} 
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 shadow-lg object-cover"
                    />
                  )}
                  <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, fontStyle: 'italic', color: colors.textPrimary, letterSpacing: '-1.5px', lineHeight: 1 }}>
                    {role.company}
                  </h2>
                </div>

                <p style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: role.accent, opacity: 0.8, mb: '20px' }}>
                  {role.role}
                </p>

                <div ref={el => (lineRefs.current[i] = el)} style={{ height: '2px', borderRadius: '2px', background: gradients.tagAccent, marginBottom: '20px', width: '0%', marginTop: '16px' }} />

                <p style={{ fontSize: '14px', fontWeight: 400, color: colors.textSecondary, lineHeight: 1.8, marginBottom: '28px', maxWidth: '520px' }}>
                  {role.desc}
                </p>

                <div ref={el => (skillRefs.current[i] = el)} className="flex flex-wrap gap-2">
                  {role.skills.map(skill => (
                    <span key={skill} style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: role.accent, border: `1px solid ${role.accent}44`, borderRadius: '4px', padding: '5px 10px', background: `${role.accent}0d` }}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* ─── RIGHT COLUMN: Certificate with Ambient Blur ─── */}
              {role.certificate && (
                <div className="hidden md:flex w-[280px] lg:w-[360px] flex-shrink-0 relative overflow-hidden bg-black/60 items-center justify-center border-l border-white/5 shadow-[inset_10px_0_30px_rgba(0,0,0,0.4)]">
                  {/* Blurred Ambient Backdrop */}
                  <img 
                    src={role.certificate} 
                    alt="Ambient Blur" 
                    className="absolute inset-0 w-full h-full object-cover opacity-30 blur-2xl transform scale-110 saturate-150" 
                  />
                  {/* Foreground Sharp Certificate */}
                  <img 
                    src={role.certificate} 
                    alt={`${role.company} Certificate`} 
                    className="relative z-10 w-full h-full object-contain p-4 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]" 
                  />
                  
                  {/* Subtle gradient overlay to merge it nicely */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[rgba(12,12,30,0.8)] to-transparent w-16 z-20 pointer-events-none" />
                </div>
              )}

              {/* Card index positioned inside the bottom of the right edge (or bottom right of text col if no image) */}
              <div className="absolute bottom-6 right-6 z-[30] px-3 py-1 rounded-full backdrop-blur-md bg-black/30 border border-white/10" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '3px', color: colors.textDim, fontVariantNumeric: 'tabular-nums' }}>
                {String(i + 1).padStart(2, '0')} / {String(NUM).padStart(2, '0')}
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Down arrow */}
      <div
        ref={taglineRef}
        onClick={handleNextSection}
        className="absolute bottom-10 w-full flex flex-col items-center justify-center z-[100] cursor-pointer group pointer-events-none"
      >
        <div className="animate-bounce rounded-full p-3 bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/30 group-hover:scale-110 transition-all duration-300 backdrop-blur-md pointer-events-auto">
          <svg className="w-6 h-6 text-white/50 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </section>
  )
}

export default Experience