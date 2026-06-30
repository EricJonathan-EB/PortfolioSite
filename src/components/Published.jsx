import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { colors, gradients } from '../styles/theme'

// ─── 1) IMPORT DYNAMIC DATA ──────────────────────────────
// Edit `publications.json` to add, remove, or reorder entries.
// The component rebuilds automatically — no changes needed here.
import publicationsData from '../data/publications.json'

// Map the string accentKey from JSON to actual theme color values
const publications = publicationsData.map((pub) => ({
  ...pub,
  accent: colors[pub.accentKey] || colors.amber, // fallback to amber if accentKey typo
}))

// ── Defined once at module level so JSX can always read it ──
const NUM = publications.length

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
  // Phase 2 — Hold Title
  else if (p <= 0.90) {
    titleOpacity = 1; titleScale = 1; titleY = -25
    const blurT = Math.min(1, (p - 0.10) / 0.05)
    titleBlur   = blurT * 12
  }
  // Phase 3 — Exit Section
  else {
    const t      = easeOut((p - 0.90) / 0.10)
    titleOpacity = 1 - t; titleScale = 1; titleY = -25 - (20 * t)
    titleBlur    = 12
    arrowOpacity = 1 - t
  }

  // Cards Math — scales automatically with NUM
  const cards = publications.map((_, i) => {
    const { start, inEnd, holdEnd, end } = windowFor(i)

    let leftOpacity  = 0, leftX  = -70
    let rightOpacity = 0, rightX = 70
    let numOpacity   = 0, numScale = 12, numY = -25
    let lineW = 0, metaOpacity = 0, metaY = 20

    if (p < start) {
      // not yet — keep entry defaults
    } else if (p <= inEnd) {
      const t      = easeOut((p - start) / (WINDOW * 0.35))
      leftOpacity  = t; leftX  = -70 * (1 - t)
      rightOpacity = t; rightX = 70  * (1 - t)
      numOpacity   = t; numScale = 12 - 11 * t; numY = -25
      lineW = t * 100; metaOpacity = t; metaY = 20 * (1 - t)
    } else if (p <= holdEnd) {
      leftOpacity  = 1; leftX  = 0
      rightOpacity = 1; rightX = 0
      numOpacity   = 1; numScale = 1; numY = -25
      lineW = 100; metaOpacity = 1; metaY = 0
    } else if (i < NUM - 1 && p <= end) {
      const t      = easeOut((p - holdEnd) / (WINDOW * 0.25))
      leftOpacity  = 1 - t; leftX  = -40 * t
      rightOpacity = 1 - t; rightX = 40  * t
      numOpacity   = 1 - t; numScale = 1; numY = -25 - 20 * t
      lineW = 100; metaOpacity = 1 - t; metaY = -10 * t
    } else if (i === NUM - 1) {
      leftOpacity  = 1; leftX  = 0
      rightOpacity = 1; rightX = 0
      numOpacity   = 1; numScale = 1; numY = -25
      lineW = 100; metaOpacity = 1; metaY = 0
    } else {
      leftOpacity  = 0; leftX  = -40
      rightOpacity = 0; rightX = 40
      numOpacity   = 0; numScale = 1; numY = -45
      lineW = 100; metaOpacity = 0; metaY = -10
    }

    return { leftOpacity, leftX, rightOpacity, rightX, numOpacity, numScale, numY, lineW, metaOpacity, metaY }
  })

  return { titleOpacity, titleScale, titleY, titleBlur, arrowOpacity, cards }
}

