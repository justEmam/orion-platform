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

/** Escape HTML so user/model text can't inject markup (XSS-safe). */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/**
 * Tiny, safe Markdown → HTML for bot replies. Handles the common things the
 * model emits: **bold**, *italic*, `code`, links, and - / * / 1. bullet lists.
 * Escapes HTML first, so this can never inject markup. No external library.
 */
function renderMarkdown(raw: string): string {
  const inline = (t: string) =>
    escapeHtml(t)
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')

  const lines = raw.split('\n')
  let html = ''
  let inList = false
  for (const line of lines) {
    const li = line.match(/^\s*(?:[-*]|\d+\.)\s+(.*)$/)
    if (li) {
      if (!inList) { html += '<ul>'; inList = true }
      html += `<li>${inline(li[1])}</li>`
    } else {
      if (inList) { html += '</ul>'; inList = false }
      if (line.trim()) html += `<p>${inline(line)}</p>`
    }
  }
  if (inList) html += '</ul>'
  return html
}

// Editable settings from the CMS Chat global (all optional — defaults below).
type ContactField = { label: string; type?: 'text' | 'email'; required?: boolean }

export type ChatSettings = {
  assistantName?: string
  statusText?: string
  greeting?: string
  placeholder?: string
  chips?: { label: string; question: string }[]
  contactIntro?: string
  contactFields?: ContactField[]
  startButtonLabel?: string
  launcherColor?: string
  userBubbleColor?: string
  headerAccent?: string
  panelBg?: string
  botBubbleColor?: string
  textColor?: string
  startButtonColor?: string
  startButtonTextColor?: string
}

const DEFAULT_CONTACT_FIELDS: ContactField[] = [
  { label: 'Name', type: 'text', required: true },
  { label: 'Email', type: 'email', required: true },
  { label: 'Company', type: 'text', required: true },
  { label: 'Job title', type: 'text', required: true },
]

const DEFAULTS = {
  assistantName: 'Orion Assistant',
  statusText: 'Online now',
  greeting:
    "Hi, I'm Orion — your media assistant. Ask me anything about our services, clients, or how to get started.",
  placeholder: 'Ask about campaigns, services…',
  contactIntro: 'Please introduce yourself so our team can follow up:',
  startButtonLabel: 'Start chat',
  chips: [
    { label: 'Services', question: 'What services do you offer?' },
    { label: 'Clients', question: 'Which clients have you worked with?' },
    { label: 'Get a quote', question: 'How do I get a quote?' },
  ],
}

/** Stable key for a field label, used as the form-state key + payload key. */
const fieldKey = (label: string) =>
  label.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'field'

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

