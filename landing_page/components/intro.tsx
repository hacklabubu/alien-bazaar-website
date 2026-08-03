'use client'

import { useEffect, useRef, useState } from 'react'

import './intro.css'

/**
 * Intro sequence for the Warsaw 2026 lander.
 *
 * One 2.5s run in three acts — handshake, arming, lock — inside a ruled
 * technical frame that never leaves. The acts escalate rather than simply
 * following one another: the terminal gets in, the lab arms itself, and the
 * event is sighted. A status rail along the bottom tracks all three, so the
 * frame and the rail are the constants and only the middle swaps.
 *
 * Press 1 or R to replay, Escape or click to skip.
 *
 * The run ends on a timer and nothing else. An `animationend` listener would
 * be the obvious way to close it out, but those do not fire on a backgrounded
 * tab, which would leave a full-screen panel over the page forever.
 */

export const INTRO_MS = 2500

/** Act boundaries, in ms from mount. Everything below is keyed off these. */
const ACT = {
  handshakeIn: 0,
  handshakeOut: 820,
  armIn: 860,
  armOut: 1620,
  lockIn: 1660,
  lockOut: 2400,
} as const

/** Deterministic stand-in for noise, so a replay looks identical. */
const noise = (i: number) => ((i * 9301 + 49297) % 233280) / 233280

const GLYPHS = '0123456789ABCDEF#%&/\\<>=*+·'

/**
 * Resolves a string left to right out of scrambled glyphs. Frame-driven
 * rather than interval-driven so it tracks real elapsed time and cannot
 * drift out of step with the CSS timeline it plays against.
 */
