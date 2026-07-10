/**
 * Block renderers — one component per editable block type. Markup + classNames
 * are ported verbatim from the customer's reference design so the site is
 * pixel-identical, but every string now comes from Payload (the CMS) instead
 * of being hardcoded. Add a case here when you add a block type in ../blocks.
 */
import React from 'react'

type Any = Record<string, any>

function Eyebrow({ children, center }: { children: React.ReactNode; center?: boolean }) {
  return (
    <div className="eyebrow" style={center ? { justifyContent: 'center' } : undefined}>
      {children}
    </div>
  )
}

function Hero({ block }: { block: Any }) {
  const lines: Any[] = block.lines || []
  return (
    <section className="hero">
      <div className="container">
        <h1>
          {lines.map((l, i) => (
            <span className="line" key={i}>
              <span className={i === lines.length - 1 ? 'accent' : undefined}>{l.text}</span>
            </span>
          ))}
        </h1>
        {block.lead && <p className="lead">{block.lead}</p>}
        {block.arabicLine && <div className="arabic">{block.arabicLine}</div>}
        <div className="hero-actions">
          {(block.buttons || []).map((b: Any, i: number) => (
            <a key={i} href={b.href} className={`btn ${b.style === 'outline' ? 'btn-outline' : 'btn-primary'}`}>
              {b.label}
            </a>
          ))}
        </div>
      </div>
      <div className="scroll-cue"><span>Scroll</span><div className="line-anim" /></div>
    </section>
  )
}

function Marquee({ block }: { block: Any }) {
  const items: Any[] = block.items || []
  const doubled = [...items, ...items]
  return (
    <div className="marquee-wrap">
      <div className="marquee">
        {doubled.map((it, i) => (
          <span key={i}>{it.text}</span>
        ))}
      </div>
    </div>
  )
}

function About({ block }: { block: Any }) {
  return (
    <section id="about">
      <div className="container about-grid">
        <div className="about-visual" id="orbitVisual">
          <div className="orbit orbit-1" />
          <div className="orbit orbit-2" />
          <div className="core" />
          <div className="orbit-message">
            <span className="orbit-message-title">Look up.</span>
            <span className="orbit-message-sub">Every campaign finds its orbit.</span>
          </div>
          <div className="orbit-hint">Hover to look up ↑</div>
        </div>
        <div className="about-copy">
          {block.eyebrow && <Eyebrow>{block.eyebrow}</Eyebrow>}
          {block.heading && (
            <h2 style={{ margin: '18px 0 22px', fontSize: 'clamp(26px,4vw,38px)' }}>{block.heading}</h2>
          )}
          <Paragraphs text={block.body} />
        </div>
      </div>
    </section>
  )
}

function Pillars({ block }: { block: Any }) {
  return (
    <section id="pillars">
      <div className="container">
        <div className="section-head">
          {block.eyebrow && <Eyebrow>{block.eyebrow}</Eyebrow>}
          {block.heading && <h2>{block.heading}</h2>}
          {block.intro && <p>{block.intro}</p>}
        </div>
        <div className="pillars">
          {(block.pillars || []).map((p: Any, i: number) => (
            <div className="pillar" key={i}>
              {p.label && <span className="num">{p.label}</span>}
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Services({ block }: { block: Any }) {
  return (
    <section id="services">
      <div className="container">
        <div className="section-head">
          {block.eyebrow && <Eyebrow>{block.eyebrow}</Eyebrow>}
          {block.heading && <h2>{block.heading}</h2>}
          {block.intro && <p>{block.intro}</p>}
        </div>
        <div className="services-grid">
          {(block.services || []).map((s: Any, i: number) => (
            <div className="service" key={i}>
              <h4><span className="dot" />{s.title}</h4>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Clients({ block }: { block: Any }) {
  return (
    <section id="clients">
      <div className="container">
        <div className="section-head">
          {block.eyebrow && <Eyebrow>{block.eyebrow}</Eyebrow>}
          {block.heading && <h2>{block.heading}</h2>}
          {block.intro && <p>{block.intro}</p>}
        </div>
        <div className="clients-grid">
          {(block.clients || []).map((c: Any, i: number) => (
            <div className="client-card" key={i}>
              <div className="name">{c.name}</div>
              {c.tag && <div className="tag">{c.tag}</div>}
            </div>
          ))}
        </div>
        {block.note && <p className="clients-note">{block.note}</p>}
      </div>
    </section>
  )
}

function Contact({ block }: { block: Any }) {
  return (
    <section id="contact">
      <div className="container">
        <div className="contact-box">
          {block.eyebrow && <Eyebrow center>{block.eyebrow}</Eyebrow>}
          {block.heading && <h2>{block.heading}</h2>}
          {block.body && <p>{block.body}</p>}
          {block.email && (
            <div className="hero-actions" style={{ justifyContent: 'center' }}>
              <a href={`mailto:${block.email}`} className="btn btn-primary">{block.email} ✉</a>
            </div>
          )}
          <div className="contact-links">
            {(block.details || []).map((d: Any, i: number) => (
              <span key={i}>{d.text}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/** Render a plain-text body as paragraphs. Each non-empty line (split on
 *  blank lines OR single newlines) becomes its own <p>. */
function Paragraphs({ text }: { text?: string }) {
  if (!text) return null
  const paras = text.split(/\n\s*\n|\n/).map((p) => p.trim()).filter(Boolean)
  return (
    <>
      {paras.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </>
  )
}

const REGISTRY: Record<string, React.FC<{ block: Any }>> = {
  hero: Hero,
  marquee: Marquee,
  about: About,
  pillars: Pillars,
  services: Services,
  clients: Clients,
  contact: Contact,
}

export function RenderBlocks({ layout }: { layout: Any[] }) {
  return (
    <>
      {(layout || []).map((block, i) => {
        const Comp = REGISTRY[block.blockType]
        return Comp ? <Comp key={i} block={block} /> : null
      })}
    </>
  )
}
