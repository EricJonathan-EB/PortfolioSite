import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { colors, gradients } from '../styles/theme'

// ─── Contact Data ─────────────────────────────────────────
const contactItems = [
  {
    id: 'phone',
    label: 'CALL ME',
    value: '+91 96005 31672',
    href: 'tel:+919600531672',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 0143.07 1.18 2 2 0 016 3.09v3a2 2 0 01-1.45 1.93 16 16 0 00-5 2.91 16 16 0 015 7.07A2 2 0 0122 16.92z"/>
        <path d="M14.05 2a9 9 0 018 7.94M14.05 6A5 5 0 0118 10"/>
      </svg>
    ),
  },
  {
    id: 'email',
    label: 'EMAIL ME',
    value: 'ericjonathan.eb@gmail.com',
    href: 'mailto:ericjonathan.eb@gmail.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <path d="M2 7l10 7 10-7"/>
      </svg>
    ),
  },
]

const socialLinks = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    sub: '/in/ericjonathan-eb',
    href: 'https://www.linkedin.com/in/ericjonathan-eb/',
    accent: colors.cyan,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
    ),
  },
  {
    id: 'unstop',
    name: 'Unstop',
    sub: 'u/ericjon30170',
    href: 'https://unstop.com/u/ericjon30170',
    accent: colors.pink,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
  },
  {
    id: 'github',
    name: 'GitHub',
    sub: '@EricJonathan-EB',
    href: 'https://github.com/EricJonathan-EB',
    accent: colors.violet,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
      </svg>
    ),
  },
]

// ─── Contact Form Config ────────────────────────────────────
const ratingOptions = ['1', '2', '3', '4', '5']

const inquiryOptions = [
  { value: '', label: 'Select one' },
  { value: 'full-time',   label: 'Full-time role' },
  { value: 'internship',  label: 'Internship' },
  { value: 'freelance',   label: 'Freelance / Contract' },
  { value: 'collab',      label: 'Project collaboration' },
  { value: 'other',       label: 'Something else' },
]

const roleOptions = [
  { value: '',           label: 'Select one' },
  { value: 'recruiter',  label: 'Recruiter / Hiring Manager' },
  { value: 'founder',    label: 'Founder / Startup' },
  { value: 'developer',  label: 'Fellow Developer' },
  { value: 'other',      label: 'Other' },
]

const initialFormState = {
  formType:     'feedback',
  name:         '',
  email:        '',
  rating:       '',
  siteFeedback: '',
  suggestions:  '',
  company:      '',
  role:         '',
  inquiryType:  '',
  message:      '',
  website:      '',
}

// ─── Ease Helper ──────────────────────────────────────────
const easeOut = (t) => 1 - Math.pow(1 - t, 4)

// ─── Scroll Engine ────────────────────────────────────────
const computeState = (p) => {
  let titleOpacity = 0, titleScale = 15, titleY = 0, titleBlur = 0
  if (p <= 0.15) {
    const rawProgress = p / 0.15
    const t      = easeOut(rawProgress)
    titleOpacity = t
    titleScale   = 15 - 14 * t
    titleY       = -22 * t
    titleBlur    = 0
  } else {
    titleScale = 1
    titleY     = -22
    const tr     = Math.min(1, (p - 0.15) / 0.15)
    titleBlur    = tr * 14
    titleOpacity = 1 - tr * 0.72
  }

  // ── Pop-out Slide Animation from Either Side ──
  let blockOpacity = 0, cardLeftX = -200, cardRightX = 200
  if (p > 0.25) {
    const rawProgress = Math.min(1, (p - 0.25) / 0.15)
    const t      = easeOut(rawProgress)
    blockOpacity = t
    cardLeftX    = -200 * (1 - t)
    cardRightX   = 200 * (1 - t)
  }

  let arrowOpacity = 0
  if (p > 0.68) {
      arrowOpacity = Math.min(1, (p - 0.68) / 0.07)
  }

  return { titleOpacity, titleScale, titleY, titleBlur, blockOpacity, cardLeftX, cardRightX, arrowOpacity }
}

