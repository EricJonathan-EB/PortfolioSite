import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// ─── Re-measure all ScrollTriggers once the full page (all 6 pinned
//    sections) has actually painted. Without this, sections further
//    down the page (Published, Hackathons, Projects, Socials) can
//    calculate their pin start/end against a DOM that hasn't finished
//    inserting earlier sections' pin-spacers yet — causing their
//    scroll progress to stay stuck near 0 no matter how far you scroll. ──
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    ScrollTrigger.refresh()
  })
})