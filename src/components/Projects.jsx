import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { colors, gradients } from '../styles/theme'

import projectsData from '../data/projects.json'

const allProjects = projectsData.map((p) => ({
  ...p,
  accent: colors[p.accentKey] || colors.cyan,
}))

// ── Split into normal cards and the unified "under review" vault ──
const normalProjects  = allProjects.filter(p => p.statusType !== 'review')
const reviewProjects  = allProjects.filter(p => p.statusType === 'review')
const hasReviewVault  = reviewProjects.length > 0

// Scroll engine operates on normal cards + 1 vault slot (if any review projects exist)
const SCROLL_ITEMS = normalProjects.length + (hasReviewVault ? 1 : 0)
const TOTAL_DISPLAY = allProjects.length // shown in the X / Y counter

const STATUS_STYLES = {
  review:    { bg: 'rgba(0,245,255,0.08)',  border: 'rgba(0,245,255,0.30)',  text: '#00f5ff' },
  dev:       { bg: 'rgba(255,170,0,0.08)',  border: 'rgba(255,170,0,0.35)',  text: '#ffaa00' },
  patent:    { bg: 'rgba(255,140,66,0.08)', border: 'rgba(255,140,66,0.35)', text: '#ff8c42' },
  published: { bg: 'rgba(0,255,160,0.08)',  border: 'rgba(0,255,160,0.35)',  text: '#00ffa0' },
  done:      { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.12)', text: 'rgba(255,255,255,0.45)' },
}

const NUM    = SCROLL_ITEMS
const RANGE  = 0.80
const WINDOW = RANGE / NUM

const windowFor = (i) => {
  const start   = 0.10 + i * WINDOW
  const inEnd   = start + WINDOW * 0.35
  const holdEnd = start + WINDOW * 0.75
  const end     = start + WINDOW
  return { start, inEnd, holdEnd, end }
}

const easeOut = (t) => 1 - Math.pow(1 - t, 4)

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
    titleScale = 1; titleY = -25
    const transitionT = Math.min(1, (p - 0.10) / 0.05)
    titleBlur    = transitionT * 12
    titleOpacity = 1 - (transitionT * 0.7)
  } else {
    const t      = easeOut((p - 0.90) / 0.10)
    titleOpacity = 0.3 * (1 - t)
    titleScale   = 1; titleY = -25 - (20 * t); titleBlur = 12
    arrowOpacity = 1 - t
  }

  const cards = Array.from({ length: NUM }).map((_, i) => {
    const { start, inEnd, holdEnd, end } = windowFor(i)
    let opacity = 0, y = 60, scale = 0.9, lineW = 0, techY = 20, techOpacity = 0

    if (p < start) {
      opacity = 0; y = 60; scale = 0.9; lineW = 0; techY = 20; techOpacity = 0
    } else if (p <= inEnd) {
      const t  = easeOut((p - start) / (WINDOW * 0.35))
      opacity  = t; y = 60 * (1 - t); scale = 0.9 + 0.1 * t
      lineW    = t * 100; techY = 20 * (1 - t); techOpacity = t
    } else if (p <= holdEnd) {
      opacity = 1; y = 0; scale = 1; lineW = 100; techY = 0; techOpacity = 1
    } else if (i < NUM - 1 && p <= end) {
      const t  = easeOut((p - holdEnd) / (WINDOW * 0.25))
      opacity  = 1 - t; y = -40 * t; scale = 1 - 0.05 * t
      lineW    = 100; techY = -10 * t; techOpacity = 1 - t
    } else if (i === NUM - 1) {
      opacity = 1; y = 0; scale = 1; lineW = 100; techY = 0; techOpacity = 1
    } else {
      opacity = 0; y = -40; scale = 0.95; lineW = 100; techY = -10; techOpacity = 0
    }

    return { opacity, y, scale, lineW, techY, techOpacity }
  })

  return { titleOpacity, titleScale, titleY, titleBlur, arrowOpacity, cards }
}