// ─── Validation Logic ────────────────────────────────────
const validateFormConfig = (key, value, formType) => {
  if (key === 'name') {
    if (!value.trim()) return 'Required'
    if (!/^[A-Za-z\s]{2,}$/.test(value)) return 'Letters only (min 2)'
  }
  if (key === 'email') {
    if (!value.trim()) return 'Required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email'
  }
  if (key === 'siteFeedback' && formType === 'feedback') {
    if (!value.trim()) return 'Required'
  }
  if (key === 'message' && formType === 'collab') {
    if (!value.trim()) return 'Required'
  }
  return ''
}

// ─── Component ───────────────────────────────────────────
const Socials = () => {
  const sectionRef   = useRef(null)
  const bgTitleRef   = useRef(null)
  const backlightRef = useRef(null)
  const blockRef     = useRef(null)
  const cardLeftRef  = useRef(null)
  const cardRightRef = useRef(null)
  const arrowRef     = useRef(null)
  const stRef        = useRef(null)

  const [form, setForm]           = useState(initialFormState)
  const [errors, setErrors]       = useState({})
  const [touched, setTouched]     = useState({})
  const [status, setStatus]       = useState('idle')
  const [errorMsg, setErrorMsg]   = useState('')

  // ─── Live Validation Handlers ───
  const updateField = (key, rawValue) => {
    let value = rawValue
    
    // Live Input Formatters
    if (key === 'name') {
      value = value.replace(/[^a-zA-Z\s]/g, '')
    }

    setForm(prev => ({ ...prev, [key]: value }))
    
    const error = validateFormConfig(key, value, form.formType)
    setErrors(prev => ({ ...prev, [key]: error }))
  }

  const handleBlurField = (key) => {
    setTouched(prev => ({ ...prev, [key]: true }))
    const error = validateFormConfig(key, form[key], form.formType)
    setErrors(prev => ({ ...prev, [key]: error }))
  }

  const switchFormType = (type) => {
    if (type === form.formType) return
    setForm(prev => ({ ...initialFormState, formType: type, name: prev.name, email: prev.email }))
    setErrors({})
    setTouched({})
    setStatus('idle')
    setErrorMsg('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')

    const fieldsToValidate = form.formType === 'feedback' 
      ? ['name', 'email', 'siteFeedback'] 
      : ['name', 'email', 'message']
    
    let hasErrors = false
    const newErrors = {}
    const newTouched = {}

    fieldsToValidate.forEach(key => {
      newTouched[key] = true
      const err = validateFormConfig(key, form[key], form.formType)
      if (err) {
        newErrors[key] = err
        hasErrors = true
      }
    })

    if (hasErrors) {
      setErrors(prev => ({ ...prev, ...newErrors }))
      setTouched(prev => ({ ...prev, ...newTouched }))
      setStatus('idle')
      setErrorMsg('Please fix the highlighted fields.')
      return
    }

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Something went wrong. Please try again.')
      setStatus('sent')
      setForm(prev => ({ ...initialFormState, formType: prev.formType }))
      setTouched({})
      setErrors({})
    } catch (err) {
      setStatus('error')
      setErrorMsg(err.message || 'Something went wrong. Please try again.')
    }
  }

  const handleBackToTop = () => {
    const proxy = { y: window.scrollY }
    const tween = gsap.to(proxy, {
      y: 0, duration: 2.5, ease: 'power4.inOut',
      onUpdate: () => window.scrollTo(0, proxy.y),
    })
    const kill = () => tween.kill()
    window.addEventListener('wheel',      kill, { once: true })
    window.addEventListener('touchstart', kill, { once: true })
  }

  useEffect(() => {
    gsap.set(bgTitleRef.current,   { opacity: 0, scale: 15, transformOrigin: '50% 50%', filter: 'blur(0px)' })
    gsap.set(backlightRef.current, { opacity: 0 })
    gsap.set(blockRef.current,     { opacity: 0 })
    gsap.set(cardLeftRef.current,  { x: -200 })
    gsap.set(cardRightRef.current, { x: 200 })
    gsap.set(arrowRef.current,     { opacity: 0 })

    gsap.to(backlightRef.current, {
      opacity: 1, duration: 1.8, ease: 'power3.out',
      scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' },
    })

    stRef.current = ScrollTrigger.create({
      trigger: sectionRef.current,
      start:  'top top',
      end:    '+=3200',
      pin:    true,
      scrub:  0.8,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const s = computeState(self.progress)
        gsap.set(bgTitleRef.current, {
          opacity: s.titleOpacity, scale: s.titleScale,
          y: `${s.titleY}vh`, filter: `blur(${s.titleBlur}px)`,
          transformOrigin: '50% 50%',
        })
        gsap.set(blockRef.current, { opacity: s.blockOpacity })
        gsap.set(cardLeftRef.current, { x: s.cardLeftX })
        gsap.set(cardRightRef.current, { x: s.cardRightX })
        
        gsap.set(arrowRef.current, {
          opacity: s.arrowOpacity,
          pointerEvents: s.arrowOpacity > 0.5 ? 'auto' : 'none',
        })
      },
    })

    return () => stRef.current?.kill()
  }, [])

  // ── CRT Scanline Overlay ──
  const crtOverlay = (
    <div
      className="absolute inset-0 pointer-events-none opacity-20 z-0"
      style={{
        background: `linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%)`,
        backgroundSize: '100% 4px',
      }}
    />
  )

  const cardBaseStyles = {
    background: 'rgba(8,8,20,0.85)',
    border: `1px solid rgba(255,255,255,0.07)`,
    borderRadius: '4px',
    backdropFilter: 'blur(32px)',
    boxShadow: `0 20px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.04)`,
  }

  return (
    <section
      id="socials"
      ref={sectionRef}
      className="relative w-full min-h-screen overflow-hidden flex items-center justify-center"
      style={{ background: gradients.bg }}
    >
      {/* ── Dynamic Keyframe Injection ── */}
      <style>{`
        @keyframes crtGlitch {
          0% { transform: translate(0) skewX(0); filter: none; opacity: 1; }
          15% { transform: translate(-3px, 1px) skewX(-2deg); filter: drop-shadow(-3px 0 ${colors.pink}) drop-shadow(3px 0 ${colors.cyan}); opacity: 0.8; }
          30% { transform: translate(3px, -1px) skewX(2deg); filter: drop-shadow(3px 0 ${colors.pink}) drop-shadow(-3px 0 ${colors.cyan}); opacity: 0.9; }
          45% { transform: translate(-1px, 2px) skewX(-1deg); filter: drop-shadow(-2px 0 ${colors.pink}) drop-shadow(2px 0 ${colors.cyan}); opacity: 0.7; }
          60% { transform: translate(2px, -2px) skewX(1deg); filter: drop-shadow(2px 0 ${colors.pink}) drop-shadow(-2px 0 ${colors.cyan}); opacity: 1; }
          75% { transform: translate(-1px, 1px) skewX(0); filter: drop-shadow(-1px 0 ${colors.pink}) drop-shadow(1px 0 ${colors.cyan}); }
          100% { transform: translate(0) skewX(0); filter: none; opacity: 1; }
        }
        .crt-glitch-wrapper {
          animation: crtGlitch 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
        }
      `}</style>

      {/* ── Ambient backlight bloom ── */}
      <div
        ref={backlightRef}
        className="absolute pointer-events-none z-[4]"
        style={{
          width: '900px', height: '900px',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          background: `radial-gradient(ellipse at 50% 55%, rgba(255,60,110,0.13) 0%, rgba(0,245,255,0.07) 45%, transparent 70%)`,
          filter: 'blur(120px)',
        }}
      />

      {/* ── 15× Zooming BG title ── */}
      <div
        ref={bgTitleRef}
        className="absolute pointer-events-none select-none text-center w-full z-[5]"
        style={{
          top: '50%', marginTop: '-70px',
          fontSize: 'min(16vw, 150px)', fontWeight: 900, fontStyle: 'italic',
          color: 'transparent',
          WebkitTextStroke: `2px ${colors.pink}`,
          textShadow: `0 0 100px ${colors.pink}44, 0 0 200px ${colors.pink}22`,
          letterSpacing: '-3px', textTransform: 'uppercase',
          whiteSpace: 'nowrap', lineHeight: 0.85,
        }}
      >
        LET'S CONNECT
      </div>

      {/* ── Section label ── */}
      <div className="absolute top-10 left-10 z-[50] flex items-center gap-4 pointer-events-none">
        <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: colors.pink }}>06</span>
        <div style={{ width: '32px', height: '1px', background: `linear-gradient(90deg,${colors.pink},${colors.cyan})` }} />
        <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: colors.textDim }}>Socials</span>
      </div>

      {/* ─────────────────────────────────────────────────────────
          GLOBAL OPACITY WRAPPER
      ───────────────────────────────────────────────────────────── */}
      <div ref={blockRef} className="relative z-[20] w-full max-w-[1024px] px-6 lg:px-8 flex flex-col justify-center">
        
        {/* TWO-COLUMN GRID FOR CARDS */}
        <div className="flex flex-col lg:flex-row gap-5 w-full items-stretch">
          
          {/* ─────────────────────────────────────────────────────────
              CARD 1: INFO & SOCIALS (Sliding left to right)
          ───────────────────────────────────────────────────────────── */}
          <div ref={cardLeftRef} className="flex-1 relative overflow-hidden flex flex-col" style={{ ...cardBaseStyles, boxShadow: `0 0 0 1px rgba(255,60,110,0.15), 0 30px 80px rgba(0,0,0,0.7)` }}>
            {crtOverlay}
            <div className="absolute top-0 left-0 w-full z-10" style={{ height: '3px', background: `linear-gradient(90deg, ${colors.pink} 0%, ${colors.violet} 100%)`, boxShadow: `0 0 15px ${colors.pink}` }} />
            
            {['top-0 left-0 border-t-2 border-l-2', 'top-0 right-0 border-t-2 border-r-2', 'bottom-0 left-0 border-b-2 border-l-2', 'bottom-0 right-0 border-b-2 border-r-2'].map((cls, i) => (
              <div key={i} className={`absolute w-4 h-4 pointer-events-none z-10 ${cls}`} style={{ borderColor: `${colors.pink}60` }} />
            ))}

            <div className="p-6 md:p-8 flex-grow relative z-10 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-3">
                <div style={{ width: '24px', height: '1px', background: colors.pink, boxShadow: `0 0 8px ${colors.pink}` }} />
                <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '5px', textTransform: 'uppercase', color: colors.pink, textShadow: `0 0 10px ${colors.pink}80` }}>What's Next</span>
              </div>

              <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 900, fontStyle: 'italic', letterSpacing: '-1px', lineHeight: 1.05, color: colors.textPrimary, marginBottom: '8px' }}>
                Let's Build Something <br/>
                <span style={{ backgroundImage: `linear-gradient(100deg, ${colors.pink} 0%, ${colors.violet} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: `0 0 30px ${colors.pink}40` }}>Extraordinary.</span>
              </h2>

              <p style={{ fontSize: '13px', fontWeight: 400, color: colors.textSecondary, lineHeight: 1.5, marginBottom: '20px' }}>
                Open to roles and collaborations in Data Science, Machine Learning &amp; Software Engineering. Reach out — I respond fast.
              </p>

              <div className="flex flex-col gap-2 mb-5">
                {contactItems.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    className="group flex items-center gap-3 px-4 py-3 transition-all duration-200"
                    style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid rgba(255,255,255,0.07)`, borderRadius: '3px', textDecoration: 'none' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = `rgba(255,60,110,0.07)`
                      e.currentTarget.style.borderColor = `${colors.pink}70`
                      e.currentTarget.style.boxShadow = `0 0 20px rgba(255,60,110,0.12), inset 0 0 20px rgba(255,60,110,0.04)`
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <div className="flex-shrink-0 flex items-center justify-center drop-shadow-[0_0_8px_rgba(255,60,110,0.8)]" style={{ width: '32px', height: '32px', color: colors.pink }}>
                      <div className="w-4 h-4">{item.icon}</div>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span style={{ fontSize: '8px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: colors.pink, marginBottom: '2px' }}>{item.label}</span>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: colors.textPrimary, letterSpacing: '0.3px' }} className="truncate">{item.value}</span>
                    </div>
                  </a>
                ))}
              </div>

              <div className="flex flex-col gap-2 mt-auto">
                {socialLinks.map((s) => (
                  <a
                    key={s.id}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-3 px-4 py-2.5 transition-all duration-200"
                    style={{ background: 'rgba(255,255,255,0.025)', border: `1px solid rgba(255,255,255,0.07)`, borderRadius: '3px', textDecoration: 'none' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = `${s.accent}12`
                      e.currentTarget.style.borderColor = `${s.accent}70`
                      e.currentTarget.style.boxShadow = `0 0 24px ${s.accent}18, inset 0 0 24px ${s.accent}06`
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.025)'
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                      e.currentTarget.style.boxShadow = 'none'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    <div style={{ width: '16px', height: '16px', color: s.accent, flexShrink: 0, filter: `drop-shadow(0 0 5px ${s.accent})` }}>{s.icon}</div>
                    <div className="flex flex-col">
                      <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: colors.textPrimary }}>{s.name}</span>
                      <span style={{ fontSize: '9px', fontWeight: 500, color: colors.textDim, letterSpacing: '0.3px' }}>{s.sub}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────
              CARD 2: CONTACT FORMS (Sliding right to left)
          ───────────────────────────────────────────────────────────── */}
          <div ref={cardRightRef} className="flex-1 relative overflow-hidden flex flex-col" style={{ ...cardBaseStyles, boxShadow: `0 0 0 1px rgba(0,245,255,0.15), 0 30px 80px rgba(0,0,0,0.7)` }}>
            {crtOverlay}
            <div className="absolute top-0 left-0 w-full z-10" style={{ height: '3px', background: `linear-gradient(90deg, ${colors.cyan} 0%, ${colors.violet} 100%)`, boxShadow: `0 0 15px ${colors.cyan}` }} />
            
            {['top-0 left-0 border-t-2 border-l-2', 'top-0 right-0 border-t-2 border-r-2', 'bottom-0 left-0 border-b-2 border-l-2', 'bottom-0 right-0 border-b-2 border-r-2'].map((cls, i) => (
              <div key={i} className={`absolute w-4 h-4 pointer-events-none z-10 ${cls}`} style={{ borderColor: `${colors.cyan}60` }} />
            ))}

            <div className="p-6 md:p-8 flex-grow relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div style={{ width: '24px', height: '1px', background: colors.cyan, boxShadow: `0 0 8px ${colors.cyan}` }} />
                <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '5px', textTransform: 'uppercase', color: colors.cyan, textShadow: `0 0 10px ${colors.cyan}80` }}>Drop A Line</span>
              </div>

              {/* Form Tab Toggle */}
              <div className="inline-flex p-1 mb-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '3px' }}>
                {[
                  { id: 'feedback', label: 'Peer Feedback' },
                  { id: 'collab',   label: 'Work / Collab'  },
                ].map(tab => {
                  const isActive = form.formType === tab.id
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => switchFormType(tab.id)}
                      className="px-3 py-1.5 transition-all duration-200"
                      style={{
                        borderRadius: '2px',
                        fontSize: '10px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase',
                        background: isActive ? `linear-gradient(100deg, ${colors.cyan}, ${colors.violet})` : 'transparent',
                        color: isActive ? colors.bgBase : colors.textDim,
                        boxShadow: isActive ? `0 0 10px ${colors.cyan}50` : 'none'
                      }}
                    >
                      {tab.label}
                    </button>
                  )
                })}
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col" noValidate>
                <input type="text" name="website" value={form.website} onChange={e => updateField('website', e.target.value)} tabIndex={-1} autoComplete="off" style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }} />
                
                {/* ── Wraps form fields in Glitch Wrapper connected to the Form Type Key ── */}
                <div key={form.formType} className="crt-glitch-wrapper flex flex-col w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                    <FieldInput 
                      label="Your Name" value={form.name} required
                      onChange={v => updateField('name', v)} 
                      onBlur={() => handleBlurField('name')} 
                      error={errors.name} touched={touched.name} placeholder="John Doe" 
                    />
                    <FieldInput 
                      label="Your Email" type="email" value={form.email} required
                      onChange={v => updateField('email', v)} 
                      onBlur={() => handleBlurField('email')}
                      error={errors.email} touched={touched.email} placeholder="john@email.com" 
                    />
                  </div>

                  {form.formType === 'feedback' ? (
                    <>
                      <div className="mb-2">
                        <label style={{ fontSize: '8px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: colors.textDim, marginBottom: '6px', display: 'block' }}>Rate The Site</label>
                        <div className="flex gap-2">
                          {ratingOptions.map(r => {
                            const isActive = form.rating === r
                            return (
                              <button
                                key={r}
                                type="button"
                                onClick={() => updateField('rating', r)}
                                className="flex items-center justify-center transition-all duration-200"
                                style={{
                                  width: '32px', height: '32px', borderRadius: '3px',
                                  border: `1px solid ${isActive ? colors.cyan : 'rgba(255,255,255,0.07)'}`,
                                  background: isActive ? `${colors.cyan}18` : 'rgba(255,255,255,0.02)',
                                  color: isActive ? colors.cyan : colors.textSecondary,
                                  fontSize: '12px', fontWeight: 700,
                                  boxShadow: isActive ? `0 0 16px ${colors.cyan}30` : 'none',
                                }}
                              >{r}</button>
                            )
                          })}
                        </div>
                      </div>
                      <FieldTextarea 
                        label="What Do You Think?" value={form.siteFeedback} required rows={2}
                        onChange={v => updateField('siteFeedback', v)} 
                        onBlur={() => handleBlurField('siteFeedback')}
                        error={errors.siteFeedback} touched={touched.siteFeedback} 
                        placeholder="Thoughts on my portfolio, the design, UX, performance, content." 
                      />
                      <FieldTextarea 
                        label="Suggestions (Optional)" value={form.suggestions} rows={1}
                        onChange={v => updateField('suggestions', v)} 
                        placeholder="Anything you'd change or add?" 
                      />
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                        <FieldInput label="Company / Org" value={form.company} onChange={v => updateField('company', v)} placeholder="EVA Inc." />
                        <FieldSelect label="Reaching Out As" value={form.role} onChange={v => updateField('role', v)} options={roleOptions} />
                      </div>
                      <FieldSelect label="What's This About" value={form.inquiryType} onChange={v => updateField('inquiryType', v)} options={inquiryOptions} />
                      <FieldTextarea 
                        label="Message" value={form.message} required rows={3}
                        onChange={v => updateField('message', v)} 
                        onBlur={() => handleBlurField('message')}
                        error={errors.message} touched={touched.message} 
                        placeholder="Tell me about the role, project, or what you have in mind." 
                      />
                    </>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4">
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="px-6 py-2.5 transition-all duration-200"
                    style={{
                      borderRadius: '3px',
                      fontSize: '10px', fontWeight: 900, letterSpacing: '2px', textTransform: 'uppercase',
                      background: status === 'sending' ? 'rgba(255,255,255,0.08)' : `linear-gradient(100deg, ${colors.cyan} 0%, ${colors.violet} 100%)`,
                      color: colors.bgBase,
                      border: 'none',
                      cursor: status === 'sending' ? 'not-allowed' : 'pointer',
                      boxShadow: status === 'sending' ? 'none' : `0 0 24px ${colors.cyan}40`,
                      opacity: status === 'sending' ? 0.6 : 1,
                    }}
                  >
                    {status === 'sending' ? 'Sending…' : form.formType === 'feedback' ? 'Send Feedback' : 'Send Message'}
                  </button>

                  {status === 'sent' && <span style={{ fontSize: '10px', fontWeight: 700, color: colors.cyan, letterSpacing: '0.5px' }}>✓ Got it — thanks!</span>}
                  {status === 'idle' && errorMsg && <span style={{ fontSize: '10px', fontWeight: 700, color: colors.pink, letterSpacing: '0.5px' }}>{errorMsg}</span>}
                  {status === 'error' && <span style={{ fontSize: '10px', fontWeight: 700, color: colors.pink, letterSpacing: '0.5px' }}>{errorMsg || 'Something went wrong.'}</span>}
                </div>
              </form>
            </div>
          </div>
        </div>
        
        {/* ─────────────────────────────────────────────────────────
            FOOTER: SEPARATED AND AT THE VERY END
        ───────────────────────────────────────────────────────────── */}
        <div className="mt-4 pt-3 flex flex-col md:flex-row items-center justify-between gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: colors.textDim }}>
            © {new Date().getFullYear()} Eric Jonathan E.
          </span>
          <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: colors.textDim }}>
            React · GSAP · Tailwind
          </span>
        </div>

      </div>

      {/* ── Back to top ── */}
      <div ref={arrowRef} onClick={handleBackToTop} className="absolute bottom-6 w-full flex flex-col items-center gap-1 z-[100] cursor-pointer group pointer-events-none">
        <span style={{ fontSize: '8px', fontWeight: 800, letterSpacing: '4px', textTransform: 'uppercase', color: colors.textDim }} className="group-hover:text-white transition-colors duration-300">
          Back to Top
        </span>
        <div className="pointer-events-auto animate-bounce rounded-full p-2.5 bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/30 group-hover:scale-110 transition-all duration-300 backdrop-blur-md">
          <svg className="w-5 h-5 text-white/50 group-hover:text-white transition-colors duration-300 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      </div>
    </section>
  )
}