export default function ChatWidget({ settings = {} }: { settings?: ChatSettings }) {
  const contactFields = settings.contactFields?.length
    ? settings.contactFields
    : DEFAULT_CONTACT_FIELDS
  const cfg = {
    assistantName: settings.assistantName || DEFAULTS.assistantName,
    statusText: settings.statusText || DEFAULTS.statusText,
    greeting: settings.greeting || DEFAULTS.greeting,
    placeholder: settings.placeholder || DEFAULTS.placeholder,
    chips: settings.chips?.length ? settings.chips : DEFAULTS.chips,
    contactIntro: settings.contactIntro || DEFAULTS.contactIntro,
    startButtonLabel: settings.startButtonLabel || DEFAULTS.startButtonLabel,
    launcherColor: settings.launcherColor,
    userBubbleColor: settings.userBubbleColor,
    headerAccent: settings.headerAccent,
    panelBg: settings.panelBg,
    botBubbleColor: settings.botBubbleColor,
    textColor: settings.textColor,
    startButtonColor: settings.startButtonColor || settings.launcherColor || '#4c7cff',
    startButtonTextColor: settings.startButtonTextColor || '#ffffff',
  }

  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)
  const opened = useRef(false)

  // Required contact gate — dynamic fields from the CMS.
  const [contact, setContact] = useState<Record<string, string>>({})
  const [started, setStarted] = useState(false)

  const emailRe = /\S+@\S+\.\S+/
  const contactValid = contactFields.every((f) => {
    if (!f.required) return true
    const v = (contact[fieldKey(f.label)] || '').trim()
    if (!v) return false
    if (f.type === 'email') return emailRe.test(v)
    return true
  })

  // Map dynamic fields onto the escalation's known slots by best-guess of the
  // label, so name/email/company/job still populate the CMS record.
  function contactSlots() {
    const get = (...keys: string[]) => {
      for (const [label, val] of Object.entries(contact)) {
        if (keys.some((k) => label.includes(k))) return val
      }
      return ''
    }
    return {
      visitor_name: get('name'),
      visitor_email: get('email'),
      visitor_company: get('company'),
      visitor_job: get('job', 'title', 'role'),
      // Full form (all fields) so nothing is lost even with custom fields.
      visitor_details: contactFields
        .map((f) => `${f.label}: ${contact[fieldKey(f.label)] || ''}`)
        .join('\n'),
    }
  }

  useEffect(() => {
    bodyRef.current?.scrollTo(0, bodyRef.current.scrollHeight)
  }, [msgs, typing])

  function greetOnce() {
    if (opened.current) return
    opened.current = true
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMsgs([{ role: 'assistant', text: cfg.greeting }])
    }, 500)
  }

  // gentle auto-open after visitors settle in (kept from the reference)
  useEffect(() => {
    const t = setTimeout(() => setOpen(true), 15000)
    return () => clearTimeout(t)
  }, [])

  function startChat() {
    if (!contactValid) return
    setStarted(true)
    greetOnce()
  }

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
          ...contactSlots(),
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
    // Only greet once the contact form is done; otherwise the form shows first.
    setOpen((o) => {
      const next = !o
      if (next && started) greetOnce()
      return next
    })
  }

  return (
    <>
      <button
        className={`chat-launcher${open ? ' open' : ''}`}
        onClick={toggle}
        aria-label={`Open ${cfg.assistantName}`}
        style={cfg.launcherColor ? { background: cfg.launcherColor } : undefined}
      >
        <svg className="chat-ic" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 5.94 2 10.8c0 2.77 1.48 5.24 3.8 6.86-.12.98-.5 2.5-1.55 3.9-.17.22.01.54.28.5 2.02-.3 3.7-1.1 4.83-1.78.85.2 1.74.32 2.64.32 5.52 0 10-3.94 10-8.8S17.52 2 12 2z" /></svg>
        <svg className="close-ic" viewBox="0 0 24 24"><path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.3 19.7l-1.41-1.41L9.19 12 2.89 5.71 4.3 4.29l6.29 6.3 6.29-6.3z" /></svg>
      </button>

      <div
        className={`chat-panel${open ? ' open' : ''}`}
        style={{
          ...(cfg.panelBg ? { background: cfg.panelBg } : {}),
          ...(cfg.textColor ? { color: cfg.textColor } : {}),
        }}
      >
        <div
          className="chat-head"
          style={
            cfg.headerAccent
              ? {
                  // Solid, clearly-visible header in the chosen color (with a
                  // subtle darkening gradient so text stays readable).
                  background: `linear-gradient(135deg, ${cfg.headerAccent}, ${cfg.headerAccent}cc)`,
                }
              : undefined
          }
        >
          <div className="belt"><span /><span /><span /></div>
          <div className="titles">
            <strong>{cfg.assistantName}</strong>
            <span><span className="dot-live" />{cfg.statusText}</span>
          </div>
        </div>
        {!started ? (
          // Required contact gate — dynamic fields from the CMS.
          <div className="chat-contact" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ margin: 0, fontSize: 14, opacity: 0.85 }}>{cfg.contactIntro}</p>
            {contactFields.map((f, i) => {
              const key = fieldKey(f.label)
              return (
                <input
                  key={i}
                  value={contact[key] || ''}
                  onChange={(e) => setContact((c) => ({ ...c, [key]: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && startChat()}
                  placeholder={f.required ? `${f.label} *` : f.label}
                  type={f.type === 'email' ? 'email' : 'text'}
                  style={{
                    padding: '9px 11px',
                    borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'rgba(255,255,255,0.06)',
                    color: 'inherit',
                  }}
                />
              )
            })}
            <button
              onClick={startChat}
              disabled={!contactValid}
              style={{
                marginTop: 4,
                padding: '10px',
                borderRadius: 8,
                border: 'none',
                cursor: contactValid ? 'pointer' : 'not-allowed',
                opacity: contactValid ? 1 : 0.5,
                background: cfg.startButtonColor,
                color: cfg.startButtonTextColor,
                fontWeight: 600,
              }}
            >
              {cfg.startButtonLabel}
            </button>
          </div>
        ) : (
          <>
            <div className="chat-body" ref={bodyRef}>
              {msgs.map((m, i) => (
                <div
                  key={i}
                  className={`msg ${m.role === 'user' ? 'user' : 'bot'}`}
                  style={
                    m.role === 'user'
                      ? cfg.userBubbleColor
                        ? { background: cfg.userBubbleColor }
                        : undefined
                      : {
                          ...(cfg.botBubbleColor ? { background: cfg.botBubbleColor } : {}),
                          ...(cfg.textColor ? { color: cfg.textColor } : {}),
                        }
                  }
                >
                  {m.role === 'user' ? (
                    m.text
                  ) : (
                    <div
                      className="msg-md"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(m.text) }}
                    />
                  )}
                </div>
              ))}
              {typing && <div className="typing"><span /><span /><span /></div>}
            </div>
            <div className="chat-suggestions">
              {cfg.chips.map((c, i) => (
                <button key={i} className="chip" onClick={() => respond(c.question)}>{c.label}</button>
              ))}
            </div>
            <div className="chat-input-row">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder={cfg.placeholder}
                autoComplete="off"
              />
              <button
                onClick={send}
                aria-label="Send"
                style={cfg.launcherColor ? { background: cfg.launcherColor } : undefined}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M2 21l21-9L2 3v7l15 2-15 2z" /></svg>
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
