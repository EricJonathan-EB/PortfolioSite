import { useState, useEffect, useRef } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import gsap from 'gsap'
import { colors } from '../styles/theme'

import experienceData   from '../data/experience.json'
import publicationsData from '../data/publications.json'
import hackathonsData   from '../data/hackathons.json'
import projectsData     from '../data/projects.json'

const normalProjects = projectsData.filter(p => p.statusType !== 'review')
const reviewProjects = projectsData.filter(p => p.statusType === 'review')
const hasReviewVault = reviewProjects.length > 0

const SECTIONS = [
  {
    id:           'experience',
    label:        'Experience',
    accent:       colors.pink,
    items:        experienceData.map(e => ({
      id:      e.id,
      label:   e.company,
      sub:     e.role,
      edition: e.id.toUpperCase(),
    })),
    holdFraction: 0.85,
    inFraction:   0.15,
  },
  {
    id:           'published',
    label:        'Published',
    accent:       colors.amber,
    items:        publicationsData.map(p => ({
      id:      p.id,
      label:   p.venue,
      sub:     p.type,
      edition: p.id.toUpperCase(),
    })),
    holdFraction: 0.75,
    inFraction:   0.35,
  },
  {
    id:           'hackathons',
    label:        'Hackathons',
    accent:       colors.violet,
    items:        hackathonsData.map(h => ({
      id:      h.id,
      label:   h.name,
      sub:     h.result,
      edition: h.edition,
    })),
    holdFraction: 0.75,
    inFraction:   0.35,
  },
  {
    id:           'projects',
    label:        'Projects',
    accent:       colors.cyan,
    items:        [
      ...normalProjects.map(p => ({
        id:         p.id,
        label:      p.name,
        sub:        p.type,
        edition:    p.id.toUpperCase(),
        statusType: p.statusType,
      })),
      ...(hasReviewVault ? [{
        id:         'vault',
        label:      'Under Review',
        sub:        `${reviewProjects.length} Projects`,
        edition:    'R&D',
        statusType: 'review',
      }] : []),
    ],
    holdFraction: 0.75,
    inFraction:   0.35,
  },
]

function getActiveCardIndex(p, numItems, holdFraction) {
  if (p < 0.10) return -1
  const WINDOW = 0.80 / numItems
  for (let i = numItems - 1; i >= 0; i--) {
    if (p >= 0.10 + i * WINDOW - 0.01) return i
  }
  return -1
}

function scrollToCard(sectionId, cardIdx, numItems, holdFraction) {
  const st = ScrollTrigger.getAll().find(t => t.trigger?.id === sectionId && t.vars.pin)
  if (!st) return
  const WINDOW  = 0.80 / numItems
  const holdMid = 0.10 + cardIdx * WINDOW + WINDOW * holdFraction * 0.5
  const targetY = st.start + (st.end - st.start) * holdMid
  const proxy   = { y: window.scrollY }
  const tween   = gsap.to(proxy, {
    y: targetY, duration: 3, ease: 'power3.inOut',
    onUpdate: () => window.scrollTo(0, proxy.y),
  })
  const kill = () => tween.kill()
  window.addEventListener('wheel',      kill, { once: true })
  window.addEventListener('touchstart', kill, { once: true })
}

function getActiveSectionId() {
  const scrollY = window.scrollY
  let current   = null
  for (const { id } of SECTIONS) {
    const st = ScrollTrigger.getAll().find(t => t.trigger?.id === id && t.vars.pin)
    if (st && scrollY >= st.start - 100 && scrollY <= st.end + 100) current = id
  }
  return current
}

