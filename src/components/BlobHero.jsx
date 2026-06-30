import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { colors, gradients } from '../styles/theme'

// --- Helper Functions ---
const easeOut = (t) => 1 - Math.pow(1 - t, 4)

// ─── Data: Ordered by Priority with Expanded Details for Modal ───────────
const featuredItems = [
  {
    id: 'f1', 
    colSpan: 'col-span-12 lg:col-span-7', 
    rowSpan: 'row-span-2', 
    minHeight: 'min-h-[280px]',
    img: '/pics/dataset_win.jpg', 
    gallery: ['/pics/dataset_win.jpg', '/pics/dataset_bg.jpg', '/pics/dataset_team.jpg', '/pics/dataset_certificate.jpg'], 
    tag: 'AI / Healthcare', 
    year: '2026',
    title: 'Dataset Edition 2 — 3rd Place', 
    accent: colors.cyan,
    desc: '36-hour build. Dual-pipeline multilingual speech assessment system for disordered speech.',
    fullDesc: 'Led Team DataDrive to secure 3rd place in a 36-hour national hackathon. Architected a dual-pipeline multilingual speech assessment system to evaluate disordered speech in Indian languages. Key contributions included generating synthetic clinical datasets via DSP-based slurring augmentation, fine-tuning Whisper ASR for robust recognition, and integrating an LLM decision fusion layer to produce clinician-grade reports and personalized therapy plans.'
  },
  {
    id: 'f2', 
    colSpan: 'col-span-12 lg:col-span-5', 
    rowSpan: 'row-span-2', 
    minHeight: 'min-h-[280px]',
    img: '/pics/H4_win.jpg', 
    gallery: ['/pics/H4_win.jpg', '/pics/H42_win.jpg', '/pics/H4_certi.jpg', '/pics/H42_certi.jpg'], 
    tag: 'AI / Healthcare', 
    year: '2026',
    title: 'Hack4Health — Podium Twice', 
    accent: colors.cyan,
    desc: 'Two consecutive podium finishes. End-to-end ML and hardware pipeline for real-time breath-hold detection.',
    fullDesc: 'Secured podium finishes in both rounds of this healthcare hackathon in collaboration with Perfint Healthcare. Architected the complete end-to-end software pipeline for a real-time breath-hold detection system. Handled live clinical data ingestion, built custom Machine Learning models to accurately classify respiratory states, and successfully integrated the intelligent software pipeline with custom hardware for robust, real-time data acquisition.'
  },
  {
    id: 'f3', 
    colSpan: 'col-span-12 md:col-span-6 lg:col-span-4', 
    rowSpan: 'row-span-2', 
    minHeight: 'min-h-[240px]',
    img: '/pics/publish.jpg', 
    gallery: ['/pics/publish.jpg', '/pics/ppr_certi.jpg', '/pics/ppr_top.jpg', '/pics/ip.jpeg', '/pics/ip_names.jpeg'], 
    tag: 'Research', 
    year: '2026',
    title: 'Published & Patented', 
    accent: colors.cyan,
    desc: 'IEEE ICVADV-2026 accepted paper on NLP sentiment analysis & a filed patent for a closed-loop precision agriculture system.',
    fullDesc: 'Achieved two major research milestones. First, co-authored and presented a paper at IEEE ICVADV-2026 on a hybrid ML and Transformer framework for sentiment analysis of obesity-related social media discourse, training RF and LSTM models on over 100,000 tweets. Second, filed a patent for a Closed-Loop Liquid Dispensing System. This precision agriculture invention uses computer vision to generate pixel-level infection segmentation maps, converting them into spatial spray vectors for targeted micro-droplet dispensing and automated post-spray deposition verification.'
  },
  {
    id: 'f4', 
    colSpan: 'col-span-12 md:col-span-6 lg:col-span-4', 
    rowSpan: 'row-span-2', 
    minHeight: 'min-h-[240px]',
    img: '/pics/nm_summa.jpeg', 
    gallery: ['/pics/nm2_summa.jpeg', '/pics/berri_certi.jpg', '/pics/vit_certi.jpg'],
    tag: 'Experience', 
    year: '2025',
    title: 'Internships & Research', 
    accent: colors.cyan,
    desc: 'Python Developer at Berribot & ML Research Intern at VIT.',
    fullDesc: 'Completed dual internships in 2025. As a Python Developer Intern at Berribot, I built robust browser automation and agentic AI workflows, implementing advanced anti-bot evasion techniques like dynamic user-agent rotation and WebGL/Canvas fingerprint management. Simultaneously, as a Research Intern at VIT under Dr. Manikandan P., I designed an ensemble stacking model for colorectal cancer survival prediction using the SEER dataset. This involved aggregating models like LightGBM and CatBoost, and optimizing hyperparameters via the Pufferfish Optimization Algorithm (POA), culminating in a research paper currently in progress.'
  },
  {
    id: 'f5', 
    colSpan: 'col-span-6 lg:col-span-2', 
    rowSpan: 'row-span-2', 
    minHeight: 'min-h-[200px]',
    img: '/pics/SIH_win.jpg', 
    gallery: ['/pics/SIH_win.jpg', '/pics/sih_agro.jpg', '/pics/sih_robo.jpg', '/pics/sih_end.jpg'],
    tag: 'Top 50', 
    year: '2025',
    title: 'SIH 2025', 
    accent: colors.cyan,
    desc: 'Top 50 out of 800 teams. Intelligent semi-automated rover.',
    fullDesc: 'Represented VIT Chennai at the Smart India Hackathon 2025, advancing past the 24-hour prototype development round to be shortlisted in the top 50 out of nearly 800 teams. Led system architecture and the end-to-end data pipeline for AgroBot, an intelligent semi-automated pesticide sprinkling bot built with a Raspberry Pi and Machine Learning. Spearheaded image processing, data labeling, and model training to enable precise, targeted plant infection detection, driving sustainable practices in precision agriculture.'
  },
  {
    id: 'f6', 
    colSpan: 'col-span-6 lg:col-span-2', 
    rowSpan: 'row-span-2', 
    minHeight: 'min-h-[200px]',
    img: '/pics/medHack_win.jpg',
    gallery: ['pics/mh_hero.jpg', 'pics/mh_certi.jpg', 'pics/medHack_win.jpg'], 
    tag: 'Organizer', 
    year: '2025',
    title: 'MedHack 2025', 
    accent: colors.cyan,
    desc: 'Organized a medical image processing AI hackathon at VIT.',
    fullDesc: 'Transitioned from participant to organizer for MedHack 2025 at VIT Chennai, a hackathon dedicated to advancing medical image processing and optimizing real-world clinical procedures. Managed participant registrations, seamless event coordination, and real-time challenge resolution. Actively assisted competing teams with data acquisition and technical support, fostering an ecosystem for healthcare AI innovation while honing leadership and technical facilitation skills.'
  },
]