// ─── Shared Custom Input Chrome ──────
const fieldLabelStyle = {
  fontSize: '8px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase',
  color: colors.textDim, marginBottom: '6px', display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 10
}

const FieldInput = ({ label, value, onChange, onBlur, placeholder, type = 'text', required = false, error, touched }) => {
  const [isFocused, setIsFocused] = useState(false)
  const isInvalid = touched && error
  const isValid = touched && !error && value && value.trim() !== ''

  let borderColor = 'rgba(255,255,255,0.07)'
  let boxShadow = 'none'
  let bg = 'rgba(255,255,255,0.02)'

  if (isFocused) {
    borderColor = `${colors.cyan}70`
    boxShadow = `0 0 0 3px ${colors.cyan}12`
    bg = `rgba(0,245,255,0.03)`
  } else if (isInvalid) {
    borderColor = colors.pink
    boxShadow = `0 0 0 1px ${colors.pink}40`
    bg = `rgba(255,60,110,0.03)`
  } else if (isValid) {
    borderColor = 'rgba(0,255,150,0.4)'
  }

  return (
    <div className="mb-2 relative w-full">
      <label style={fieldLabelStyle}>
        <span>{label}{required && <span style={{ color: colors.cyan }}> *</span>}</span>
        {isInvalid && <span style={{ color: colors.pink, textTransform: 'none', letterSpacing: '0.5px' }}>{error}</span>}
      </label>
      <input 
        type={type} value={value} 
        onChange={e => onChange(e.target.value)} 
        onBlur={() => { setIsFocused(false); if (onBlur) onBlur() }} 
        onFocus={() => setIsFocused(true)}
        placeholder={placeholder} required={required} 
        style={{ width: '100%', borderRadius: '3px', color: colors.textPrimary, fontSize: '12px', fontWeight: 500, padding: '8px 12px', outline: 'none', fontFamily: 'inherit', transition: 'all 0.2s ease', zIndex: 10, position: 'relative', background: bg, border: `1px solid ${borderColor}`, boxShadow }} 
      />
    </div>
  )
}

