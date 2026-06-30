import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { colors, gradients } from '../styles/theme'

// ─── 1) IMPORT DYNAMIC DATA ──────────────────────────────
// Edit `hackathons.json` to add, remove, or reorder entries.
// The component rebuilds automatically — no changes needed here.
import hackathonsData from '../data/hackathons.json'

// Map the string accentKey from JSON to actual theme color values
const hackathons = hackathonsData.map((h) => ({
  ...h,
  accent: colors[h.accentKey] || colors.violet, // fallback to violet if accentKey typo
}))

// ── Defined once at module level so JSX can always read it ──
const NUM = hackathons.length

// ── Shared progress-window geometry — single source of truth.
//    computeSectionState AND handleNextSection both read from this,
//    so they can never drift out of sync regardless of NUM. ──
const RANGE  = 0.80
const WINDOW = RANGE / NUM
const windowFor = (i) => {
  const start   = 0.10 + i * WINDOW
  const inEnd   = start + WINDOW * 0.35
  const holdEnd = start + WINDOW * 0.75
  const end     = start + WINDOW
  return { start, inEnd, holdEnd, end }
}

// ─── Ease Helper ─────────────────────────────────────────
const easeOut = (t) => 1 - Math.pow(1 - t, 4)

// ─── Engine (15x Zoom → Card Sequence → Exit) ────────────
const computeSectionState = (p) => {
  let titleOpacity = 0, titleScale = 15, titleY = 0, titleBlur = 0
  let arrowOpacity = 1

  // Phase 1 — 15x Zoom Entry
  if (p <= 0.10) {
    const t      = easeOut(p / 0.10)
    titleOpacity = t
    titleScale   = 15 - (14 * t)
    titleY       = -25 * t
    titleBlur    = 0
  }
  // Phase 2 — Hold Title (cards entering)
  else if (p <= 0.90) {
    titleScale = 1; titleY = -25
    const transitionT = Math.min(1, (p - 0.10) / 0.05)
    titleBlur    = transitionT * 12
    titleOpacity = 1 - (transitionT * 0.7) // Drops from 1 down to 0.3
  }
  // Phase 3 — Exit Section
  else {
    const t      = easeOut((p - 0.90) / 0.10)
    titleOpacity = 0.3 * (1 - t)
    titleScale   = 1; titleY = -25 - (20 * t); titleBlur = 12
    arrowOpacity = 1 - t
  }

  // Cards Math — scales automatically with NUM
  const cards = hackathons.map((_, i) => {
    const { start, inEnd, holdEnd, end } = windowFor(i)

    let cardOpacity = 0, cardX = 80, cardScale = 0.94
    let innerTitleScale = 8, innerTitleOpacity = 0, innerTitleY = 0
    let statOpacity = 0, statScale = 0.7, lineW = 0, stackOpacity = 0, stackY = 16

    if (p < start) {
      cardOpacity = 0; cardX = 80; cardScale = 0.94
    } else if (p <= inEnd) {
      const t = easeOut((p - start) / (WINDOW * 0.35))
      cardOpacity = t; cardX = 80 * (1 - t); cardScale = 0.94 + 0.06 * t
      innerTitleOpacity = t; innerTitleScale = 8 - 7 * t; innerTitleY = -20 * t
      statOpacity = t; statScale = 0.7 + 0.3 * t; lineW = t * 100; stackOpacity = t; stackY = 16 * (1 - t)
    } else if (p <= holdEnd) {
      cardOpacity = 1; cardX = 0; cardScale = 1
      innerTitleOpacity = 1; innerTitleScale = 1; innerTitleY = -20
      statOpacity = 1; statScale = 1; lineW = 100; stackOpacity = 1; stackY = 0
    } else if (i < NUM - 1 && p <= end) {
      const t = easeOut((p - holdEnd) / (WINDOW * 0.25))
      cardOpacity = 1 - t; cardX = -60 * t; cardScale = 1 - 0.04 * t
      innerTitleOpacity = 1 - t; innerTitleScale = 1; innerTitleY = -20 - 20 * t
      statOpacity = 1 - t; statScale = 1; lineW = 100; stackOpacity = 1 - t; stackY = -10 * t
    } else if (i === NUM - 1) {
      cardOpacity = 1; cardX = 0; cardScale = 1
      innerTitleOpacity = 1; innerTitleScale = 1; innerTitleY = -20
      statOpacity = 1; statScale = 1; lineW = 100; stackOpacity = 1; stackY = 0
    } else {
      cardOpacity = 0; cardX = -60; cardScale = 0.96
    }

    return { cardOpacity, cardX, cardScale, innerTitleScale, innerTitleOpacity, innerTitleY, statOpacity, statScale, lineW, stackOpacity, stackY }
  })

  return { titleOpacity, titleScale, titleY, titleBlur, arrowOpacity, cards }
}

