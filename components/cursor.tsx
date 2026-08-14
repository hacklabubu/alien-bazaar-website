'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import './cursor.css'

/**
 * The page's pointer, drawn in the DOM instead of by the compositor.
 *
 * A native `cursor: url()` is one fixed image, and this page is not one fixed
 * colour: the mint crosshair vanishes the moment it crosses the mint apply
 * button, and reads as a smudge over the photo plates. Two stacked fixed
 * elements can do what the image cannot — decide their colour from what is
 * actually behind them, per pixel. The compositing that achieves it lives in
 * cursor.css, which is where the explanation lives too; the short version is
 * that the first layer thresholds the backdrop to black-or-white and the
 * second multiplies mint over it, so every cursor pixel comes out either
 * phosphor mint (over something dark) or pure black (over something light).
 *
 * Three things about this file follow from that and are not free choices:
 *
 * - The pair is rendered through `createPortal` into `document.body`. Any
 *   ancestor with `filter`, `opacity < 1`, `mask`, `mix-blend-mode` or
 *   `isolation: isolate` establishes a Backdrop Root and the threshold layer
 *   would sample that group instead of the page. `.hw26` and half its
 *   sections have exactly those.
 *
 * - The transform is written straight onto the nodes in the pointermove
 *   handler, not held in state and not deferred to a rAF. Both would add a
 *   frame of lag to the one element on the page whose whole job is to sit
 *   under the user's hand, and a cursor that trails the mouse is worse than
 *   no custom cursor at all.
 *
 * - It only takes over when it can. Behind a capability gate — a real
 *   pointing device, and backdrop-filter support — and when the gate fails
 *   nothing renders and the `hw26-cursor-dom` class is never stamped, which
 *   leaves lander.css's native `cursor: url()` rules in force as the
 *   fallback. That gating is why there is no `!important` anywhere.
 *
 * Nothing renders on the server or before the mount effect, so there is no
 * hydration mismatch to arrange around.
 */

/** The three marks, as the class suffix each state puts on both layers. */
type Mark = '' | 'text' | 'press'

/** Things you press. Checked first — an anchor inside a `<dd>` is pressable
 *  before it is prose, which is the same precedence the native rules got out
 *  of source order. */
const PRESSABLE = 'a, button:not(:disabled), [role="button"]'

/** Body copy. Block-level prose tags only, matching the native rule: a bare
 *  span on this page is as likely to be a stencil mark as a word. */
const PROSE =
  'p, h1, h2, h3, h4, h5, h6, dt, dd, li, th, td, blockquote, figcaption'

/** The mark is 32×32 and points from its middle, so the box is offset by half
 *  its own size — the same `16 16` hotspot the native rules declare. */
const HOTSPOT = 16

export function Cursor() {
  const thr = useRef<HTMLDivElement>(null)
  const tint = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  // Read in an effect rather than at first render — the server has no media
  // queries — and kept live, because a laptop that gets a mouse plugged into
  // it should pick this up without a reload, the same way BriefRain's
  // reduced-motion query is kept live.
  useEffect(() => {
    const supported =
      typeof CSS !== 'undefined' &&
      typeof CSS.supports === 'function' &&
      (CSS.supports('backdrop-filter', 'grayscale(1)') ||
        CSS.supports('-webkit-backdrop-filter', 'grayscale(1)'))
    if (!supported) return

    const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
    setReady(mq.matches)
    const onChange = () => setReady(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!ready) return
    const a = thr.current
    const b = tint.current
    if (!a || !b) return

    // The class that switches lander.css's native cursor rules off. Stamped
    // here and only here, so it is on exactly when this component is live.
    const root = document.documentElement
    root.classList.add('hw26-cursor-dom')

    let mark: Mark = ''
    let shown = false

    const setMark = (next: Mark) => {
      // Only touch the DOM when the state actually changed. A pointermove
      // that stays over the same kind of thing fires many times a second and
      // must cost nothing but the transform below.
      if (next === mark) return
      for (const el of [a, b]) {
        el.classList.toggle('hw26-cur--text', next === 'text')
        el.classList.toggle('hw26-cur--press', next === 'press')
      }
      mark = next
    }

    const setShown = (next: boolean) => {
      if (next === shown) return
      a.classList.toggle('hw26-cur--on', next)
      b.classList.toggle('hw26-cur--on', next)
      shown = next
    }

    const onMove = (e: PointerEvent) => {
      const t = `translate3d(${e.clientX - HOTSPOT}px, ${
        e.clientY - HOTSPOT
      }px, 0)`
      a.style.transform = t
      b.style.transform = t
      setShown(true)

      const target = e.target instanceof Element ? e.target : null
      if (!target) {
        setMark('')
        return
      }
      setMark(
        target.closest(PRESSABLE) ? 'press' : target.closest(PROSE) ? 'text' : ''
      )
    }

    // Leaving the window has to hide it, or the mark is left stranded at the
    // edge of a page nobody is pointing at any more. `pointerout` with a null
    // `relatedTarget` is the event that actually fires when the pointer
    // crosses the window edge; `blur` covers tabbing or cmd-tabbing away,
    // which produces no pointer event at all.
    const onOut = (e: PointerEvent) => {
      if (!e.relatedTarget) setShown(false)
    }
    const onBlur = () => setShown(false)

    document.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerout', onOut, { passive: true })
    window.addEventListener('blur', onBlur)

    return () => {
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerout', onOut)
      window.removeEventListener('blur', onBlur)
      root.classList.remove('hw26-cursor-dom')
    }
  }, [ready])

  if (!ready) return null

  // Two siblings, in this order and not nested: the threshold layer paints
  // first, the tint multiplies over it second. See cursor.css.
  return createPortal(
    <>
      <div aria-hidden='true' className='hw26-cur hw26-cur--thr' ref={thr} />
      <div aria-hidden='true' className='hw26-cur hw26-cur--tint' ref={tint} />
    </>,
    document.body
  )
}