const FieldTextarea = ({ label, value, onChange, onBlur, placeholder, required = false, rows = 3, error, touched }) => {
  const [isFocused, setIsFocused] = useState(false)
  const isInvalid = touched && error
  const isValid = touched && !error && value && value.trim() !== ''

  let borderColor = 'rgba(255,255,255,0.07)'
  let boxShadow = 'none'
  let bg = 'rgba(255,255,255,0.02)'

  if (isFocused) {
    borderColor = `${colors.cyan}70`
    boxShadow = `0 0 0 3px ${colors.cyan}12`
    bg = `rgba(0,245,255,0.03)`
  } else if (isInvalid) {
    borderColor = colors.pink
    boxShadow = `0 0 0 1px ${colors.pink}40`
    bg = `rgba(255,60,110,0.03)`
  } else if (isValid) {
    borderColor = 'rgba(0,255,150,0.4)'
  }

  return (
    <div className="mb-2 relative w-full">
      <label style={fieldLabelStyle}>
        <span>{label}{required && <span style={{ color: colors.cyan }}> *</span>}</span>
        {isInvalid && <span style={{ color: colors.pink, textTransform: 'none', letterSpacing: '0.5px' }}>{error}</span>}
      </label>
      <textarea 
        value={value} 
        onChange={e => onChange(e.target.value)} 
        onBlur={() => { setIsFocused(false); if (onBlur) onBlur() }} 
        onFocus={() => setIsFocused(true)}
        placeholder={placeholder} required={required} rows={rows} 
        style={{ width: '100%', borderRadius: '3px', color: colors.textPrimary, fontSize: '12px', fontWeight: 500, padding: '8px 12px', outline: 'none', fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.5, transition: 'all 0.2s ease', zIndex: 10, position: 'relative', background: bg, border: `1px solid ${borderColor}`, boxShadow }} 
      />
    </div>
  )
}