// ─── Component ───────────────────────────────────────────
const Hackathons = () => {
  const sectionRef   = useRef(null)
  const bgTitleRef   = useRef(null)
  const backlightRef = useRef(null)
  const taglineRef   = useRef(null)

  const cardRefs  = useRef([])
  const titleRefs = useRef([])
  const lineRefs  = useRef([])
  const statRefs  = useRef([])
  const stackRefs = useRef([])

  const scrollStateRef   = useRef(0)
  const scrollTriggerRef = useRef(null)

  // Down-arrow handler — derives targets from the same windowFor() geometry
  // the animation engine uses, so it always lands on each card's holdEnd peak.
  const handleNextSection = () => {
    if (!scrollTriggerRef.current) return
    const p  = scrollStateRef.current
    const st = scrollTriggerRef.current

    // Gap of 0.02 prevents floating-point traps where p sits exactly at holdEnd,
    // which would make findIndex return -1 and freeze the arrow on the same card.
    const nextCard = hackathons.findIndex((_, i) => p < windowFor(i).holdEnd - 0.02)

    let targetY
    if (nextCard !== -1) {
      targetY = st.start + (st.end - st.start) * windowFor(nextCard).holdEnd
    } else {
      // Hard-handoff to the next pinned section
      const nextST = ScrollTrigger.getAll().find(t => t.trigger?.id === 'projects' && t.vars.pin)
      if (nextST) targetY = nextST.start + (nextST.end - nextST.start) * 0.10
      else return
    }

    const proxy = { y: window.scrollY || document.documentElement.scrollTop }
    const tween = gsap.to(proxy, { y: targetY, duration: 2, ease: 'power3.inOut', onUpdate: () => window.scrollTo(0, proxy.y) })
    const killTween = () => tween.kill()
    window.addEventListener('wheel',      killTween, { once: true, passive: true })
    window.addEventListener('touchstart', killTween, { once: true, passive: true })
  }

  useEffect(() => {
    if (NUM === 0) return // Safety guard if JSON is emptied

    // ── Initial safe states ──
    gsap.set(bgTitleRef.current,   { opacity: 0, scale: 15, transformOrigin: '50% 50%', filter: 'blur(0px)' })
    gsap.set(backlightRef.current, { opacity: 0 })

    cardRefs.current.forEach(el  => { if (el) gsap.set(el, { opacity: 0 }) })
    titleRefs.current.forEach(el => { if (el) gsap.set(el, { opacity: 0, scale: 8, y: 0, transformOrigin: '50% 50%' }) })
    lineRefs.current.forEach(el  => { if (el) gsap.set(el, { width: '0%' }) })
    statRefs.current.forEach(el  => { if (el) gsap.set(el, { opacity: 0, scale: 0.7 }) })
    stackRefs.current.forEach(el => { if (el) gsap.set(el, { opacity: 0, y: 16 }) })

    // Entrance bloom fade
    gsap.to(backlightRef.current, {
      opacity: 1, duration: 1.5, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
    })

    // Cinematic scroll engine — end scales automatically with NUM entries in JSON
    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: sectionRef.current,
      start:   'top top',
      end:     `+=${NUM * 1200}`,
      pin:     true,
      scrub:   1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p     = self.progress
        scrollStateRef.current = p
        const state = computeSectionState(p)

        if (bgTitleRef.current) gsap.set(bgTitleRef.current, {
          opacity: state.titleOpacity,
          scale:   state.titleScale,
          y:       `${state.titleY}vh`,
          filter:  `blur(${state.titleBlur}px)`,
          transformOrigin: '50% 50%',
        })

        if (taglineRef.current) gsap.set(taglineRef.current, {
          opacity:       state.arrowOpacity,
          pointerEvents: state.arrowOpacity > 0.5 ? 'auto' : 'none',
        })

        state.cards.forEach((s, i) => {
          if (cardRefs.current[i])  gsap.set(cardRefs.current[i],  { opacity: s.cardOpacity, x: s.cardX, scale: s.cardScale, transformOrigin: '50% 50%' })
          if (titleRefs.current[i]) gsap.set(titleRefs.current[i], { opacity: s.innerTitleOpacity, scale: s.innerTitleScale, y: s.innerTitleY, transformOrigin: '50% 50%' })
          if (lineRefs.current[i])  gsap.set(lineRefs.current[i],  { width: `${s.lineW}%` })
          if (statRefs.current[i])  gsap.set(statRefs.current[i],  { opacity: s.statOpacity, scale: s.statScale, transformOrigin: '50% 50%' })
          if (stackRefs.current[i]) gsap.set(stackRefs.current[i], { opacity: s.stackOpacity, y: s.stackY })
        })
      },
    })

    return () => { scrollTriggerRef.current?.kill() }
  }, [])

  if (NUM === 0) return null

  return (
    <section
      id="hackathons"
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden flex items-center justify-center"
      style={{ background: gradients.bg }}
    >
      {/* Cinematic Film Grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.18] mix-blend-overlay z-[100]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
      />

      {/* Base Bloom */}
      <div
        ref={backlightRef}
        className="absolute pointer-events-none z-[6]"
        style={{ width: '650px', height: '650px', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'radial-gradient(circle, rgba(123,47,255,0.12) 0%, rgba(255,60,110,0.06) 45%, transparent 70%)', filter: 'blur(90px)' }}
      />

      {/* 15x Zooming Background Title */}
      <div
        ref={bgTitleRef}
        className="absolute pointer-events-none select-none text-center w-full z-[5]"
        style={{ top: '50%', marginTop: '-70px', fontSize: 'min(16vw, 150px)', fontWeight: 900, fontStyle: 'italic', color: 'transparent', WebkitTextStroke: `2px ${colors.violet}`, textShadow: `0 0 100px ${colors.violet}44, 0 0 200px ${colors.amber}22`, letterSpacing: '-3px', textTransform: 'uppercase', whiteSpace: 'nowrap', lineHeight: 0.85 }}
      >
        HACKATHONS
      </div>

      {/* Top Left Navigation Label */}
      <div className="absolute top-10 left-10 z-[50] flex items-center gap-4 pointer-events-none">
        <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: colors.violet }}>03</span>
        <div style={{ width: '32px', height: '1px', background: `linear-gradient(90deg, ${colors.violet}, ${colors.pink})` }} />
        <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: colors.textDim }}>Hackathons</span>
      </div>

      {/* Sequence Cards */}
      <div className="absolute inset-0 flex items-center justify-center z-[20]">
        {hackathons.map((h, i) => (
          <div
            key={h.id}
            ref={el => (cardRefs.current[i] = el)}
            className="absolute w-full px-6 md:px-0"
            style={{ maxWidth: '720px', pointerEvents: 'none' }}
          >
            {/* Zoom-in edition text — behind the card */}
            <div
              ref={el => (titleRefs.current[i] = el)}
              className="absolute w-full flex items-center justify-center pointer-events-none"
              style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: -1 }}
            >
              <h1
                className="font-black italic tracking-tighter text-transparent select-none text-center px-4"
                style={{ fontSize: 'min(22vw, 220px)', lineHeight: 0.8, WebkitTextStroke: `2px ${h.accent}`, textShadow: `0 0 100px ${h.accent}44`, whiteSpace: 'nowrap' }}
              >
                {h.edition}
              </h1>
            </div>

            {/* Glassmorphism Shell */}
            <div
              className="rounded-2xl relative overflow-hidden"
              style={{ background: 'rgba(12,12,30,0.80)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(28px)', boxShadow: '0 32px 90px rgba(0,0,0,0.60), inset 0 1px 0 rgba(255,255,255,0.04)' }}
            >
              {/* Top Accent Bar */}
              <div style={{ height: '3px', background: `linear-gradient(90deg, ${h.accent}, transparent)` }} />

              <div className="p-8 md:p-10">
                <div className="flex items-center justify-between mb-7">
                  <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: h.accent }}>
                    {h.tag}
                  </span>
                  <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: h.accent, border: `1px solid ${h.accent}44`, borderRadius: '4px', padding: '4px 10px', background: `${h.accent}0d` }}>
                    {h.result}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-8">
                  <div className="flex-1 min-w-0">
                    <h2 style={{ fontSize: 'clamp(28px, 4.5vw, 48px)', fontWeight: 900, fontStyle: 'italic', color: colors.textPrimary, letterSpacing: '-1.5px', lineHeight: 1, marginBottom: '4px' }}>
                      {h.name}
                    </h2>
                    <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: h.accent, opacity: 0.7, marginBottom: '18px' }}>
                      {h.period}
                    </p>
                    <div ref={el => (lineRefs.current[i] = el)} style={{ height: '2px', borderRadius: '2px', background: gradients.tagAccent, marginBottom: '18px', width: '0%' }} />
                    <p style={{ fontSize: '14px', fontWeight: 400, color: colors.textSecondary, lineHeight: 1.9, maxWidth: '440px' }}>
                      {h.desc}
                    </p>
                  </div>

                  {/* Glowing Stat Box */}
                  <div
                    ref={el => (statRefs.current[i] = el)}
                    className="flex-shrink-0 flex flex-col items-center justify-center rounded-xl"
                    style={{ width: '110px', height: '110px', border: `1px solid ${h.accent}33`, background: `${h.accent}0a`, boxShadow: `0 0 40px ${h.accent}22` }}
                  >
                    <span style={{ fontSize: '30px', fontWeight: 900, fontStyle: 'italic', color: h.accent, letterSpacing: '-1px', lineHeight: 1 }}>
                      {h.stat.value}
                    </span>
                    <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: colors.textDim, textAlign: 'center', marginTop: '6px', lineHeight: 1.4 }}>
                      {h.stat.label}
                    </span>
                  </div>
                </div>

                <div ref={el => (stackRefs.current[i] = el)} className="flex flex-wrap gap-2 mt-7">
                  {h.stack.map(s => (
                    <span key={s} style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: h.accent, border: `1px solid ${h.accent}33`, borderRadius: '4px', padding: '5px 10px', background: `${h.accent}0d` }}>
                      {s}
                    </span>
                  ))}
                </div>

                <div className="absolute bottom-8 right-8" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '3px', color: colors.textDim, fontVariantNumeric: 'tabular-nums' }}>
                  {String(i + 1).padStart(2, '0')} / {String(NUM).padStart(2, '0')}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Global Down Arrow */}
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

export default Hackathons