import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { colors } from '../styles/theme'

const sections = [
  { id: 'home',       label: 'Home' },
  { id: 'aboutme',    label: 'About Me' },
  { id: 'featured',   label: 'Featured' },
  { id: 'experience', label: 'Experience' },
  { id: 'published',  label: 'Published' },
  { id: 'hackathons', label: 'Hackathon' },
  { id: 'projects',   label: 'Projects' },
  { id: 'socials',    label: 'Contact' },
]

const Navbar = () => {
  const [open, setOpen] = useState(true)
  const [active, setActive] = useState('home')

  // ─── 3-Click Logo Logic Refs ──────────────────────────────────────
  const logoClickCount = useRef(0)
  const logoClickTimer = useRef(null)

  // ─── Track Active Section via ScrollTrigger Math ──────────────────
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop
      const triggers = ScrollTrigger.getAll()
      let currentSection = 'home'

      // 1. Calculate deep progress into the first section (BlobHero)
      // FIX: Force it to ignore glow triggers by adding && t.vars.pin
      const homeST = triggers.find(t => t.trigger?.id === 'home' && t.vars.pin)
      if (homeST) {
        // Calculate the raw progress (0.0 to 1.0) of the Home pin
        const p = (scrollY - homeST.start) / (homeST.end - homeST.start)
        
        if (p >= 0.27) {
          currentSection = 'featured'
        } else if (p >= 0.10) {
          currentSection = 'aboutme'
        }
      }

      // 2. Overwrite with other sections if we have scrolled down to them
      const otherIds = ['experience', 'published', 'hackathons', 'projects', 'socials']
      otherIds.forEach(id => {
        // FIX: Ensure we are ONLY looking at the pinning triggers, not the background glows
        const st = triggers.find(t => t.trigger?.id === id && t.vars.pin)
        // If we are past the pin's start coordinate (with a 50px buffer), it's active
        if (st && scrollY >= st.start - 50) {
          currentSection = id
        }
      })

      setActive(currentSection)
    }

    // Passive listener for smooth performance
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    // Slight delay on mount to ensure GSAP has calculated layout geometry
    setTimeout(handleScroll, 100)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // ─── Smooth GSAP Scroll (Slower & Standardized) ───────────────────
  const ZOOM_END = {
    experience: 0.1,
    published:  0.1,
    hackathons: 0.1,
    projects:   0.1,
    socials:    0.15,
  }

  const scrollToSection = (id) => {
    let targetY
    const triggers = ScrollTrigger.getAll()

    if (id === 'home') {
      targetY = 0
    } else if (id === 'aboutme') {
      const homeST = triggers.find(t => t.trigger?.id === 'home' && t.vars.pin)
      // Jump to exactly 20% into the BlobHero timeline (Center of About Me text)
      if (homeST) targetY = homeST.start + (homeST.end - homeST.start) * 0.20
    } else if (id === 'featured') {
      const homeST = triggers.find(t => t.trigger?.id === 'home' && t.vars.pin)
      // Jump to exactly 34% (Title is fully zoomed, just before cards appear)
      if (homeST) targetY = homeST.start + (homeST.end - homeST.start) * 0.34
    } else {
      const trig = triggers.find(t => t.trigger?.id === id && t.vars.pin)
      const depth = ZOOM_END[id] ?? 0.10
      if (trig) targetY = trig.start + (trig.end - trig.start) * depth
    }

    if (targetY !== undefined) {
      const proxy = { y: window.scrollY || window.pageYOffset }
      const tween = gsap.to(proxy, {
        y: targetY,
        duration: 4, // Cinematic jump duration
        ease: 'power3.inOut',
        onUpdate: () => window.scrollTo(0, proxy.y)
      })
      
      // Allow user to cancel the automatic jump by scrolling their mouse
      const killTween = () => tween.kill()
      window.addEventListener('wheel', killTween, { once: true })
      window.addEventListener('touchstart', killTween, { once: true })
    }
  }

  // ─── Logo Click Handler (1 click = Home, 3 clicks = Redirect) ─────
  const handleLogoClick = () => {
    logoClickCount.current += 1

    if (logoClickCount.current === 1) {
      // 1st click: Trigger the home scroll immediately so it feels responsive
      scrollToSection('home')
    } else if (logoClickCount.current === 3) {
      // 3rd click: Reset counter and trigger redirect
      logoClickCount.current = 0
      clearTimeout(logoClickTimer.current)
      
      // REPLACE THIS URL with your secret link/dashboard
      window.location.href = 'https://share.google/vEYQ6qErgvMGJ1Tbg' 
      return
    }

    // Reset the click count if they stop clicking for 400ms
    clearTimeout(logoClickTimer.current)
    logoClickTimer.current = setTimeout(() => {
      logoClickCount.current = 0
    }, 400)
  }

  return (
    <>
      {/* ─── LOGO CONTAINER ─── */}
      <div className="fixed top-6 left-6 z-[10000]">
        <img 
          src="/pics/logo.PNG" // UPDATE THIS PATH
          alt="Logo" 
          className="fixed top-1 right-1 w-15 h-15 object-contain hover:opacity-80 transition-opacity cursor-pointer select-none"
          onClick={handleLogoClick}
        />
      </div>
      
      {/* ─── NAVBAR ─── */}
      <div className="fixed top-2 left-1/2 -translate-x-1/2 z-[9999] flex justify-center">
        <div 
          className="rounded-full flex items-center shadow-2xl border border-white/10 p-1"
          style={{ background: 'rgba(12,12,30,0.85)', backdropFilter: 'blur(24px)' }}
        >
          <div 
            className="flex items-center overflow-hidden transition-all duration-500 ease-in-out"
            style={{ width: open ? 'auto' : '0px', opacity: open ? 1 : 0, paddingLeft: open ? '4px' : '0px', paddingRight: open ? '4px' : '0px' }}
          >
            <div className="flex items-center gap-1">
              {sections.map(({ id, label }) => {
                const isActive = active === id
                return (
                  <button
                    key={id}
                    onClick={() => scrollToSection(id)}
                    className="group relative px-5 py-2 rounded-full whitespace-nowrap transition-all duration-300"
                    style={{
                      background: isActive ? `linear-gradient(to right, ${colors.amber}, ${colors.pink}, ${colors.violet})` : 'transparent',
                      color: isActive ? colors.textPrimary : colors.textDim,
                    }}
                  >
                    <span className="relative z-10 text-[13px] font-semibold tracking-wide transition-colors duration-300 group-hover:text-white">
                      {label}
                    </span>
                    {!isActive && (
                      <div className="absolute inset-0 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="flex flex-col gap-[4px] justify-center items-center rounded-full w-[40px] h-[40px] flex-shrink-0 cursor-pointer transition-colors duration-300 hover:bg-white/10"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <span className="block rounded-full transition-all duration-300" style={{ width: '16px', height: '1.5px', background: colors.textPrimary, transform: open ? 'rotate(45deg) translate(4px, 4px)' : 'none' }} />
            <span className="block rounded-full transition-all duration-300" style={{ width: '16px', height: '1.5px', background: colors.textPrimary, opacity: open ? 0 : 1 }} />
            <span className="block rounded-full transition-all duration-300" style={{ width: '16px', height: '1.5px', background: colors.textPrimary, transform: open ? 'rotate(-45deg) translate(4px, -4px)' : 'none' }} />
          </button>
        </div>
      </div>
    </>
  )
}

export default Navbar