// ─── Engine: Perfectly Synced with Navbar.jsx ────────────────────────
const computeFeaturedState = (p) => {
  let homeOpacity = 1, homeY = 0, homeScale = 1
  let aboutOpacity = 0, aboutY = 40, aboutScale = 0.95
  let titleOpacity = 0, titleScale = 15, titleY = 0, titleBlur = 0
  let arrowOpacity = 1

  if (p <= 0.08) {
    homeOpacity = 1; homeY = 0; homeScale = 1
  } 
  else if (p <= 0.15) {
    const t = easeOut((p - 0.08) / 0.07)
    homeOpacity = 1 - Math.min(1, t * 1.5)
    homeY = -30 * t
    homeScale = 1 + (0.1 * t)

    aboutOpacity = t
    aboutY = 40 * (1 - t)
    aboutScale = 0.95 + (0.05 * t)
  }
  else if (p <= 0.25) {
    homeOpacity = 0
    aboutOpacity = 1; aboutY = 0; aboutScale = 1
  }
  else if (p <= 0.35) {
    homeOpacity = 0
    const t = easeOut((p - 0.25) / 0.10)
    
    aboutOpacity = 1 - t
    aboutY = -40 * t
    aboutScale = 1 - (0.05 * t)

    titleOpacity = t
    titleScale = 15 - (14 * t)
    titleY = -25 * t
    titleBlur = 0
  } 
  else if (p <= 0.85) {
    homeOpacity = 0; aboutOpacity = 0
    titleScale = 1; titleY = -25
    
    const transitionT = Math.min(1, (p - 0.35) / 0.05)
    titleBlur = transitionT * 12
    titleOpacity = 1 - (transitionT * 0.7) 
  } 
  else {
    homeOpacity = 0; aboutOpacity = 0
    const t = easeOut((p - 0.85) / 0.15)
    
    titleOpacity = 0.3 * (1 - t)
    titleScale = 1
    titleY = -25 - (20 * t)
    titleBlur = 12
    arrowOpacity = 1 - t
  }

  const parallaxT = Math.max(0, (p - 0.35) / 0.50) 
  const cards = featuredItems.map((_, i) => {
    let opacity = 0, y = 80, scale = 0.9
    const dir = i % 2 === 0 ? -1 : 1
    const driftY = dir * (i + 1) * 6 * parallaxT

    if (p < 0.35) {
      opacity = 0; y = 80; scale = 0.9
    } else if (p <= 0.55) { 
      const start = 0.35 + (i * 0.02)
      if (p > start) {
        const easeT = easeOut(Math.min(1, (p - start) / 0.10))
        opacity = easeT
        y = 80 * (1 - easeT) + (driftY * easeT) 
        scale = 0.9 + 0.1 * easeT
      }
    } else if (p <= 0.85) { 
      opacity = 1; scale = 1
      y = driftY 
    } else { 
      const t = easeOut((p - 0.85) / 0.15)
      opacity = 1 - t
      const baseY = dir * (i + 1) * 6
      y = baseY - (40 * t)
      scale = 1 - (0.05 * t)
    }
    return { opacity, y, scale }
  })

  return { homeOpacity, homeY, homeScale, aboutOpacity, aboutY, aboutScale, titleOpacity, titleScale, titleY, titleBlur, arrowOpacity, cards }
}