// ─── Component ───────────────────────────────────────────
const Published = () => {
  const sectionRef   = useRef(null)
  const bgTitleRef   = useRef(null)
  const backlightRef = useRef(null)
  const taglineRef   = useRef(null)

  const cardRefs  = useRef([])
  const leftRefs  = useRef([])
  const rightRefs = useRef([])
  const numRefs   = useRef([])
  const lineRefs  = useRef([])
  const metaRefs  = useRef([])

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
    const nextCard = publications.findIndex((_, i) => p < windowFor(i).holdEnd - 0.02)

    let targetY
    if (nextCard === -1) {
      // Hard-handoff to the next pinned section
      const nextST = ScrollTrigger.getAll().find(t => t.trigger?.id === 'hackathons' && t.vars.pin)
      if (nextST) targetY = nextST.start + (nextST.end - nextST.start) * 0.10
      else return
    } else {
      targetY = st.start + (st.end - st.start) * windowFor(nextCard).holdEnd
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
    leftRefs.current.forEach(el  => { if (el) gsap.set(el, { opacity: 0, x: -70 }) })
    rightRefs.current.forEach(el => { if (el) gsap.set(el, { opacity: 0, x: 70 }) })
    numRefs.current.forEach(el   => { if (el) gsap.set(el, { opacity: 0, scale: 12, y: '-25%', transformOrigin: '50% 50%' }) })
    lineRefs.current.forEach(el  => { if (el) gsap.set(el, { width: '0%' }) })
    metaRefs.current.forEach(el  => { if (el) gsap.set(el, { opacity: 0, y: 20 }) })

    // Entrance bloom fade
    gsap.to(backlightRef.current, {
      opacity: 1, duration: 1.5, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
    })

    // Cinematic scroll engine — end scales automatically with NUM entries in JSON
    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: sectionRef.current,
      start:   'top top',
      end:     `+=${NUM * 1300}`,
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
          if (cardRefs.current[i])  gsap.set(cardRefs.current[i],  { opacity: s.leftOpacity })
          if (leftRefs.current[i])  gsap.set(leftRefs.current[i],  { opacity: s.leftOpacity,  x: s.leftX,  transformOrigin: '50% 50%' })
          if (rightRefs.current[i]) gsap.set(rightRefs.current[i], { opacity: s.rightOpacity, x: s.rightX, transformOrigin: '50% 50%' })
          if (numRefs.current[i])   gsap.set(numRefs.current[i],   { opacity: s.numOpacity, scale: s.numScale, y: `${s.numY}%`, transformOrigin: '50% 50%' })
          if (lineRefs.current[i])  gsap.set(lineRefs.current[i],  { width: `${s.lineW}%` })
          if (metaRefs.current[i])  gsap.set(metaRefs.current[i],  { opacity: s.metaOpacity, y: s.metaY })
        })
      },
    })

    return () => { scrollTriggerRef.current?.kill() }
  }, [])

  if (NUM === 0) return null

  return (
    <section
      id="published"
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
        style={{ width: '600px', height: '600px', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'radial-gradient(circle, rgba(255,140,66,0.10) 0%, rgba(255,60,110,0.06) 45%, transparent 70%)', filter: 'blur(90px)' }}
      />

      {/* 15x Zooming Background Title */}
      <div
        ref={bgTitleRef}
        className="absolute pointer-events-none select-none text-center w-full z-[5]"
        style={{ top: '50%', marginTop: '-70px', fontSize: 'min(16vw, 150px)', fontWeight: 900, fontStyle: 'italic', color: 'transparent', WebkitTextStroke: `2px ${colors.amber}`, textShadow: `0 0 100px ${colors.amber}44, 0 0 200px ${colors.amber}22`, letterSpacing: '-3px', textTransform: 'uppercase', whiteSpace: 'nowrap', lineHeight: 0.85 }}
      >
        PUBLISHED
      </div>

      {/* Top Left Navigation Label */}
      <div className="absolute top-10 left-10 z-[50] flex items-center gap-4 pointer-events-none">
        <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: colors.amber }}>02</span>
        <div style={{ width: '32px', height: '1px', background: `linear-gradient(90deg, ${colors.amber}, ${colors.pink})` }} />
        <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: colors.textDim }}>Published</span>
      </div>

      {/* Sequence Cards */}
      <div className="absolute inset-0 flex items-center justify-center z-[20] px-6 md:px-12 lg:px-24">
        {publications.map((pub, i) => (
          <div
            key={pub.id}
            ref={el => (cardRefs.current[i] = el)}
            className="absolute w-full"
            style={{ maxWidth: '1100px', pointerEvents: 'none' }}
          >
            {/* Background Zooming Number */}
            <div
              ref={el => (numRefs.current[i] = el)}
              className="absolute pointer-events-none select-none z-[1]"
              style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: 'min(40vw, 400px)', fontWeight: 900, fontStyle: 'italic', color: 'transparent', WebkitTextStroke: `1px ${pub.accent}44`, opacity: 0, lineHeight: 1, letterSpacing: '-10px' }}
            >
              {String(i + 1).padStart(2, '0')}
            </div>

            {/* Split Screen Container (Unified Glassmorphism) */}
            <div
              className="relative z-[10] flex flex-col md:flex-row rounded-2xl overflow-hidden shadow-2xl"
              style={{ background: 'rgba(12,12,30,0.72)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(24px)', boxShadow: '0 32px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)' }}
            >
              {/* ─── Left Panel ─── */}
              <div
                ref={el => (leftRefs.current[i] = el)}
                className="w-full md:w-[300px] lg:w-[340px] flex-shrink-0 flex flex-col justify-between p-7 md:p-10 relative overflow-hidden"
              >
                <div style={{ height: '3px', background: `linear-gradient(90deg, ${pub.accent}, transparent)`, borderRadius: '2px', marginBottom: '28px' }} />

                <div className="mb-auto">
                  <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: pub.accent, display: 'block', marginBottom: '10px' }}>
                    {pub.type}
                  </span>
                  <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: pub.accent, border: `1px solid ${pub.accent}44`, borderRadius: '4px', padding: '4px 10px', background: `${pub.accent}0d`, display: 'inline-block' }}>
                    {pub.status}
                  </span>
                </div>

                <div ref={el => (metaRefs.current[i] = el)} className="flex flex-col gap-5 mt-10">
                  {pub.meta.map(m => (
                    <div key={m.label}>
                      <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: colors.textDim, display: 'block', marginBottom: '4px' }}>
                        {m.label}
                      </span>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: colors.textPrimary, letterSpacing: '0.5px' }}>
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '32px', fontSize: '11px', fontWeight: 700, letterSpacing: '3px', color: colors.textDim, fontVariantNumeric: 'tabular-nums' }}>
                  {String(i + 1).padStart(2, '0')} / {String(NUM).padStart(2, '0')}
                </div>
              </div>

              {/* Dividers */}
              <div className="hidden md:block w-[1px] flex-shrink-0 self-stretch" style={{ background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.06), transparent)' }} />
              <div className="md:hidden h-[1px] w-full flex-shrink-0"               style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />

              {/* ─── Right Panel ─── */}
              <div
                ref={el => (rightRefs.current[i] = el)}
                className="flex-1 min-w-0 flex flex-col justify-center p-7 md:p-10 lg:p-12 relative"
              >
                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: pub.accent, opacity: 0.7, display: 'block', marginBottom: '16px' }}>
                  {pub.venue} &nbsp;·&nbsp; {pub.period}
                </span>

                <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, fontStyle: 'italic', color: colors.textPrimary, letterSpacing: '-1.5px', lineHeight: 1.05, marginBottom: '8px' }}>
                  {pub.title}
                </h2>

                <p style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color: pub.accent, opacity: 0.8, marginBottom: '20px' }}>
                  {pub.subtitle}
                </p>

                <div ref={el => (lineRefs.current[i] = el)} style={{ height: '2px', borderRadius: '2px', background: gradients.tagAccent, marginBottom: '24px', width: '0%' }} />

                <p style={{ fontSize: '15px', fontWeight: 400, color: colors.textSecondary, lineHeight: 1.9, maxWidth: '580px' }}>
                  {pub.desc}
                </p>

                {/* Inner Glow */}
                <div className="absolute bottom-0 right-0 pointer-events-none overflow-hidden rounded-br-2xl" style={{ width: '250px', height: '250px', background: `radial-gradient(circle at bottom right, ${pub.accent}14 0%, transparent 65%)` }} />
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

export default Published