const STATUS_COLOR = {
  review:    colors.cyan,
  dev:       '#ffaa00',
  patent:    colors.amber,
  published: '#00ffa0',
  done:      'rgba(255,255,255,0.3)',
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function SideNav() {
  const [activeSectionId, setActiveSectionId] = useState(null)
  const [activeCardIdx,   setActiveCardIdx]   = useState(-1)
  const [mounted,         setMounted]         = useState(false)
  const rafRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 600)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        const secId = getActiveSectionId()
        setActiveSectionId(secId)
        if (!secId) { setActiveCardIdx(-1); return }
        const section = SECTIONS.find(s => s.id === secId)
        if (!section) return
        const st = ScrollTrigger.getAll().find(t => t.trigger?.id === secId && t.vars.pin)
        if (!st) return
        const p = (window.scrollY - st.start) / (st.end - st.start)
        setActiveCardIdx(getActiveCardIndex(
          Math.max(0, Math.min(1, p)),
          section.items.length,
          section.holdFraction,
        ))
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [mounted])

  const visible = !!activeSectionId

  return (
    <div
      className="fixed z-[9000] select-none"
      style={{
        right:         '18px',
        top:           '50%',
        transform:     'translateY(-50%)',
        pointerEvents: visible ? 'auto' : 'none',
        opacity:       visible ? 1 : 0,
        transition:    'opacity 0.5s ease',
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'flex-end',
        gap:           '10px',
      }}
    >
      {SECTIONS.map((section) => {
        const isActive = activeSectionId === section.id
        return isActive ? (
          // ── ACTIVE section — full card list ───────────────────────────────
          <ActiveSection
            key={section.id}
            section={section}
            activeCardIdx={activeCardIdx}
            onCardClick={(idx) =>
              scrollToCard(section.id, idx, section.items.length, section.holdFraction)
            }
          />
        ) : (
          // ── INACTIVE section — single ghost dot only ───────────────────────
          <GhostDot key={section.id} accent={section.accent} label={section.label} />
        )
      })}
    </div>
  )
}