const BlobHero = () => {
  const sectionRef       = useRef(null)
  const homeRef          = useRef(null) 
  const aboutRef         = useRef(null)
  const bgTitleRef       = useRef(null)
  const taglineRef       = useRef(null)
  const gridContainerRef = useRef(null)
  const cardRefs         = useRef([])
  
  const overlayRef       = useRef(null)
  const modalCardRef     = useRef(null)
  const modalContentRef  = useRef(null)
  const closeBtnRef      = useRef(null)

  const scrollTriggerRef = useRef(null)
  const scrollStateRef   = useRef({ p: 0 })
  const isAnimating      = useRef(false)
  
  const [activeCard, setActiveCard] = useState(null)
  const [galleryIndex, setGalleryIndex] = useState(0) // Tracks current image in modal
  const isModalOpen = useRef(false)

  const handleMouseMove = (e) => {
    if (isModalOpen.current || !gridContainerRef.current) return
    if (scrollStateRef.current.p > 0.35 && scrollStateRef.current.p < 0.85) {
      const xPos = (e.clientX / window.innerWidth  - 0.5) * 20
      const yPos = (e.clientY / window.innerHeight - 0.5) * 20
      gsap.to(gridContainerRef.current, { x: xPos, y: yPos, duration: 2.5, ease: 'power3.out', overwrite: 'auto' })
    }
  }

  const handleNextSection = () => {
    if (isModalOpen.current || isAnimating.current || !scrollTriggerRef.current) return
    const p = scrollStateRef.current.p
    const st = scrollTriggerRef.current

    const stops = [0.20, 0.55]
    const nextStop = stops.find(stop => p < stop - 0.02)

    let targetY
    if (nextStop !== undefined) {
      targetY = st.start + (st.end - st.start) * nextStop
    } else {
      const nextST = ScrollTrigger.getAll().find(t => t.trigger?.id === 'experience' && t.vars.pin)
      if (nextST) targetY = nextST.start + (nextST.end - nextST.start) * 0.10
      else return
    }

    const proxy = { y: window.scrollY || document.documentElement.scrollTop }
    const tween = gsap.to(proxy, { y: targetY, duration: 2, ease: 'power3.inOut', onUpdate: () => window.scrollTo(0, proxy.y) })
    const killTween = () => tween.kill()
    window.addEventListener('wheel', killTween, { once: true, passive: true })
    window.addEventListener('touchstart', killTween, { once: true, passive: true })
  }

  const applyScrollState = (p) => {
    const state = computeFeaturedState(p)
    scrollStateRef.current.p = p

    if (homeRef.current) gsap.set(homeRef.current, { 
      opacity: Math.max(0, state.homeOpacity), y: state.homeY, scale: state.homeScale, 
      pointerEvents: state.homeOpacity > 0.5 ? 'auto' : 'none'
    })

    if (aboutRef.current) gsap.set(aboutRef.current, {
      opacity: Math.max(0, state.aboutOpacity), y: state.aboutY, scale: state.aboutScale,
      pointerEvents: state.aboutOpacity > 0.5 ? 'auto' : 'none'
    })

    if (bgTitleRef.current) gsap.set(bgTitleRef.current, { 
      opacity: state.titleOpacity, scale: state.titleScale, y: `${state.titleY}vh`, 
      filter: `blur(${state.titleBlur}px)`, transformOrigin: '50% 50%' 
    })

    if (taglineRef.current) gsap.set(taglineRef.current, { 
      opacity: Math.max(0, state.arrowOpacity), 
      pointerEvents: state.arrowOpacity > 0.5 ? 'auto' : 'none' 
    })

    state.cards.forEach((s, i) => {
      if (cardRefs.current[i]) {
        gsap.set(cardRefs.current[i], { opacity: s.opacity, y: s.y, scale: s.scale, transformOrigin: '50% 50%' })
        cardRefs.current[i].style.pointerEvents = s.opacity > 0.5 ? 'auto' : 'none'
      }
    })
  }

  useEffect(() => {
    gsap.set(taglineRef.current, { opacity: 0 })
    gsap.set(bgTitleRef.current, { opacity: 0, scale: 15, transformOrigin: '50% 50%', filter: 'blur(0px)' })
    gsap.set(homeRef.current,    { opacity: 0, y: 20 })
    gsap.set(aboutRef.current,   { opacity: 0, y: 40 })
    
    gsap.set(overlayRef.current, { opacity: 0, pointerEvents: 'none' })
    gsap.set(modalCardRef.current, { opacity: 0, y: 40, scale: 0.95 })
    gsap.set(modalContentRef.current, { opacity: 0, y: 20 })
    gsap.set(closeBtnRef.current, { opacity: 0, scale: 0.5 })

    cardRefs.current.forEach(el => { if (el) gsap.set(el, { opacity: 0, y: 80, scale: 0.9 }) })

    gsap.to(homeRef.current,    { opacity: 1, y: 0, duration: 1.5, ease: 'power3.out', delay: 0.4 })
    gsap.to(taglineRef.current, { opacity: 1, duration: 1.5, ease: 'power2.out', delay: 1.2 })

    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top', 
      end: '+=3000', 
      pin: true, 
      scrub: 0.7, 
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        if (!isModalOpen.current) applyScrollState(self.progress)
      },
    })

    const onKey = (e) => { if (e.key === 'Escape' && isModalOpen.current) handleCloseModal() }
    window.addEventListener('keydown', onKey)

    return () => {
      window.removeEventListener('keydown', onKey)
      ScrollTrigger.getAll().forEach(t => t.trigger?.id === 'home' && t.kill())
      document.body.style.overflow = ''
    }
  }, [])

  const handleCardClick = (item) => {
    const p = scrollStateRef.current.p;
    if (isAnimating.current || isModalOpen.current || p < 0.45 || p > 0.85) return
    
    isAnimating.current = true
    isModalOpen.current = true
    document.body.style.overflow = 'hidden'
    setActiveCard(item)
    setGalleryIndex(0) // Reset to first image on open

    gsap.to(gridContainerRef.current, { x: 0, y: 0, duration: 0.8, ease: 'power3.out' })
    gsap.killTweensOf(cardRefs.current)

    const tl = gsap.timeline({ onComplete: () => { isAnimating.current = false } })
    
    tl.to(cardRefs.current,    { opacity: 0, scale: 0.9, duration: 0.4, ease: 'power2.inOut', stagger: 0.02 }, 0)
      .to(bgTitleRef.current,  { opacity: 0, duration: 0.4, ease: 'power2.in' }, 0)
      .to(taglineRef.current,  { opacity: 0, duration: 0.4, ease: 'power2.in' }, 0)
      .to(overlayRef.current,  { opacity: 1, duration: 0.5, ease: 'power2.out', pointerEvents: 'all' }, 0.2)
      .to(modalCardRef.current,{ opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'expo.out' }, 0.3)
      .to(modalContentRef.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 0.5)
      .to(closeBtnRef.current, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.5)' }, 0.6)
  }

  const handleCloseModal = () => {
    if (isAnimating.current) return
    isAnimating.current = true

    const { p } = scrollStateRef.current
    const state = computeFeaturedState(p)

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating.current = false
        isModalOpen.current = false
        setActiveCard(null)
        document.body.style.overflow = ''

        scrollTriggerRef.current?.enable()
        requestAnimationFrame(() => {
          ScrollTrigger.refresh(true)
          applyScrollState(p)
        })
      },
    })

    tl.to(closeBtnRef.current, { opacity: 0, scale: 0.5, duration: 0.2 }, 0)
      .to(modalContentRef.current, { opacity: 0, y: 20, duration: 0.3, ease: 'power2.in' }, 0)
      .to(modalCardRef.current, { opacity: 0, y: 40, scale: 0.95, duration: 0.4, ease: 'power3.in' }, 0.1)
      .to(overlayRef.current, { opacity: 0, duration: 0.5, ease: 'power2.out', pointerEvents: 'none' }, 0.3)
      .to(taglineRef.current, { opacity: Math.max(0, state.arrowOpacity), duration: 0.5, ease: 'power2.out' }, 0.4)

    if (bgTitleRef.current) {
      tl.to(bgTitleRef.current, { opacity: state.titleOpacity, duration: 0.5, ease: 'power2.out' }, 0.4)
    }

    cardRefs.current.forEach((el, idx) => {
      if (!el) return
      const s = state.cards[idx]
      tl.to(el, { y: s.y, opacity: s.opacity, scale: s.scale, duration: 0.6, ease: 'expo.out' }, 0.4 + idx * 0.02)
    })
  }

  // Helper logic for the gallery display inside the modal
  const activeImages = activeCard?.gallery?.length > 0 ? activeCard.gallery : [activeCard?.img].filter(Boolean);
  const currentImage = activeImages[galleryIndex];
  const hasMultipleImages = activeImages.length > 1;

  const nextImage = (e) => {
    e.stopPropagation();
    setGalleryIndex((prev) => (prev + 1) % activeImages.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setGalleryIndex((prev) => (prev - 1 + activeImages.length) % activeImages.length);
  };

  return (
    <section
      id="home"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-screen overflow-hidden flex items-center justify-center"
    >
      {/* ─── PHASE 0: HOME SCREEN ─── */}
      <div ref={homeRef} className="absolute inset-0 flex flex-col items-center justify-center z-[35] pointer-events-none">
        <div className="flex flex-col items-start max-w-[90vw] md:max-w-[80vw]">
          <span className="text-3xl md:text-5xl lg:text-[60px] text-white font-bold tracking-tight mb-1 md:mb-2">
            Hi, I am
          </span>
          <h1 className="text-6xl md:text-8xl lg:text-[110px] font-black tracking-tight leading-[1.1] mb-6 -ml-1 lg:-ml-2">
            <style>{`
              @keyframes text-gradient-pan {
              0%   { background-position: 0%   center; }
              100% { background-position: 200% center; }
            }
            .animate-text-gradient {
              animation: text-gradient-pan 4s linear infinite;
            }
            `}</style>
            <span
              className="inline-block animate-text-gradient"
              style={{
                backgroundImage: `linear-gradient(to right, ${colors.cyan}, ${colors.pink}, ${colors.violet}, ${colors.cyan})`,
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 10px 30px rgba(123,47,255,0.25))'
              }}
            >
              Eric Jonathan E
            </span>
          </h1>
          <p className="flex flex-col text-xs md:text-sm lg:text-base text-white/60 font-medium tracking-wide leading-relaxed max-w-2xl">
            <span>
              AI & Machine Learning Engineer
              <span className="mx-3 text-white/30">|</span>
                Data Analyst 
            </span>
            <span className="mt-2 text-white/50">
              M.Tech CSE (Business Analytics & Data Science) @ VIT
            </span>
          </p>
        </div>
      </div>

      {/* ─── PHASE 1: ABOUT ME (Height-Restricted Wide Layout) ─── */}
      <div ref={aboutRef} className="absolute inset-0 flex flex-col items-center justify-center z-[30] pointer-events-none px-4 md:px-8" style={{ opacity: 0 }}>
        <div 
          className="max-w-[1200px] w-full max-h-[75vh] flex flex-col md:flex-row items-stretch gap-6 md:gap-10 p-6 md:p-8 lg:p-10 rounded-[2rem] text-left"
          style={{ 
            background: 'rgba(12,12,30,0.65)', 
            border: `1px solid rgba(255,255,255,0.08)`, 
            backdropFilter: 'blur(24px)',
            boxShadow: `0 32px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)`,
          }}
        >
          {/* Left Column: Image Area */}
          <div className="hidden md:block md:w-[300px] lg:w-[350px] flex-shrink-0 relative rounded-2xl overflow-hidden shadow-2xl">
            <img 
              src="/pics/hero.jpeg" 
              alt="Eric Jonathan E" 
              className="absolute inset-0 w-full h-full object-cover filter contrast-110"
            />
            <div className="absolute inset-0 border-[2px] border-white/10 rounded-2xl mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0c0c1e]/80 via-transparent to-transparent"></div>
            <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] rounded-2xl pointer-events-none"></div>
          </div>

          {/* Right Column: Text Content */}
          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-2xl md:text-3xl lg:text-[36px] font-black italic tracking-tight text-white mb-2 leading-tight">
              Building things that <span style={{backgroundImage: `linear-gradient(to right, ${colors.cyan}, ${colors.violet})`,WebkitBackgroundClip: "text",WebkitTextFillColor: "transparent",backgroundClip: "text",}}>matter.</span>
            </h2>
            <div className="w-16 h-1 bg-gradient-to-r from-cyan-400 to-pink-500 mb-6 rounded-full flex-shrink-0" style={{backgroundImage: `linear-gradient(to right, ${colors.cyan}, ${colors.violet})`,}} />
            
            <div className="space-y-4 text-[12px] md:text-[13px] lg:text-[14px] text-white/75 font-medium leading-[1.7] tracking-wide pb-2">
              <p>
                I'm <strong style={{backgroundImage: `linear-gradient(to right, ${colors.cyan}, ${colors.violet})`,WebkitBackgroundClip: "text",WebkitTextFillColor: "transparent",backgroundClip: "text",}}>Eric Jonathan E</strong>,an Integrated M.Tech Computer Science/ Engineering student from VIT Chennai, majoring in Business Analytics and Data Science. I am passionate about the convergence of Artificial Intelligence, Machine Learning, Data Science, and Software Engineering, aiming to take complex challenges and solve them in a useful and meaningful way.
              </p>
              <p>
                I have gained experience in various areas such as Natural Language Processing, Healthcare AI, Computer Vision, Deep Learning, Web Development, and Data Engineering over the years. My research publications, participation in AI projects for healthcare, as well as various innovative solutions such as multimodal respiratory monitoring systems, intelligent agricultural technologies, and financial crime detection frameworks, are all featured in my work. This has led to a published research article in an international conference, an accepted Indian patent, and a few research and industry experiences that have helped me to sharpen my analytical thinking as well as engineering skills. I actively look for challenges to learn, innovate and develop technologies that impact the real world.
              </p>
              <p>
                I think the best innovations are those that come from the integration of research quality, engineering ingenuity and a thirst for knowledge. My goals as I further this pursuit into AI and Data Science are to help shape innovative technologies that can resolve complex issues and generate meaningful long-term value.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── ZOOMING BACKGROUND TITLE ─── */}
      <div
        ref={bgTitleRef} className="absolute pointer-events-none select-none text-center w-full z-[5]"
        style={{ opacity: 0, top: '50%', marginTop: '-70px', fontSize: 'min(16vw, 150px)', fontWeight: 900, fontStyle: 'italic', color: 'transparent', WebkitTextStroke: `2px ${colors.cyan}`, textShadow: `0 0 100px ${colors.cyan}44, 0 0 200px ${colors.cyan}22`, letterSpacing: '-3px', textTransform: 'uppercase', whiteSpace: 'nowrap', lineHeight: 0.85 }}
      >
        FEATURED
      </div>

      {/* ─── BENTO GRID CONTAINER ─── */}
      <div className="absolute inset-0 flex items-center justify-center z-[20] pointer-events-none px-4 md:px-8">
        <div 
          ref={gridContainerRef}
          className="w-full max-w-[1200px] grid grid-cols-12 gap-4 auto-rows-auto"
        >
          {featuredItems.map((item, i) => (
            <button
              key={item.id}
              ref={el => (cardRefs.current[i] = el)}
              onClick={() => handleCardClick(item)}
              tabIndex={isModalOpen.current ? -1 : 0}
              className={`${item.colSpan} ${item.rowSpan} ${item.minHeight} relative overflow-hidden rounded-2xl group transition-all duration-300 ease-out flex flex-col justify-end p-5 md:p-6 text-left cursor-pointer focus:outline-none`}
              style={{
                opacity: 0,
                background: 'rgba(12,12,30,0.6)',
                border: `1px solid rgba(255,255,255,0.08)`,
                backdropFilter: 'blur(16px)',
                boxShadow: `0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${item.accent}88`
                e.currentTarget.style.boxShadow = `0 20px 60px ${item.accent}33, inset 0 1px 0 rgba(255,255,255,0.05)`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)`
              }}
            >
              <div className="absolute inset-0 z-0">
                <img 
                  src={item.img} 
                  alt={item.title} 
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  style={{ opacity: 0.35, filter: 'contrast(1.1) saturate(1.2)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c1e] via-[#0c0c1e]/80 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-500" />
              </div>

              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex items-center justify-between mb-4">
                  <span style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '3px', textTransform: 'uppercase', color: item.accent, border: `1px solid ${item.accent}44`, borderRadius: '4px', padding: '4px 10px', background: `${item.accent}0d` }}>
                    {item.tag}
                  </span>
                  <span style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '2px', color: colors.textDim }}>
                    {item.year}
                  </span>
                </div>

                <div>
                  <h3 className="font-black italic tracking-tight leading-tight mb-2 transition-colors duration-300" style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', color: colors.textPrimary }}>
                    {item.title}
                  </h3>
                  <p className="font-medium leading-relaxed line-clamp-3 text-white/60" style={{ fontSize: '13px' }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Down Button ─── */}
      <div 
        ref={taglineRef} 
        onClick={handleNextSection}
        className="absolute bottom-10 w-full flex flex-col items-center justify-center z-[100] cursor-pointer group pointer-events-none"
        style={{ opacity: 0 }}
      >
        <div className="animate-bounce rounded-full p-3 bg-white/5 border border-white/10 group-hover:bg-white/10 group-hover:border-white/30 group-hover:scale-110 transition-all duration-300 backdrop-blur-md pointer-events-auto">
          <svg className="w-6 h-6 text-white/50 group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* ─── EXPANDED MODAL VIEW (LinkedIn / Social Post Layout) ─── */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
      `}</style>

      <div ref={overlayRef} className="absolute inset-0" style={{ background: gradients.overlayModal, zIndex: 110 }} onClick={handleCloseModal} />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 120 }}>
        <div 
          ref={modalCardRef} 
          className="relative w-[95vw] max-w-[1000px] h-auto max-h-[90vh] md:h-[600px] rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl"
          style={{ 
            background: colors.bgMid, 
            border: `1px solid rgba(255,255,255,0.1)`, 
            boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
            pointerEvents: activeCard ? 'auto' : 'none'
          }}
        >
          {/* Close Button (Absolute to Top Right of entire modal) */}
          <button
            ref={closeBtnRef} onClick={handleCloseModal} aria-label="Close"
            className="absolute top-4 right-4 z-[100] w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 backdrop-blur-md"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            onMouseEnter={e => { e.currentTarget.style.background = activeCard?.accent || '#fff'; e.currentTarget.style.borderColor = activeCard?.accent || '#fff'; e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = `0 0 20px ${activeCard?.accent}88` }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            ✕
          </button>

          {activeCard && (
            <>
              {/* ─── LEFT COLUMN: Image Gallery (60%) ─── */}
              <div className="w-full h-[250px] md:h-full md:w-[60%] relative flex items-center justify-center bg-black/80 border-b md:border-b-0 md:border-r border-white/10 overflow-hidden">
                
                {/* 1. Ambient Blurred Backdrop for fitting irregular images elegantly */}
                <img 
                  src={currentImage} 
                  className="absolute inset-0 w-full h-full object-cover opacity-30 blur-2xl transform scale-110 saturate-150 transition-all duration-500" 
                  alt="" 
                />
                
                {/* 2. Main Foreground Image (Object-Contain so nothing gets cropped) */}
                <img 
                  key={currentImage} // Forces a quick re-render for clean swapping
                  src={currentImage} 
                  className="relative z-10 w-full h-full object-contain p-0 md:p-2 transition-opacity duration-300 animate-fade-in" 
                  alt={activeCard.title} 
                />

                {/* 3. Navigation Controls */}
                {hasMultipleImages && (
                  <>
                    <button 
                      onClick={prevImage} 
                      className="absolute left-4 z-20 w-10 h-10 rounded-full bg-black/50 border border-white/20 text-white flex items-center justify-center hover:bg-black/80 transition-colors backdrop-blur-md"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    
                    <button 
                      onClick={nextImage} 
                      className="absolute right-4 z-20 w-10 h-10 rounded-full bg-black/50 border border-white/20 text-white flex items-center justify-center hover:bg-black/80 transition-colors backdrop-blur-md"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                    
                    {/* Pagination Dots */}
                    <div className="absolute bottom-4 z-20 flex gap-2">
                      {activeImages.map((_, idx) => (
                        <div 
                          key={idx} 
                          className={`h-2 rounded-full transition-all duration-300 ${idx === galleryIndex ? 'bg-white w-4' : 'bg-white/40 w-2'}`} 
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* ─── RIGHT COLUMN: Text Content (40%) ─── */}
              <div className="w-full md:w-[40%] h-[350px] md:h-full flex flex-col relative bg-[#0a0a0c]">
                <div ref={modalContentRef} className="p-6 md:p-10 pr-4 md:pr-8 flex-1 overflow-y-auto custom-scrollbar flex flex-col justify-start md:justify-center">
                  
                  {/* Meta Tags */}
                  <div className="flex items-center gap-3 mb-6">
                    <span style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: activeCard.accent, fontWeight: 800 }}>
                      {activeCard.tag}
                    </span>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                    <span style={{ fontSize: '10px', letterSpacing: '2px', color: colors.textDim, fontWeight: 600 }}>
                      {activeCard.year}
                    </span>
                  </div>
                  
                  {/* Title */}
                  <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontStyle: 'italic', fontWeight: 900, color: colors.textPrimary, letterSpacing: '-1px', marginBottom: '20px', lineHeight: 1.15 }}>
                    {activeCard.title}
                  </h2>
                  
                  {/* Divider Line */}
                  <div style={{ width: '40px', height: '3px', background: activeCard.accent, marginBottom: '24px', borderRadius: '2px' }} />
                  
                  {/* Full Description */}
                  <p style={{ fontSize: '14px', fontWeight: 400, color: colors.textSecondary, lineHeight: 1.8, paddingBottom: '20px' }}>
                    {activeCard.fullDesc}
                  </p>

                </div>
              </div>
            </>
          )}
        </div>
      </div>

    </section>
  )
}

export default BlobHero