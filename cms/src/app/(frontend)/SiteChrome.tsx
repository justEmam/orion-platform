'use client'
/**
 * Header, mobile nav, animated starfield background, and scroll-reveal — the
 * interactive chrome around the CMS-rendered blocks. Ported from the reference
 * design's inline <script>, but driven by CMS nav data.
 */
import React, { useEffect, useRef, useState } from 'react'

type Link = { label: string; href: string }

export function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let stars: any[] = []
    let raf = 0
    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      stars = Array.from({ length: Math.floor((canvas.width * canvas.height) / 9000) }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.4 + 0.3,
        a: Math.random(),
        speed: Math.random() * 0.15 + 0.02,
      }))
    }
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      stars.forEach((s) => {
        s.a += s.speed * 0.02
        const op = ((Math.sin(s.a * 6) + 1) / 2) * 0.7 + 0.15
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(245,246,251,${op})`
        ctx.fill()
      })
      raf = requestAnimationFrame(draw)
    }
    resize()
    draw()
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return (
    <>
      <canvas id="starfield" ref={canvasRef} />
      <div className="bg-glow glow-1" />
      <div className="bg-glow glow-2" />
    </>
  )
}

export function Header({ logo, links, cta }: { logo: string; links: Link[]; cta: Link }) {
  const [scrolled, setScrolled] = useState(false)
  const [menu, setMenu] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  return (
    <>
      <header className={scrolled ? 'scrolled' : ''}>
        <div className="container">
          <nav>
            <div className="logo"><div className="belt"><span /><span /><span /></div>{logo}</div>
            <ul className="nav-links">
              {links.map((l) => <li key={l.href}><a href={l.href}>{l.label}</a></li>)}
            </ul>
            <a href={cta.href} className="nav-cta">{cta.label}</a>
            <button className={`menu-btn${menu ? ' open' : ''}`} onClick={() => setMenu(!menu)} aria-label="Toggle menu">
              <span className="icon-open">☰</span><span className="icon-close">✕</span>
            </button>
          </nav>
        </div>
      </header>
      <div className={`mobile-nav${menu ? ' open' : ''}`}>
        {links.map((l) => <a key={l.href} href={l.href} onClick={() => setMenu(false)}>{l.label}</a>)}
        <a href={cta.href} className="nav-cta" style={{ display: 'inline-block' }} onClick={() => setMenu(false)}>{cta.label}</a>
      </div>
    </>
  )
}

export function Footer({ logo, social, copyright }: { logo: string; social: Link[]; copyright: string }) {
  return (
    <footer>
      <div className="container">
        <div className="footer-row">
          <div className="logo"><div className="belt"><span /><span /><span /></div>{logo}</div>
          <div className="social">
            {social.map((s) => <a key={s.href} href={s.href}>{s.label}</a>)}
          </div>
        </div>
        <div className="copyright">{copyright}</div>
      </div>
    </footer>
  )
}