// ─── Active section: header pill + full card list ─────────────────────────────
function ActiveSection({ section, activeCardIdx, onCardClick }) {
  const [hovered, setHovered] = useState(null)
  const { accent, label, items } = section

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>

      {/* Section header pill */}
      <div
        style={{
          display:        'flex',
          alignItems:     'center',
          gap:            '8px',
          padding:        '4px 12px 4px 14px',
          borderRadius:   '100px',
          background:     `linear-gradient(90deg, ${accent}28, ${accent}48)`,
          border:         `1px solid ${accent}60`,
          backdropFilter: 'blur(14px)',
          boxShadow:      `0 0 20px ${accent}18`,
        }}
      >
        {/* Pulsing dot */}
        <span
          style={{
            width:        '6px',
            height:       '6px',
            borderRadius: '50%',
            background:   accent,
            boxShadow:    `0 0 10px ${accent}, 0 0 20px ${accent}66`,
            flexShrink:   0,
            animation:    'sidenav-pulse 2s ease-in-out infinite',
          }}
        />
        <span
          style={{
            fontSize:      '9px',
            fontWeight:    800,
            letterSpacing: '3.5px',
            textTransform: 'uppercase',
            color:         accent,
            whiteSpace:    'nowrap',
          }}
        >
          {label}
        </span>
      </div>

      {/* Card list */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
        {items.map((item, idx) => {
          const isCardActive = idx === activeCardIdx
          const isHovered    = hovered === idx
          const statusColor  = STATUS_COLOR[item.statusType] ?? 'rgba(255,255,255,0.25)'

          return (
            <button
              key={item.id}
              onClick={() => onCardClick(idx)}
              onMouseEnter={() => setHovered(idx)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display:        'flex',
                alignItems:     'center',
                gap:            '10px',
                padding:        '6px 10px 6px 14px',
                borderRadius:   '8px',
                background:     isCardActive
                  ? `linear-gradient(90deg, ${accent}1a, ${accent}35)`
                  : isHovered
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(255,255,255,0.025)',
                border:         `1px solid ${
                  isCardActive
                    ? accent + '55'
                    : isHovered
                      ? 'rgba(255,255,255,0.12)'
                      : 'rgba(255,255,255,0.05)'
                }`,
                backdropFilter: 'blur(10px)',
                boxShadow:      isCardActive ? `0 0 18px ${accent}18` : 'none',
                cursor:         'pointer',
                outline:        'none',
                transition:     'all 0.2s ease',
                width:          '192px',
                textAlign:      'left',
                position:       'relative',
                overflow:       'hidden',
              }}
            >
              {/* Left accent bar */}
              <span style={{
                position:     'absolute',
                left:         0,
                top:          '4px',
                bottom:       '4px',
                width:        '2px',
                borderRadius: '2px',
                background:   isCardActive
                  ? accent
                  : isHovered ? accent + '55' : 'transparent',
                boxShadow:    isCardActive ? `0 0 8px ${accent}` : 'none',
                transition:   'all 0.2s ease',
              }} />

              {/* Edition badge */}
              <span style={{
                fontSize:           '7px',
                fontWeight:         900,
                letterSpacing:      '1.5px',
                textTransform:      'uppercase',
                color:              isCardActive ? accent : 'rgba(240,237,232,0.22)',
                fontVariantNumeric: 'tabular-nums',
                minWidth:           '28px',
                transition:         'color 0.2s ease',
                lineHeight:         1,
              }}>
                {item.edition}
              </span>

              {/* Label + sub */}
              <span style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 }}>
                <span style={{
                  fontSize:     '10px',
                  fontWeight:   isCardActive ? 700 : 500,
                  color:        isCardActive
                    ? 'rgba(240,237,232,0.96)'
                    : isHovered
                      ? 'rgba(240,237,232,0.70)'
                      : 'rgba(240,237,232,0.38)',
                  whiteSpace:   'nowrap',
                  overflow:     'hidden',
                  textOverflow: 'ellipsis',
                  letterSpacing:'0.2px',
                  transition:   'all 0.2s ease',
                }}>
                  {item.label}
                </span>
                <span style={{
                  fontSize:     '8px',
                  fontWeight:   400,
                  color:        isCardActive ? accent + 'bb' : 'rgba(240,237,232,0.20)',
                  whiteSpace:   'nowrap',
                  overflow:     'hidden',
                  textOverflow: 'ellipsis',
                  letterSpacing:'0.3px',
                  transition:   'color 0.2s ease',
                }}>
                  {item.sub}
                </span>
              </span>

              {/* Status dot */}
              <span style={{
                width:        '5px',
                height:       '5px',
                borderRadius: '50%',
                flexShrink:   0,
                background:   isCardActive
                  ? (item.statusType ? statusColor : accent)
                  : 'rgba(255,255,255,0.10)',
                boxShadow:    isCardActive
                  ? `0 0 6px ${item.statusType ? statusColor : accent}`
                  : 'none',
                transition:   'all 0.2s ease',
              }} />
            </button>
          )
        })}
      </div>

      {/* Bottom glow line */}
      <div style={{
        width:      '100%',
        height:     '1px',
        marginTop:  '2px',
        background: `linear-gradient(90deg, transparent, ${accent}44, transparent)`,
      }} />

      <style>{`
        @keyframes sidenav-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.55; transform: scale(0.75); }
        }
      `}</style>
    </div>
  )
}

// ─── Inactive section — just a glowing dot with a tooltip label ───────────────
function GhostDot({ accent, label }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      style={{
        display:    'flex',
        alignItems: 'center',
        gap:        '8px',
        padding:    '4px 2px',
        cursor:     'default',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Label — slides in on hover, read-only */}
      <span style={{
        fontSize:      '8px',
        fontWeight:    600,
        letterSpacing: '2.5px',
        textTransform: 'uppercase',
        color:         'rgba(240,237,232,0.20)',
        whiteSpace:    'nowrap',
        opacity:       hovered ? 1 : 0,
        transform:     hovered ? 'translateX(0)' : 'translateX(6px)',
        transition:    'opacity 0.2s ease, transform 0.2s ease',
        pointerEvents: 'none',
      }}>
        {label}
      </span>
      {/* Dot */}
      <span style={{
        width:        '5px',
        height:       '5px',
        borderRadius: '50%',
        flexShrink:   0,
        background:   hovered ? accent + '66' : 'rgba(255,255,255,0.12)',
        boxShadow:    hovered ? `0 0 8px ${accent}44` : 'none',
        transition:   'all 0.25s ease',
      }} />
    </div>
  )
}