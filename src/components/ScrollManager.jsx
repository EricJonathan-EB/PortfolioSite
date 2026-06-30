import { useState, useEffect } from 'react'
import { colors } from '../styles/theme'

const ScrollManager = () => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // ─── Global Scroll Tracker ──────────────────────────────
    // Calculates the exact scroll percentage, accounting for the 
    // massive artificial scroll height injected by GSAP pin spacers.
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      
      if (scrollHeight <= 0) return
      
      const currentProgress = (scrollTop / scrollHeight) * 100
      setProgress(Math.min(100, Math.max(0, currentProgress)))
    }

    // Use passive listener for maximum performance, preventing scroll jitter
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    // Trigger once on mount to set initial state
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* ─── Global Neon Progress Bar ─── */}
      {/* We use z-[9999] so it confidently slices over the top of the navbar and modals */}
      <div 
        className="fixed top-0 left-0 w-full h-[3px] z-[9999] pointer-events-none"
        style={{ background: 'rgba(255,255,255,0.05)' }}
      >
        <div 
          className="h-full rounded-r-full transition-transform duration-75 ease-out"
          style={{ 
            width: '100%',
            /* Hardware accelerated scaling to prevent browser layout repaints */
            transform: `translateX(-${100 - progress}%)`, 
            backgroundImage: `linear-gradient(90deg, ${colors.cyan}, ${colors.pink}, ${colors.violet})`,
            boxShadow: `0 0 15px ${colors.pink}88, 0 0 5px ${colors.cyan}AA`,
          }} 
        />
      </div>

      {/* ─── Cinematic Scroll Percentage Indicator ─── */}
      {/* Hidden on mobile, visible on medium+ screens */}
      <div 
        className="fixed bottom-8 left-8 md:left-12 z-[100] pointer-events-none mix-blend-difference hidden sm:flex flex-col items-start gap-1"
      >
        <span 
          style={{ 
            fontSize: '9px', 
            fontWeight: 700, 
            letterSpacing: '4px', 
            textTransform: 'uppercase', 
            color: colors.textDim 
          }}
        >
          Scroll Depth
        </span>
        <span 
          style={{ 
            fontSize: '14px', 
            fontWeight: 900, 
            color: colors.textPrimary,
            /* Tabular-nums prevents the text from jittering left/right as numbers change */
            fontVariantNumeric: 'tabular-nums', 
            letterSpacing: '1px'
          }}
        >
          {progress.toFixed(1).padStart(4, '0')}%
        </span>
      </div>
    </>
  )
}

export default ScrollManager