const FieldSelect = ({ label, value, onChange, onBlur, options, required = false, error, touched }) => {
  const [isFocused, setIsFocused] = useState(false)
  const isInvalid = touched && error
  const isValid = touched && !error && value && value.trim() !== ''

  let borderColor = 'rgba(255,255,255,0.07)'
  let boxShadow = 'none'
  let bg = 'rgba(255,255,255,0.02)'

  if (isFocused) {
    borderColor = `${colors.cyan}70`
    boxShadow = `0 0 0 3px ${colors.cyan}12`
    bg = `rgba(0,245,255,0.03)`
  } else if (isInvalid) {
    borderColor = colors.pink
    boxShadow = `0 0 0 1px ${colors.pink}40`
    bg = `rgba(255,60,110,0.03)`
  } else if (isValid) {
    borderColor = 'rgba(0,255,150,0.4)'
  }

  return (
    <div className="mb-2 relative w-full">
      <label style={fieldLabelStyle}>
        <span>{label}{required && <span style={{ color: colors.cyan }}> *</span>}</span>
        {isInvalid && <span style={{ color: colors.pink, textTransform: 'none', letterSpacing: '0.5px' }}>{error}</span>}
      </label>
      <select 
        value={value} 
        onChange={e => { onChange(e.target.value); if (onBlur) onBlur(); }} 
        onBlur={() => { setIsFocused(false); if (onBlur) onBlur() }} 
        onFocus={() => setIsFocused(true)}
        required={required} 
        style={{ width: '100%', cursor: 'pointer', borderRadius: '3px', color: colors.textPrimary, fontSize: '12px', fontWeight: 500, padding: '8px 12px', outline: 'none', fontFamily: 'inherit', transition: 'all 0.2s ease', zIndex: 10, position: 'relative', background: bg, border: `1px solid ${borderColor}`, boxShadow }}
      >
        {options.map(opt => <option key={opt.value} value={opt.value} style={{ background: '#080814', color: colors.textPrimary }}>{opt.label}</option>)}
      </select>
    </div>
  )
}

export default Socials