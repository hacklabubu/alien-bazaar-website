'use client'

import { useEffect, useRef, useState } from 'react'

import './intro.css'

/**
 * Cold start — the intro sequence for the Warsaw 2026 lander.
 *
 * One composition rather than a run of scenes. The wordmark is on screen for
 * the entire 2.5s, outlined from the first frame, and everything else happens
 * *around* it at the same time: the frame rules itself in, a telemetry log
 * streams down one side, the lab reports its subsystems down the other, a
 * spectrum runs along the floor, a scan bar crosses and develops the letters,
 * and a reticle closes on them. The sequence lives in where the emphasis
 * moves, not in panels being swapped out.
 *
 * At the end the instruments retract and the mark is the only thing left, so
 * the last frame of the intro is the first frame of the page.
 *
 * Press 1 or R to replay, Escape or click to skip.
 *
 * The run ends on a timer and nothing else. An `animationend` listener would
 * be the obvious way to close it out, but those do not fire on a backgrounded
 * tab, which would leave a full-screen panel over the page forever.
 */

export const INTRO_MS = 2500

/** When the instruments start clearing out and the mark is left alone. */
const RETRACT_MS = 2040

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

/** Streams down the left. Machine chatter — atmosphere, not reading matter. */
const LOG = [
  'ACQ  52.2297N 21.0122E',
  'NODE HACKER-HOUSE-01',
  'LINK 10G  LAT 0.4MS',
  'PWR  3-PHASE STABLE',
  'CAGE VOL 6x6x4  ARMED',
  'CELL 6DOF  HOMED',
  'FARM 12 NODES  Q:0',
  'WALL STOCK NOMINAL',
  'TRK  04 ACTIVE',
  'SEATS 200 / 200 HELD',
]

/** Reports down the right. Each flicks to OK on its own schedule. */
const CHECKS = [
  { k: 'CAGE', at: 420 },
  { k: 'ARM CELL', at: 560 },
  { k: 'PRINT FARM', at: 700 },
  { k: 'PARTS WALL', at: 840 },
  { k: 'BENCHES', at: 980 },
  { k: 'SEATS', at: 1120 },
]

const STAGES = [
  { label: 'Link', at: 260 },
  { label: 'Armed', at: 1180 },
  { label: 'Lock', at: 1760 },
]

function Hud() {
  const key = useScramble('9F4C-A17E-002B-HWWAW26', 220, 620)
  const coord = useScramble('52.2297N 21.0122E', 140, 520)

  return (
    <div className='hw26-i-hud'>
      {/* ---- the ruled frame, drawn in from the edges ---- */}
      <div className='hw26-i-frame'>
        <i className='hw26-i-frame-r hw26-i-frame-r--t' />
        <i className='hw26-i-frame-r hw26-i-frame-r--b' />
        <i className='hw26-i-frame-r hw26-i-frame-r--l' />
        <i className='hw26-i-frame-r hw26-i-frame-r--r' />
        {['tl', 'tr', 'bl', 'br'].map((c, i) => (
          <i
            className={`hw26-i-frame-x hw26-i-frame-x--${c}`}
            key={c}
            style={{ animationDelay: `${240 + i * 55}ms` }}
          />
        ))}
      </div>

      {/* ---- the mark. On screen from the first frame to the last. ---- */}
      <div className='hw26-i-core'>
        <div className='hw26-i-reticle'>
          {['tl', 'tr', 'bl', 'br'].map((c) => (
            <i className={`hw26-i-ret hw26-i-ret--${c}`} key={c} />
          ))}
        </div>
        {/* Two copies. The lit one is clipped to the scan bar's path, so the
            letters are developed by the light crossing them rather than
            faded in. */}
        <span className='hw26-i-mark'>
          <span className='hw26-i-mark-base'>Warsaw 26</span>
          <span className='hw26-i-mark-lit'>Warsaw 26</span>
        </span>
        <p className='hw26-i-coord'>{coord}</p>
      </div>

      {/* ---- telemetry, left ---- */}
      <div className='hw26-i-log'>
        {LOG.map((l, i) => (
          <p key={l} style={{ animationDelay: `${180 + i * 82}ms` }}>
            {l}
          </p>
        ))}
      </div>

      {/* ---- subsystems, right ---- */}
      <div className='hw26-i-checks'>
        <p className='hw26-i-checks-h'>Subsystems</p>
        {CHECKS.map((c) => (
          <p key={c.k} style={{ animationDelay: `${c.at - 180}ms` }}>
            <span>{c.k}</span>
            <i className='hw26-i-dots' />
            <b style={{ animationDelay: `${c.at}ms` }}>OK</b>
          </p>
        ))}
        <div className='hw26-i-keyline'>
          <span>KEY</span>
          <b>{key}</b>
        </div>
      </div>

      {/* ---- spectrum along the floor ---- */}
      <div className='hw26-i-spectrum'>
        {Array.from({ length: 64 }, (_, i) => (
          <i
            key={`s${i}`}
            style={{
              animationDelay: `${140 + i * 12}ms`,
              ['--h' as string]: `${10 + noise(i * 5) * 90}%`,
            }}
          />
        ))}
      </div>

      {/* ---- the bar that crosses everything ---- */}
      <div className='hw26-i-scan' />
      <div className='hw26-i-scanlines' />

      {/* ---- status rail ---- */}
      <div className='hw26-i-rail'>
        <span className='hw26-i-rail-id'>HW—WAW—26</span>
        <div className='hw26-i-rail-stages'>
          {STAGES.map((s) => (
            <span
              className='hw26-i-stage'
              key={s.label}
              style={{ animationDelay: `${s.at}ms` }}
            >
              <i />
              {s.label}
            </span>
          ))}
        </div>
        <span className='hw26-i-lockword'>Lock</span>
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
      style={{
        ['--hw-i-dur' as string]: `${INTRO_MS}ms`,
        ['--hw-i-retract' as string]: `${RETRACT_MS}ms`,
      }}
    >
      <Hud />
    </div>
  )
}
