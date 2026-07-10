'use client'
/**
 * Orion Assistant chat widget — UI ported from the customer's chat.js, but
 * wired to the FastAPI agentic backend (NEXT_PUBLIC_CHAT_ENDPOINT). The
 * backend does the RAG grounding + human-handoff; if it's unreachable we keep
 * the customer's original scripted fallback so the chat never looks broken.
 */
import React, { useEffect, useRef, useState } from 'react'

const ENDPOINT = process.env.NEXT_PUBLIC_CHAT_ENDPOINT || 'http://localhost:8000/chat'

type Msg = { role: 'user' | 'assistant'; text: string }

const CHIPS = [
  { label: 'Services', q: 'What services do you offer?' },
  { label: 'Clients', q: 'Which clients have you worked with?' },
  { label: 'Get a quote', q: 'How do I get a quote?' },
]

function scriptedFallback(raw: string): string {
  const t = raw.toLowerCase()
  if (/\b(hi|hello|hey|salam|marhaba)\b/.test(t))
    return "Hello! I'm the Orion Media assistant. Ask me about our services, clients, or how to start a campaign."
  if (/service|offer|what do you do/.test(t))
    return 'We work across four areas: TV media buying, TV commercial production, integrated media campaigns, and advertisement design & production.'
  if (/price|cost|budget|quote|how much/.test(t))
    return 'Pricing depends on scope. Share a few details via the contact form and our team will send a tailored quote.'
  if (/contact|email|reach|phone|human/.test(t))
    return 'You can reach the team directly at hello@orionilam.com, or hit "Request a Meeting" above.'
  return 'Good question — for a precise answer our team is best placed to help. Email hello@orionilam.com and they’ll follow up.'
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)
  const opened = useRef(false)

  useEffect(() => {
    bodyRef.current?.scrollTo(0, bodyRef.current.scrollHeight)
  }, [msgs, typing])

  function greetOnce() {
    if (opened.current) return
    opened.current = true
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMsgs([{ role: 'assistant', text: "Hi, I'm Orion — your media assistant. Ask me anything about our services, clients, or how to get started." }])
    }, 500)
  }

  // gentle auto-open after visitors settle in (kept from the reference)
  useEffect(() => {
    const t = setTimeout(() => { setOpen(true); greetOnce() }, 15000)
    return () => clearTimeout(t)
  }, [])

  async function respond(text: string) {
    const history = msgs
    setMsgs((m) => [...m, { role: 'user', text }])
    setTyping(true)
    let reply: string
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: history.map((m) => ({ role: m.role, content: m.text })),
        }),
      })
      reply = res.ok ? (await res.json()).reply : scriptedFallback(text)
    } catch {
      reply = scriptedFallback(text) // backend down -> never a broken chat
    }
    setTyping(false)
    setMsgs((m) => [...m, { role: 'assistant', text: reply }])
  }

  function send() {
    const v = input.trim()
    if (!v) return
    setInput('')
    respond(v)
  }

  function toggle() {
    setOpen((o) => {
      const next = !o
      if (next) greetOnce()
      return next
    })
  }

  return (
    <>
      <button className={`chat-launcher${open ? ' open' : ''}`} onClick={toggle} aria-label="Open Orion AI Assistant">
        <svg className="chat-ic" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 5.94 2 10.8c0 2.77 1.48 5.24 3.8 6.86-.12.98-.5 2.5-1.55 3.9-.17.22.01.54.28.5 2.02-.3 3.7-1.1 4.83-1.78.85.2 1.74.32 2.64.32 5.52 0 10-3.94 10-8.8S17.52 2 12 2z" /></svg>
        <svg className="close-ic" viewBox="0 0 24 24"><path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.3 19.7l-1.41-1.41L9.19 12 2.89 5.71 4.3 4.29l6.29 6.3 6.29-6.3z" /></svg>
      </button>

      <div className={`chat-panel${open ? ' open' : ''}`}>
        <div className="chat-head">
          <div className="belt"><span /><span /><span /></div>
          <div className="titles">
            <strong>Orion Assistant</strong>
            <span><span className="dot-live" />Online now</span>
          </div>
        </div>
        <div className="chat-body" ref={bodyRef}>
          {msgs.map((m, i) => (
            <div key={i} className={`msg ${m.role === 'user' ? 'user' : 'bot'}`}>{m.text}</div>
          ))}
          {typing && <div className="typing"><span /><span /><span /></div>}
        </div>
        <div className="chat-suggestions">
          {CHIPS.map((c) => (
            <button key={c.label} className="chip" onClick={() => respond(c.q)}>{c.label}</button>
          ))}
        </div>
        <div className="chat-input-row">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Ask about campaigns, services…"
            autoComplete="off"
          />
          <button onClick={send} aria-label="Send">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M2 21l21-9L2 3v7l15 2-15 2z" /></svg>
          </button>
        </div>
      </div>
    </>
  )
}