function useScramble(text: string, delay: number, duration: number) {
  const [out, setOut] = useState(() => ' '.repeat(text.length))
  const raf = useRef(0)

  useEffect(() => {
    let start = 0
    const step = (t: number) => {
      if (!start) start = t
      const p = Math.min(1, Math.max(0, (t - start - delay) / duration))
      const settled = Math.floor(p * text.length)
      let s = ''
      for (let i = 0; i < text.length; i++) {
        const ch = text[i] ?? ''
        if (i < settled || ch === ' ' || ch === '—' || ch === '-') s += ch
        else s += GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
      }
      setOut(s)
      if (p < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
  }, [text, delay, duration])

  return out
}

/** Five, not eight: the act is 760ms and this has to read as a sweep. */
const CHECKS = [
  'DRONE CAGE',
  'ARM CELL',
  'PRINT FARM',
  'PARTS WALL',
  'SEATS 200',
]

const STAGES = [
  { label: 'Handshake', at: ACT.handshakeIn + 120 },
  { label: 'Arming', at: ACT.armIn + 60 },
  { label: 'Lock', at: ACT.lockIn + 60 },
]

/** The ruled frame and registration marks. Present for the whole run. */
function Frame() {
  return (
    <div className='hw26-i-frame'>
      <i className='hw26-i-frame-r hw26-i-frame-r--t' />
      <i className='hw26-i-frame-r hw26-i-frame-r--b' />
      <i className='hw26-i-frame-r hw26-i-frame-r--l' />
      <i className='hw26-i-frame-r hw26-i-frame-r--r' />
      {['tl', 'tr', 'bl', 'br'].map((c, i) => (
        <i
          className={`hw26-i-frame-x hw26-i-frame-x--${c}`}
          key={c}
          style={{ animationDelay: `${260 + i * 60}ms` }}
        />
      ))}
    </div>
  )
}

function Sequence() {
  const host = useScramble('HACKER-HOUSE-WARSAW', 120, 420)
  const key = useScramble('9F4C-A17E-002B-HWWAW26', 260, 480)
  const coord = useScramble('52.2297N 21.0122E', ACT.lockIn, 600)

  return (
    <div className='hw26-i-seq'>
      <Frame />

      {/* ---- ACT 1 — HANDSHAKE ---- */}
      <div
        className='hw26-i-act'
        style={{
          ['--in' as string]: `${ACT.handshakeIn}ms`,
          ['--out' as string]: `${ACT.handshakeOut}ms`,
        }}
      >
        <div className='hw26-i-term'>
          <p className='hw26-i-term-line' style={{ animationDelay: '60ms' }}>
            <span className='hw26-i-caret'>$</span> uplink --host <b>{host}</b>
          </p>
          <p className='hw26-i-term-line' style={{ animationDelay: '260ms' }}>
            <span className='hw26-i-caret'>$</span> negotiating cipher
            <span className='hw26-i-ell' />
          </p>
          <div className='hw26-i-key'>
            <span>KEY</span>
            <b>{key}</b>
          </div>
          <div className='hw26-i-meter'>
            <i />
          </div>
          <p className='hw26-i-grant'>Access granted</p>
        </div>
      </div>

      {/* ---- ACT 2 — ARMING ---- */}
      <div
        className='hw26-i-act'
        style={{
          ['--in' as string]: `${ACT.armIn}ms`,
          ['--out' as string]: `${ACT.armOut}ms`,
        }}
      >
        <div className='hw26-i-arm'>
          <div className='hw26-i-caution'>
            <i />
            <span>Master caution</span>
          </div>
          <div className='hw26-i-checks'>
            {CHECKS.map((c, i) => (
              <p
                key={c}
                style={{ animationDelay: `${ACT.armIn + 40 + i * 78}ms` }}
              >
                <span className='hw26-i-check-n'>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className='hw26-i-check-k'>{c}</span>
                <span className='hw26-i-dots' />
                <b style={{ animationDelay: `${ACT.armIn + 190 + i * 78}ms` }}>
                  OK
                </b>
              </p>
            ))}
          </div>
        </div>
      </div>

      {/* ---- ACT 3 — LOCK ---- */}
      <div
        className='hw26-i-act'
        style={{
          ['--in' as string]: `${ACT.lockIn}ms`,
          ['--out' as string]: `${ACT.lockOut}ms`,
        }}
      >
        <div className='hw26-i-lock'>
          <div className='hw26-i-lock-lines' />
          <div className='hw26-i-hair hw26-i-hair--h' />
          <div className='hw26-i-hair hw26-i-hair--v' />

          <div className='hw26-i-box'>
            {['tl', 'tr', 'bl', 'br'].map((c) => (
              <i className={`hw26-i-box-c hw26-i-box-c--${c}`} key={c} />
            ))}
            {/* Two copies: the lit one is clipped to the scan bar's path, so
                the letters are developed by the light crossing them rather
                than simply faded in. */}
            <span className='hw26-i-mark'>
              <span className='hw26-i-mark-base'>Warsaw 26</span>
              <span className='hw26-i-mark-lit'>Warsaw 26</span>
            </span>
          </div>

          <div className='hw26-i-scan' />
          <p className='hw26-i-coord'>{coord}</p>
          <p className='hw26-i-lockword'>Lock</p>
        </div>
      </div>

      {/* ---- persistent status rail ---- */}
      <div className='hw26-i-rail'>
        <span className='hw26-i-rail-id'>HW—WAW—26</span>
        <div className='hw26-i-rail-stages'>
          {STAGES.map((s, i) => (
            <span
              className='hw26-i-stage'
              key={s.label}
              style={{ animationDelay: `${s.at}ms` }}
            >
              <i />
              {s.label}
              {i < STAGES.length - 1 ? (
                <em className='hw26-i-stage-sep' />
              ) : null}
            </span>
          ))}
        </div>
        <span className='hw26-i-rail-bars'>
          {Array.from({ length: 12 }, (_, i) => (
            <i
              key={`r${i}`}
              style={{
                animationDelay: `${200 + i * 40}ms`,
                ['--h' as string]: `${30 + noise(i) * 70}%`,
              }}
            />
          ))}
        </span>
      </div>
    </div>
  )
}

export function HardwareIntro() {
  // `null` means nothing is playing. `id` forces a fresh mount so the run
  // can be replayed from the top.
  const [run, setRun] = useState<{ id: number } | null>(null)
  const [ready, setReady] = useState(false)

  // Decide on the client only. Rendering the overlay during SSR would put a
  // full-screen panel in the static HTML, which is what anyone with scripting
  // off would be left staring at.
  useEffect(() => {
    setReady(true)
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setRun({ id: 0 })
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (event.key === 'Escape') {
        setRun(null)
        return
      }
      if (event.key === '1' || event.key.toLowerCase() === 'r') {
        setRun((prev) => ({ id: (prev?.id ?? 0) + 1 }))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // One timer per run, cleared on replay. The cleanup is what guarantees the
  // overlay cannot outlive its 2.5s even if the key is mashed mid-sequence.
  useEffect(() => {
    if (!run) return
    const id = window.setTimeout(() => setRun(null), INTRO_MS)
    return () => window.clearTimeout(id)
  }, [run])

  // Hold the page still for the duration. The cleanup always runs, so an
  // error mid-sequence cannot leave the document unscrollable.
  useEffect(() => {
    if (!run) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [run])

  if (!ready || !run) return null

  return (
    <div
      aria-hidden='true'
      className='hw26-intro'
      key={run.id}
      onClick={() => setRun(null)}
      style={{ ['--hw-i-dur' as string]: `${INTRO_MS}ms` }}
    >
      <Sequence />
    </div>
  )
}