// ─── Component ───────────────────────────────────────────
const Projects = () => {
  const sectionRef   = useRef(null)
  const bgTitleRef   = useRef(null)
  const backlightRef = useRef(null)
  const taglineRef   = useRef(null)

  const cardRefs = useRef([])
  const lineRefs = useRef([])
  const techRefs = useRef([])

  const scrollStateRef   = useRef(0)
  const scrollTriggerRef = useRef(null)

  // Per-review-project peek state inside the vault card
  const [revealedIds, setRevealedIds] = useState({})
  const toggleReveal = (id) =>
    setRevealedIds(prev => ({ ...prev, [id]: !prev[id] }))

  const handleNextSection = () => {
    if (!scrollTriggerRef.current) return
    const p  = scrollStateRef.current
    const st = scrollTriggerRef.current

    const nextCard = Array.from({ length: NUM }).findIndex((_, i) => p < windowFor(i).holdEnd - 0.02)

    let targetY
    if (nextCard !== -1) {
      targetY = st.start + (st.end - st.start) * windowFor(nextCard).holdEnd
    } else {
      const nextST = ScrollTrigger.getAll().find(t => t.trigger?.id === 'socials' && t.vars.pin)
      if (nextST) targetY = nextST.start + (nextST.end - nextST.start) * 0.15
      else return
    }

    const proxy = { y: window.scrollY || document.documentElement.scrollTop }
    const tween = gsap.to(proxy, { y: targetY, duration: 2, ease: 'power3.inOut', onUpdate: () => window.scrollTo(0, proxy.y) })
    const killTween = () => tween.kill()
    window.addEventListener('wheel',      killTween, { once: true, passive: true })
    window.addEventListener('touchstart', killTween, { once: true, passive: true })
  }

  useEffect(() => {
    if (NUM === 0) return

    gsap.set(bgTitleRef.current,   { opacity: 0, scale: 15, transformOrigin: '50% 50%', filter: 'blur(0px)' })
    gsap.set(backlightRef.current, { opacity: 0 })
    cardRefs.current.forEach(el => { if (el) gsap.set(el, { opacity: 0, y: 60, scale: 0.9 }) })
    lineRefs.current.forEach(el => { if (el) gsap.set(el, { width: '0%' }) })
    techRefs.current.forEach(el => { if (el) gsap.set(el, { opacity: 0, y: 20 }) })

    gsap.to(backlightRef.current, {
      opacity: 1, duration: 1.4, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
    })

    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: sectionRef.current,
      start:   'top top',
      end:     `+=${NUM * 1200}`,
      pin:     true,
      scrub:   0.7,
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
          if (cardRefs.current[i]) gsap.set(cardRefs.current[i], { opacity: s.opacity, y: s.y, scale: s.scale, transformOrigin: '50% 50%' })
          if (lineRefs.current[i]) gsap.set(lineRefs.current[i], { width: `${s.lineW}%` })
          if (techRefs.current[i]) gsap.set(techRefs.current[i], { opacity: s.techOpacity, y: s.techY })
        })
      },
    })

    return () => { scrollTriggerRef.current?.kill() }
  }, [])

  if (NUM === 0) return null

  // Vault card sits at the last scroll index
  const vaultIndex = NUM - 1
  const accent      = colors.cyan

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden flex items-center justify-center"
      style={{ background: gradients.bg }}
    >
      {/* Film grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.18] mix-blend-overlay z-[100]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }}
      />

      {/* Backlight */}
      <div
        ref={backlightRef}
        className="absolute pointer-events-none z-[6]"
        style={{ width: '650px', height: '650px', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'radial-gradient(circle, rgba(0,245,255,0.13) 0%, rgba(123,47,255,0.07) 45%, transparent 70%)', filter: 'blur(90px)' }}
      />

      {/* 15x zoom background title */}
      <div
        ref={bgTitleRef}
        className="absolute pointer-events-none select-none text-center w-full z-[5]"
        style={{ top: '50%', fontSize: 'min(16vw, 140px)', fontWeight: 900, fontStyle: 'italic', color: 'transparent', WebkitTextStroke: `2px ${colors.cyan}`, textShadow: `0 0 100px ${colors.cyan}44, 0 0 200px ${colors.cyan}22`, letterSpacing: '-3px', textTransform: 'uppercase', whiteSpace: 'nowrap', lineHeight: 0.85 }}
      >
        PROJECTS
      </div>

      {/* Section label */}
      <div className="absolute top-10 left-10 z-[50] flex items-center gap-4 pointer-events-none">
        <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: colors.cyan }}>04</span>
        <div style={{ width: '32px', height: '1px', background: `linear-gradient(90deg, ${colors.cyan}, ${colors.violet})` }} />
        <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: colors.textDim }}>Projects</span>
      </div>

      <div className="absolute inset-0 flex items-center justify-center z-[20]">

        {/* ── NORMAL PROJECT CARDS ── */}
        {normalProjects.map((project, i) => {
          const badge = STATUS_STYLES[project.statusType] || STATUS_STYLES.done
          return (
            <div
              key={project.id}
              ref={el => (cardRefs.current[i] = el)}
              className="absolute w-full max-w-[720px] px-6 md:px-0"
              style={{ pointerEvents: 'none' }}
            >
              <div
                className="rounded-2xl p-8 md:p-10 relative overflow-hidden"
                style={{ background: 'rgba(12,12,30,0.72)', border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(24px)', boxShadow: '0 32px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04)' }}
              >
                <div className="absolute top-0 right-0 pointer-events-none" style={{ width: '250px', height: '250px', background: `radial-gradient(circle at top right, ${project.accent}18 0%, transparent 65%)`, borderRadius: '50%' }} />
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, ${project.accent}, ${project.accent}44, transparent)` }} />

                <div className="flex items-center justify-between mb-5">
                  <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: project.accent }}>{project.tag}</span>
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: badge.text, border: `1px solid ${badge.border}`, borderRadius: '4px', padding: '3px 8px', background: badge.bg }}>
                      {project.status}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '2px', color: colors.textDim }}>{project.period}</span>
                  </div>
                </div>

                <h2 style={{ fontSize: 'clamp(26px, 4.2vw, 48px)', fontWeight: 900, fontStyle: 'italic', color: colors.textPrimary, letterSpacing: '-1.5px', lineHeight: 1, marginBottom: '6px' }}>
                  {project.name}
                </h2>
                <p style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: project.accent, opacity: 0.8, marginBottom: '20px' }}>
                  {project.type}
                </p>

                <div ref={el => (lineRefs.current[i] = el)} style={{ height: '2px', borderRadius: '2px', background: `linear-gradient(90deg, ${project.accent}, ${project.accent}44)`, marginBottom: '20px', width: '0%' }} />

                <p style={{ fontSize: '15px', fontWeight: 400, color: colors.textSecondary, lineHeight: 1.9, marginBottom: '28px', maxWidth: '560px' }}>
                  {project.desc}
                </p>

                <div ref={el => (techRefs.current[i] = el)} className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map(t => (
                      <span key={t} style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: project.accent, border: `1px solid ${project.accent}44`, borderRadius: '4px', padding: '5px 10px', background: `${project.accent}0d` }}>
                        {t}
                      </span>
                    ))}
                  </div>
                  {(project.github || project.live) && (
                    <div className="flex gap-3" style={{ pointerEvents: 'auto' }}>
                      {project.github && (
                        <a href={project.github} target="_blank" rel="noreferrer"
                          style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: colors.textPrimary, border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', padding: '8px 18px', textDecoration: 'none', background: 'rgba(255,255,255,0.03)', transition: 'all 0.2s ease' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = project.accent; e.currentTarget.style.color = project.accent; e.currentTarget.style.background = `${project.accent}11` }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = colors.textPrimary; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                        >GitHub ↗</a>
                      )}
                      {project.live && (
                        <a href={project.live} target="_blank" rel="noreferrer"
                          style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: colors.bgDeep, border: `1px solid ${project.accent}`, borderRadius: '6px', padding: '8px 18px', textDecoration: 'none', background: project.accent, transition: 'opacity 0.2s ease' }}
                          onMouseEnter={e => { e.currentTarget.style.opacity = '0.82' }}
                          onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                        >Live ↗</a>
                      )}
                    </div>
                  )}
                </div>

                <div className="absolute bottom-8 right-8" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '3px', color: colors.textDim, fontVariantNumeric: 'tabular-nums' }}>
                  {String(i + 1).padStart(2, '0')} / {String(TOTAL_DISPLAY).padStart(2, '0')}
                </div>
              </div>
            </div>
          )
        })}

        {/* ── UNIFIED VAULT CARD (all under-review projects combined) ── */}
        {hasReviewVault && (
          <div
            ref={el => (cardRefs.current[vaultIndex] = el)}
            className="absolute w-full max-w-[720px] px-6 md:px-0"
            style={{ pointerEvents: 'none' }}
          >
            <style>{`
              @keyframes vaultFadeIn {
                from { opacity: 0; transform: translateY(6px); filter: blur(5px); }
                to   { opacity: 1; transform: translateY(0);   filter: blur(0px); }
              }
              @keyframes vaultFadeOut {
                from { opacity: 1; transform: translateY(0);   filter: blur(0px); }
                to   { opacity: 0; transform: translateY(6px); filter: blur(5px); }
              }
            `}</style>

            <div
              className="rounded-2xl relative overflow-hidden"
              style={{ background: 'rgba(8,8,22,0.88)', border: `1px solid ${accent}22`, backdropFilter: 'blur(28px)', boxShadow: `0 32px 80px rgba(0,0,0,0.70), 0 0 80px ${accent}08, inset 0 1px 0 ${accent}18` }}
            >
              {/* Corner glow */}
              <div className="absolute top-0 right-0 pointer-events-none" style={{ width: '300px', height: '300px', background: `radial-gradient(circle at top right, ${accent}12 0%, transparent 65%)`, borderRadius: '50%' }} />

              {/* Top accent bar — centred gradient to feel symmetrical */}
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${accent}77, transparent)` }} />

              {/* ── Card header ── */}
              <div className="flex items-center justify-between px-8 pt-8 pb-6">
                <div className="flex items-center gap-3">
                  {/* Lock icon */}
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: `1px solid ${accent}44`, background: `${accent}0d`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <div>
                    <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: accent }}>Classified Research</p>
                    <p style={{ fontSize: '11px', fontWeight: 500, color: colors.textDim, marginTop: '2px' }}>{reviewProjects.length} works pending peer review</p>
                  </div>
                </div>
                <div className="flex items-center gap-2" style={{ padding: '4px 12px', borderRadius: '20px', border: `1px solid ${accent}33`, background: `${accent}0a` }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: accent, display: 'inline-block', animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }} />
                  <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: accent }}>Under Review</span>
                </div>
              </div>

              {/* Divider */}
              <div ref={el => (lineRefs.current[vaultIndex] = el)} style={{ height: '1px', background: `linear-gradient(90deg, transparent, ${accent}44, transparent)`, width: '0%', margin: '0 32px' }} />

              {/* ── Per-project rows ── */}
              <div ref={el => (techRefs.current[vaultIndex] = el)} className="flex flex-col px-8 py-6 gap-0">
                {reviewProjects.map((rp, ri) => {
                  const isRevealed = !!revealedIds[rp.id]
                  const isLast = ri === reviewProjects.length - 1
                  return (
                    <div key={rp.id}>
                      <div
                        onClick={() => toggleReveal(rp.id)}
                        style={{ pointerEvents: 'auto', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '16px 0', transition: 'opacity 0.2s ease' }}
                        onMouseEnter={e => { e.currentTarget.style.opacity = '0.8' }}
                        onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                      >
                        {/* Left: tag + title or placeholder */}
                        <div className="flex flex-col gap-1 flex-1 min-w-0">
                          <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: accent, opacity: 0.7 }}>{rp.tag} · {rp.period}</span>
                          {isRevealed ? (
                            <p style={{ fontSize: 'clamp(14px, 2vw, 18px)', fontWeight: 900, fontStyle: 'italic', color: colors.textPrimary, letterSpacing: '-0.5px', lineHeight: 1.1, animation: 'vaultFadeIn 0.35s ease forwards' }}>
                              {rp.name}
                            </p>
                          ) : (
                            <div className="flex flex-col gap-[6px]" style={{ animation: 'vaultFadeIn 0.2s ease forwards' }}>
                              <div style={{ height: '14px', width: `${55 + ri * 12}%`, borderRadius: '4px', background: `${accent}18` }} />
                            </div>
                          )}
                        </div>

                        {/* Right: tap hint + chevron */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: accent, opacity: 0.45 }}>
                            {isRevealed ? 'lock' : 'peek'}
                          </span>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: `1px solid ${accent}33`, background: `${accent}0a`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease', transform: isRevealed ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Row divider — skip after last */}
                      {!isLast && (
                        <div style={{ height: '1px', background: `rgba(255,255,255,0.04)` }} />
                      )}
                    </div>
                  )
                })}
              </div>

              {/* ── Footer ── */}
              <div className="flex items-center justify-between px-8 pb-8 pt-2">
                <p style={{ fontSize: '11px', fontWeight: 400, color: colors.textDim, lineHeight: 1.6, maxWidth: '400px' }}>
                  Details will be disclosed upon publication. Tap any row to peek at the title.
                </p>
                <div className="absolute bottom-8 right-8" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '3px', color: colors.textDim, fontVariantNumeric: 'tabular-nums' }}>
                  {String(normalProjects.length + 1).padStart(2, '0')}–{String(TOTAL_DISPLAY).padStart(2, '0')} / {String(TOTAL_DISPLAY).padStart(2, '0')}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Down chevron */}
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

export default Projects