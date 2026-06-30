import { useState } from 'react'
import Preloader from './components/Preloader'
import Navbar from './components/Navbar'
import BlobHero from './components/BlobHero'
import Experience from './components/Experience'
import Published from './components/Published'
import Hackathons from './components/Hackathons'
import Projects from './components/Projects'
import Socials from './components/Socials'
import ScrollManager from './components/ScrollManager'
import SideNav from './components/SideNav'

const App = () => {
  const [loading, setLoading] = useState(true)

  return (
    <main>
      <div className="crt-overlay" />
      <div className="crt-noise" />
      {/* Intro animation — plays once on load, then unmounts itself */}
      {loading && <Preloader onComplete={() => setLoading(false)} />}
      {/* Global scroll coordinator — renders progress bar & scroll depth */}
      <ScrollManager />

      {/* Fixed top navigation bar */}
      <Navbar />

      {/* Section-level card navigator — right side, active only in pinned sections */}
      <SideNav />

      {/* 01 — id="home" is handled inside BlobHero */}
      <BlobHero />

      {/* 02 */}
      <Experience />

      {/* 03 */}
      <Published />

      {/* 04 */}
      <Hackathons />

      {/* 05 — NEW */}
      <Projects />

      {/* 06 */}
      <Socials />

    </main>
  )
}

export default App