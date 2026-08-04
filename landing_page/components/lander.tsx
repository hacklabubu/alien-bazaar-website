'use client'

import {
  GeistPixelCircle,
  GeistPixelGrid,
  GeistPixelLine,
  GeistPixelSquare,
} from 'geist/font/pixel'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

import './lander.css'
import { HardwareIntro } from './intro'
import { APPLY_URL, type HardwareEvent } from '../lib/event'

/**
 * Alien Bazaar — Warsaw 2026. The event's own landing page.
 *
 * Neoindustrial: machine-shop signage read through a phosphor terminal.
 * Structure carries meaning rather than decorating it — the rig panels carry
 * a unit count because the booking sheet is finite and that number is the
 * whole constraint, the mint accent marks both the interactive and the gates
 * that can cost you something, and the light section is a parts catalogue
 * because that is what the lab inventory is.
 *
 * The page ships two themes, dark by default; the toggle stamps data-theme
 * on <html> and the palette tokens in lander.css do the rest.
 *
 * Facts come from the event row, so the page cannot drift from
 * `/hackathons/<slug>`. Copy that is not in the database lives here.
 */

/** The saucer, drawn in blocks so it holds shape in any monospace face. */
const UFO_CRAFT = `▄▄▄▄▄▄▄
▄██████████▄
▄████████████████▄
██████████████████████
▀▀████████████████▀▀
▀▀▀▀▀▀▀▀▀▀`

/** Running lights, cycled to make the craft read as powered. */
const UFO_LIGHTS = [
  'O   o   o   o',
  'o   O   o   o',
  'o   o   O   o',
  'o   o   o   O',
]

const TICKER = [
  { label: '48 WORK HOURS' },
  { label: 'THEME — HOME AUTOMATION', mint: true },
  { label: 'ONE MACHINE PER TEAM' },
  { label: 'TEAMS INTEGRATE WITH TEAMS', mint: true },
  { label: 'HACKER HOUSE / WARSAW' },
  { label: 'ARMS · COBOTS · DRONES · CAMERAS · MONOWHEELS · HUMANOIDS' },
  { label: 'OPEN STOCK, NO BOOKING SHEET' },
  { label: 'PITCH DAY 28 SEP', mint: true },
  { label: 'APPLICATIONS CLOSE 12 SEP', mint: true },
]

/**
 * The theme. Deliberately domestic and deliberately broad: a house is the one
 * environment every reader already has a problem with, and it is large enough
 * that two teams pointing at it from different directions still end up in the
 * same building.
 */
const DOMAINS = [
  'Lights',
  'Cleaning',
  'Security',
  'Welcoming guests',
  'Damage monitoring',
  'Repairs',
  'Whatever else a house needs',
]

/**
 * How a build actually happens here, in the order it happens. This replaced
 * the old track system: there is no category you compete inside any more, so
 * the thing that needs explaining is the booking-plus-collaboration mechanic,
 * and it needs explaining before the inventory rather than after it.
 */
const PROTOCOL = [
  {
    step: 'STEP 01',
    name: 'Book one machine',
    what: 'One per team, reserved by 12 September. Six kinds on the floor and a fixed number of each, so the sheet runs out — book the machine your idea cannot work without.',
  },
  {
    step: 'STEP 02',
    name: 'Find other teams',
    what: 'One partner team, or four. Nothing forces you to, but one machine on its own rarely makes a house do anything worth two minutes of an investor’s attention.',
  },
  {
    step: 'STEP 03',
    name: 'Integrate',
    what: 'Wire the machines into a single system that solves something domestic. What gets pitched on Sunday is the integration — not your half of it.',
  },
]

/**
 * The bookable floor. One unit of one of these per team, which makes the unit
 * counts the most important number on the panel — they are what the booking
 * sheet is drawn against, so they get the display numeral rather than a
 * sequence number.
 *
 * Photography is what the house has on file. Where a photo does not depict
 * the machine it sits behind, the alt text still describes the photograph:
 * these are plates of the venue, not product shots, and the caption must not
 * claim otherwise.
 */
const RIGS = [
  {
    name: 'Robot arms',
    units: '06',
    kit: '6-axis · fenced cell · grippers',
    blurb:
      'Reach, speed, and repeatability behind a fence. In a house the arm is whatever actually picks the thing up, sorts it, or puts it back — pair it with something that can see.',
    photo: '/photos/robot-arm-01.jpg',
    alt: 'A yellow industrial robot arm on a factory line',
  },
  {
    name: 'Cobots',
    units: '04',
    kit: 'Force-limited · hand-guidable',
    blurb:
      'An arm safe to stand next to, which is the only kind that belongs in a kitchen. Teach it by moving it, then let a partner team’s code drive it.',
    photo: '/photos/robot-arm-03.jpg',
    alt: 'A robot arm at a welding station',
  },
  {
    name: 'Drones',
    units: '08',
    kit: 'Indoor · prop guards · autonomy',
    blurb:
      'The eyes that move. Indoor-safe platforms for inspection, damage spotting, and getting a camera into the one corner of a house nothing else can reach.',
    photo: '/photos/drone-01.jpg',
    alt: 'A quadcopter hovering in flight, its pilot on the controller behind it',
  },
  {
    name: 'Camera rigs',
    units: '05',
    kit: 'Pan-tilt-zoom · depth · tracking',
    blurb:
      'A house that watches. Motorised heads and depth arrays on stands — most integrations end up routing perception through one of these, so they go early.',
    photo: '/photos/hacker-01.jpg',
    alt: 'A person operating a workshop machine',
  },
  {
    name: 'Monowheel robots',
    units: '04',
    kit: 'Self-balancing · single wheel',
    blurb:
      'Small, quick, and genuinely awkward to control. The team that gets one balancing by Saturday morning becomes the team everyone else wants to integrate with.',
    photo: '/photos/printer-01.jpg',
    alt: 'A 3D printer mid-print',
  },
  {
    name: 'Humanoids',
    units: '02',
    kit: 'Bipedal · hands · teleop',
    blurb:
      'The hardest form factor in the building, and the shortest queue on the sheet. Book one expecting to spend the weekend with other teams hanging capability off it.',
    photo: '/photos/workshop-01.jpg',
    alt: 'A machine shop with lathes and tooling along the wall',
  },
]

/**
 * The print farm. Open stock like everything else in this section — the only
 * thing in the house that is booked is the one machine per team above.
 */
const PRINT_FARM = [
  {
    name: 'Formlabs 4L',
    qty: 'QTY 01',
    what: 'Large-format SLA for the parts that have to be right. Start it early — its jobs run long.',
  },
  {
    name: 'BambuLab H2D',
    qty: 'QTY 01',
    what: 'Dual-extrusion printing: supports that dissolve, parts in two materials, one job.',
  },
  {
    name: 'BambuLab P1S',
    qty: 'QTY 01',
    what: 'The enclosed workhorse. ABS and ASA without warping, fast enough to iterate between meals.',
  },
  {
    name: 'Bambu A1',
    qty: 'QTY 02',
    what: 'Two of them, so the queue for quick brackets and enclosures never blocks a real job.',
  },
  {
    name: 'Anycubic Resin',
    qty: 'QTY 01',
    what: 'For detail an FDM head cannot hold. Wash and cure station beside it.',
  },
]

/**
 * Everything else on the floor, none of it reserved. The house network is in
 * this list rather than in a footnote on purpose: a shared broker is what
 * makes two teams' machines able to talk on the first evening instead of the
 * last one, and it is the piece that makes the collaboration mechanic work
 * in practice rather than in principle.
 */
const OPEN_STOCK = [
  {
    name: 'House network',
    qty: 'LIVE',
    what: 'Event VLAN, wired and wireless, with an MQTT broker and a Home Assistant instance already running. Two teams can put their machines on the same bus before dinner on day one.',
  },
  {
    name: 'Camera modules',
    qty: 'QTY 40',
    what: 'USB and MIPI modules — global shutter, wide angle, low light. They live in a bin, not on a booking sheet.',
  },
  {
    name: 'Depth & LiDAR',
    qty: 'QTY 12',
    what: 'Depth cameras and 2D room scanners, for anything that has to know where the walls are before it moves.',
  },
  {
    name: 'NPU modules',
    qty: 'QTY 08',
    what: 'Provided by NVIDIA. Edge inference on the machine itself, for the models that will not fit on a microcontroller.',
  },
  {
    name: 'Microcontrollers',
    qty: 'OPEN',
    what: 'ESP32, Pico, and the usual dev boards by the tray, Wi-Fi and BLE on every one. The glue for most of what gets built here.',
  },
  {
    name: 'Smart-home stock',
    qty: 'OPEN',
    what: 'Matter and Zigbee bulbs, plugs, relays, locks, and blind motors — the ordinary fixtures your system is supposed to end up commanding.',
  },
  {
    name: 'Mics & speakers',
    qty: 'QTY 16',
    what: 'Far-field mic arrays and speakers, for the half of home automation that listens and answers rather than moves.',
  },
  {
    name: 'Electronics bench',
    qty: 'OPEN',
    what: 'Soldering stations, bench supplies, scopes, logic analysers, and a wall of passives, connectors, and wire.',
  },
  {
    name: 'Extrusion & fixings',
    qty: 'OPEN',
    what: 'Aluminium extrusion, brackets, bearings, and fasteners. The dull half of every rig that actually ends up working.',
  },
  {
    name: 'Your Own Rig',
    qty: 'OPEN',
    what: 'Not limited to the list. Bring your own equipment, or tell us what you need and we arrange delivery.',
  },
]

const PLATES = [
  {
    cls: 'hw26-plate--a',
    src: '/photos/workshop-01.jpg',
    alt: 'A machine shop with lathes and tooling along the wall',
    cap: 'Floor 01 — Machine shop',
  },
  {
    cls: 'hw26-plate--b',
    src: '/photos/printer-01.jpg',
    alt: 'A 3D printer mid-print',
    cap: 'Print farm',
  },
  {
    cls: 'hw26-plate--c',
    src: '/photos/robot-arm-03.jpg',
    alt: 'A robot arm at a welding station',
    cap: 'Arm cell',
  },
  {
    cls: 'hw26-plate--d',
    src: '/photos/hacker-01.jpg',
    alt: 'A person operating a workshop machine',
    cap: 'Benches',
  },
  {
    cls: 'hw26-plate--e',
    src: '/photos/printer-03.jpg',
    alt: 'Close-up of a 3D printer extruder',
    cap: 'Extruder detail',
  },
]

/**
 * The two halves of the funnel: what happens on the platform before anyone
 * gets a key, and what happens once the house opens. Dates, not clock times —
 * the gates here are the ones that can actually cost a team its seat.
 */
const FUNNEL = [
  { t: 'NOW', w: 'Join the wait-list on HackLab and pick the hackathon.' },
  {
    t: '12 SEP',
    w: 'Book the one machine your team will own for the weekend.',
    gate: true,
  },
  {
    t: '12 SEP',
    w: 'No team? Find 1–3 teammates on the platform, with an AI assistant doing the matchmaking.',
  },
  {
    t: '12 SEP',
    w: 'Submit the home-automation idea you will prototype on the machine you booked.',
    gate: true,
  },
  { t: '19 SEP', w: 'Organizers accept teams. Results go out.' },
]

const HOUSE = [
  {
    t: '26 SEP',
    w: 'Move into the house. The clock starts — 48 work hours.',
  },
  {
    t: '26 SEP',
    w: 'Find your partner teams and agree what the combined system has to do.',
  },
  {
    t: '27 SEP',
    w: 'Build. The open stock, the print farm, and the media floor run all day.',
  },
  {
    t: '28 SEP',
    w: 'Pitch day — private investors and venture fund partners.',
    gate: true,
  },
  {
    t: '28 SEP',
    w: 'The ecosystem chat opens, and the house keeps running as a hacker house.',
  },
]

/**
 * The two organizers. Rendered as typographic marks until the real logo
 * files land — drop an SVG in /public/sponsors and set `src` to swap one in.
 */
const ORGANIZERS = [
  {
    name: 'Hacklab',
    // White mark, drawn for the dark plate the organizer cells keep in
    // both themes.
    src: '/sponsors/hacklab.png' as string | null,
    href: 'https://hacklab.so',
    line: 'The platform the funnel runs on — registration, team matching, and hardware booking — and the house it all happens in.',
  },
  {
    name: 'Epikor',
    src: null as string | null,
    href: 'https://epikor.eu',
    line: 'The hardware on the floor, all of it: some their own — including the bicopter drones they build — and the rest sourced and brought in through their partners. Co-organizing the weekend alongside it.',
  },
]

/**
 * The three lead partners, given the full-width cells. Confirmed marks are the
 * official files, downloaded from each company's brand page and used
 * unmodified at full clear space, which is what every one of those guidelines
 * requires for sponsor identification. JetBrains has no file here yet, so it
 * falls back to the typographic mark the organizers use.
 *
 * Each line says what the partner actually provides, and nothing more. Two of
 * the three supply something physical; the third does not, and saying so is
 * better than padding the cell with a claim nobody made.
 */
const LEAD_SPONSORS = [
  {
    name: 'NVIDIA',
    src: '/sponsors/nvidia.svg' as string | null,
    href: 'https://www.nvidia.com',
    // Their two-colour mark is the stacked lockup, so matching Red Hat's
    // height would leave it reading half the size. Flagged for its own
    // sizing rather than hard-coding a height per sponsor.
    stacked: true,
    line: 'A batch of NPU modules in open stock, for teams running inference on the machine itself rather than off it.',
  },
  {
    name: 'Red Hat',
    src: '/sponsors/redhat-on-dark.svg' as string | null,
    href: 'https://www.redhat.com',
    stacked: false,
    line: 'Infrastructure for every team, and the platform workshops on day one.',
  },
  {
    name: 'JetBrains',
    src: null as string | null,
    href: 'https://www.jetbrains.com',
    stacked: false,
    line: 'Backing the weekend itself rather than the inventory — no hardware on the floor, their name on the event.',
  },
]

/**
 * The four forces the event puts in one building. This is the ecosystem
 * pitch in grid form — the hackathon is the entry point, not the product.
 */
const FORCES = [
  {
    name: 'Founders',
    tag: 'BUILD',
    what: 'Build a product with their hands, not on slides. The strongest teams are invited to stay in the house after the weekend.',
  },
  {
    name: 'Investors',
    tag: 'WATCH',
    what: 'Private investors and venture fund partners see teams in action all weekend, not in a deck after the fact.',
  },
  {
    name: 'Factories',
    tag: 'SUPPLY',
    what: 'Hardware partners provide the machines, watch real use cases of their products, and meet their next long-term founders.',
  },
  {
    name: 'Media',
    tag: 'RECORD',
    what: 'On the floor for the whole run — filming builders, talking to guests, documenting products being born in real time.',
  },
]

/**
 * The fixed half of the end plate's title block. The cells that depend on the
 * event row are rendered beside these so both halves stay one grid.
 */
const TITLE_BLOCK = [
  { k: 'Project', v: 'AB—WAW—26' },
  { k: 'Sheet', v: '07 / 07' },
  { k: 'Rev', v: '03' },
  { k: 'Status', v: 'Issued', tone: 'mint' },
  { k: 'Theme', v: 'Home automation' },
  { k: 'Venue', v: 'Hacker House' },
  { k: 'Coord', v: '52.2297°N 21.0122°E' },
  { k: 'Duration', v: '48 WORK H' },
]

/**
 * The rest of the partner wall. Every name here is a placeholder for this
 * prototype, marked TBC so a draft can never read as a claim — the three
 * confirmed partners are in the lead cells above.
 */
const REST_PARTNERS = [
  { name: 'Voltbend', tag: 'TBC' },
  { name: 'Meridian Robotics', tag: 'TBC' },
  { name: 'Nordhaus Systems', tag: 'TBC' },
  { name: 'Partwall', tag: 'TBC' },
  { name: 'Sigma Forge', tag: 'TBC' },
  { name: 'Kraków Motion', tag: 'TBC' },
]

function useReveal() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const nodes = root.current?.querySelectorAll('.hw26-reveal')
    if (!nodes?.length) return

    // No IntersectionObserver (or reduced motion) must never leave the page
    // blank — everything starts hidden, so the fallback is to show it all.
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (reduced || typeof IntersectionObserver === 'undefined') {
      for (const n of nodes) n.setAttribute('data-shown', 'true')
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.setAttribute('data-shown', 'true')
          io.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
    )
    for (const n of nodes) io.observe(n)
    return () => io.disconnect()
  }, [])

  return root
}

function Ufo() {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(
      () => setFrame((f) => (f + 1) % UFO_LIGHTS.length),
      420
    )
    return () => window.clearInterval(id)
  }, [])

  return (
    // Decorative. The page reads identically without it, so it is hidden
    // from assistive tech rather than announced as a wall of block glyphs.
    <div aria-hidden='true' className='hw26-ufo'>
      <pre className='hw26-ufo-craft'>{UFO_CRAFT}</pre>
      <pre className='hw26-ufo-lights'>{UFO_LIGHTS[frame]}</pre>
      <div className='hw26-ufo-beam' />
    </div>
  )
}

/**
 * Dark is the default; the inline script in the layout applies any stored
 * choice before paint, so this only has to read what is already on <html>
 * and flip it. The state exists purely to relabel the button.
 */
function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    if (document.documentElement.dataset.theme === 'light') setTheme('light')
  }, [])

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.dataset.theme = next
    try {
      window.localStorage.setItem('hw26-theme', next)
    } catch {
      // Storage can be blocked; the theme still applies for this visit.
    }
  }

  return (
    <button
      className='hw26-theme'
      onClick={toggle}
      type='button'
    >
      <i aria-hidden='true' />
      {theme === 'dark' ? 'Light mode' : 'Dark mode'}
    </button>
  )
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

/**
 * Month names come from the array above rather than from `month: 'short'`,
 * which is not portable: Node ships full ICU and abbreviates September as
 * "Sept" where browsers give "Sep". In a client component that is a hydration
 * mismatch on the first line of the hero. Only the numeric parts are asked of
 * Intl, because those agree everywhere, and the timezone still does the real
 * work of pinning the date to Warsaw rather than to the reader.
 */
function formatRange(startsAt: Date, endsAt: Date, timezone: string) {
  const parts = (date: Date) => {
    const raw = new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      timeZone: timezone,
    }).formatToParts(date)
    const get = (type: string) =>
      raw.find((part) => part.type === type)?.value ?? ''
    return {
      day: get('day'),
      month: MONTHS[Number(get('month')) - 1] ?? '',
      year: get('year'),
    }
  }

  const from = parts(startsAt)
  const to = parts(endsAt)
  return `${from.day} ${from.month} — ${to.day} ${to.month} ${to.year}`
}

export function Lander({ hackathon }: { hackathon: HardwareEvent }) {
  const root = useReveal()
  const dates = formatRange(
    hackathon.startsAt,
    hackathon.endsAt,
    hackathon.timezone
  )
  // The application lives on hacklab.so, not here. Set NEXT_PUBLIC_APPLY_URL
  // to point this at a local instance while developing.
  const applyHref = APPLY_URL

  return (
    /*
     * The four Geist Pixel cuts are attached here as CSS variables rather than
     * as classes on individual elements, so the scoped stylesheet can reach
     * them and the intro overlay inherits them too. Each cut has one job on
     * this page — see the type section of the stylesheet. Triangle is
     * deliberately unused.
     */
    <div
      className={`hw26 ${GeistPixelCircle.variable} ${GeistPixelGrid.variable} ${GeistPixelSquare.variable} ${GeistPixelLine.variable}`}
      ref={root}
    >
      {/* Plays once on load; 1–5 replay a variation, Esc or click skips.
          Mounts client-side only, so the page is fully readable without it. */}
      <HardwareIntro />

      {/* ---------------- HERO ---------------- */}
      <header className='hw26-hero'>
        <div className='hw26-grid' />
        <Ufo />

        <div className='hw26-hero-corner hw26-hero-corner--tl'>
          {/* `relative`, not `static`: the crosshair's arms are absolutely
              positioned against it, and a static box would hand them the
              corner wrapper instead and stretch them across it. */}
          <span className='hw26-cross' style={{ position: 'relative' }} />
          <span className='hw26-label hw26-label--mint'>AB—WAW—26</span>
        </div>
        <div className='hw26-hero-corner hw26-hero-corner--tr'>
          <span className='hw26-label'>52.2297°N 21.0122°E</span>
        </div>
        {/* The organisers moved into the hero proper, so this corner carries
            a sheet marking instead of repeating them. */}
        <div className='hw26-hero-corner hw26-hero-corner--bl'>
          <span className='hw26-label'>Rev 03 — Issued</span>
        </div>
        <div className='hw26-hero-corner hw26-hero-corner--br'>
          <span className='hw26-label'>Sheet 01 / 07</span>
        </div>

        <div className='hw26-hero-inner'>
          <h1 className='hw26-title'>
            <span className='hw26-title-row'>
              <span
                className='hw26-title-word hw26-glitch hw26-rise'
                data-text='Alien'
                style={{ animationDelay: '40ms' }}
              >
                Alien
              </span>
              <span className='hw26-title-rule' />
              <span className='hw26-title-tag'>48H / BUILD</span>
            </span>
            <span className='hw26-title-row'>
              <span
                className='hw26-title-word hw26-glitch hw26-rise'
                data-text='Bazaar'
                style={{ animationDelay: '140ms' }}
              >
                Bazaar
              </span>
            </span>
            <span className='hw26-title-row'>
              <span
                className='hw26-title-word hw26-title-word--hollow hw26-rise'
                style={{ animationDelay: '240ms' }}
              >
                Warsaw 26
              </span>
              <span className='hw26-title-rule' />
            </span>
          </h1>

          {/* "Alien Bazaar" says nothing about what the event is, so the
              descriptor has to carry it and sits immediately under the
              wordmark at display weight — second only to the name itself. */}
          <p className='hw26-subtitle hw26-rise' style={{ animationDelay: '310ms' }}>
            <span>Hardware hackathon</span>
            <i className='hw26-title-rule' />
          </p>

          {/* The partnership is the reason the event has a lab at all, so it
              sits directly under the title at display weight rather than in
              the corner marks with the sheet numbers. */}
          <div
            className='hw26-poweredby hw26-rise'
            style={{ animationDelay: '400ms' }}
          >
            <span className='hw26-label'>Powered by</span>
            <span className='hw26-poweredby-names'>
              {/* New tab on both: these lead off the site, and someone
                  checking who runs the event should not lose their place
                  on the way to applying. */}
              <a
                className='hw26-poweredby-link'
                href='https://hacklab.so'
                rel='noopener noreferrer'
                target='_blank'
              >
                Hacklab
              </a>
              <span className='hw26-poweredby-x'>×</span>
              <a
                className='hw26-poweredby-link'
                href='https://epikor.eu'
                rel='noopener noreferrer'
                target='_blank'
              >
                Epikor
              </a>
            </span>
            <span className='hw26-poweredby-rule' />
          </div>

          <dl
            className='hw26-hero-meta hw26-rise'
            style={{ animationDelay: '490ms' }}
          >
            <div>
              <dt>Dates</dt>
              <dd>{dates}</dd>
            </div>
            <div>
              <dt>Venue</dt>
              <dd>Hacker House, Warsaw</dd>
            </div>
            <div>
              <dt>Theme</dt>
              <dd>Home automation</dd>
            </div>
            <div>
              <dt>Hardware</dt>
              <dd>One machine per team</dd>
            </div>
            <div>
              <dt>Teams</dt>
              <dd>Up to {hackathon.maxTeamSize}</dd>
            </div>
            {hackathon.capacity ? (
              <div>
                <dt>Seats</dt>
                <dd>{hackathon.capacity}</dd>
              </div>
            ) : null}
          </dl>

          <div
            className='hw26-hero-actions hw26-rise'
            style={{ animationDelay: '580ms' }}
          >
            <a className='hw26-apply' href={applyHref}>
              Apply now
            </a>
            <span className='hw26-label hw26-label--mint'>
              Applications close 12 September
            </span>
          </div>
        </div>
      </header>

      {/* ---------------- TICKER ---------------- */}
      <div className='hw26-ticker'>
        {[0, 1].map((copy) => (
          <div
            aria-hidden={copy === 1}
            className='hw26-ticker-track'
            key={copy}
          >
            {TICKER.map((item) => (
              <span key={item.label}>
                {item.mint ? <b>{item.label}</b> : item.label}
                <span style={{ opacity: 0.4 }}>{' ///'}</span>
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* ---------------- THE BRIEF ---------------- */}
      <section className='hw26-section'>
        <div className='hw26-inner'>
          <div className='hw26-head hw26-reveal'>
            <span className='hw26-num'>02</span>
            <h2>Automate the house</h2>
            <span
              className='hw26-label hw26-label--mint'
              style={{ marginLeft: 'auto' }}
            >
              Theme / Home automation
            </span>
          </div>

          <p
            className='hw26-reveal'
            style={{
              maxWidth: '58ch',
              margin: '0 0 1.25rem',
              fontSize: '0.95rem',
              lineHeight: 1.75,
              color: 'var(--hw-bone)',
            }}
          >
            One theme for the whole weekend: the machines in a house, doing
            something the people in it actually want done. Nobody competes in a
            category — every team books a single machine, then goes and finds
            the other teams whose machines make theirs worth having.
          </p>

          <p
            className='hw26-label hw26-label--mint hw26-reveal'
            style={{ margin: '0 0 2.5rem', lineHeight: 2.2 }}
          >
            {DOMAINS.join('  ·  ')}
          </p>

          <dl className='hw26-kit hw26-reveal'>
            {PROTOCOL.map((item) => (
              <div className='hw26-kit-item' key={item.step}>
                <span className='hw26-kit-qty'>{item.step}</span>
                <dt>{item.name}</dt>
                <dd>{item.what}</dd>
              </div>
            ))}
          </dl>

          <div className='hw26-subhead hw26-reveal' style={{ marginTop: '3.5rem' }}>
            <span className='hw26-label hw26-label--mint'>
              The bookable floor
            </span>
            <span className='hw26-poweredby-rule' />
            <span className='hw26-label'>One per team · booked by 12 SEP</span>
          </div>

          <div className='hw26-rigs'>
            {RIGS.map((rig, i) => (
              <article
                className='hw26-rig hw26-reveal'
                key={rig.name}
                style={{ transitionDelay: `${i * 90}ms` }}
              >
                <div className='hw26-rig-photo'>
                  <Image
                    alt={rig.alt}
                    fill
                    sizes='(max-width: 900px) 100vw, 50vw'
                    src={rig.photo}
                  />
                </div>
                <div>
                  {/* The display numeral is the unit count, not a sequence
                      number: with one machine per team it is the only figure
                      on the panel that decides anything. */}
                  <div className='hw26-rig-no'>{rig.units}</div>
                  <span className='hw26-label hw26-label--mint hw26-rig-units'>
                    On the floor
                  </span>
                  <h3 className='hw26-rig-name'>{rig.name}</h3>
                  <p className='hw26-rig-blurb'>{rig.blurb}</p>
                </div>
                <div className='hw26-rig-spec'>
                  <span className='hw26-label'>{rig.kit}</span>
                </div>
              </article>
            ))}
          </div>

          <p
            className='hw26-reveal'
            style={{
              marginTop: '2.5rem',
              maxWidth: '60ch',
              fontSize: '0.9rem',
              lineHeight: 1.8,
              color: 'var(--hw-bone)',
            }}
          >
            Not on the list? Propose your own machine with your own equipment —
            we will help you run it on what the house has, or arrange delivery
            of what it does not. The theme is fixed; the hardware is only fixed
            by what fits through the door.
          </p>
        </div>
      </section>

      {/* ---------------- THE LAB ---------------- */}
      <section className='hw26-section hw26-paper'>
        <div className='hw26-grid' />
        <div className='hw26-inner'>
          <div className='hw26-head hw26-reveal'>
            <span className='hw26-num'>03</span>
            <h2>The open floor</h2>
            <span className='hw26-label' style={{ marginLeft: 'auto' }}>
              No booking / all three days
            </span>
          </div>

          <p
            className='hw26-reveal'
            style={{
              maxWidth: '58ch',
              margin: '0 0 2.5rem',
              fontSize: '0.95rem',
              lineHeight: 1.75,
              color: 'var(--hw-bone)',
            }}
          >
            Your booked machine is the only thing in this house with your name
            on it. Everything below is open stock — no sheet, no reservation,
            take what the build needs and put it back. Design it one day, hold
            it the next. The printers go first.
          </p>

          <div className='hw26-subhead hw26-reveal'>
            <span className='hw26-label hw26-label--mint'>Print farm</span>
            <span className='hw26-poweredby-rule' />
          </div>

          <dl className='hw26-kit hw26-reveal'>
            {PRINT_FARM.map((item) => (
              <div className='hw26-kit-item' key={item.name}>
                <span className='hw26-kit-qty'>{item.qty}</span>
                <dt>{item.name}</dt>
                <dd>{item.what}</dd>
              </div>
            ))}
          </dl>

          <div
            className='hw26-subhead hw26-reveal'
            style={{ marginTop: '2.5rem' }}
          >
            <span className='hw26-label hw26-label--mint'>Open stock</span>
            <span className='hw26-poweredby-rule' />
          </div>

          <dl className='hw26-kit hw26-reveal'>
            {OPEN_STOCK.map((item) => (
              <div className='hw26-kit-item' key={item.name}>
                <span className='hw26-kit-qty'>{item.qty}</span>
                <dt>{item.name}</dt>
                <dd>{item.what}</dd>
              </div>
            ))}
          </dl>

          <div className='hw26-plates'>
            {PLATES.map((plate, i) => (
              <figure
                className={`hw26-plate ${plate.cls} hw26-reveal`}
                key={plate.src}
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                <Image
                  alt={plate.alt}
                  fill
                  sizes='(max-width: 900px) 100vw, 45vw'
                  src={plate.src}
                />
                <figcaption>{plate.cap}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- SCHEDULE ---------------- */}
      <section className='hw26-section'>
        <div className='hw26-grid' />
        <div className='hw26-inner'>
          <div className='hw26-head hw26-reveal'>
            <span className='hw26-num'>04</span>
            <h2>How it works</h2>
            <span className='hw26-label' style={{ marginLeft: 'auto' }}>
              All dates 2026
            </span>
          </div>

          <div className='hw26-days'>
            <div className='hw26-day hw26-reveal'>
              <h3>
                The funnel <span>NOW — 19 SEP</span>
              </h3>
              {FUNNEL.map((slot) => (
                <div
                  className={`hw26-slot${slot.gate ? ' hw26-slot--gate' : ''}`}
                  key={slot.t + slot.w}
                >
                  <span className='hw26-slot-time'>{slot.t}</span>
                  <span className='hw26-slot-what'>{slot.w}</span>
                </div>
              ))}
            </div>

            <div
              className='hw26-day hw26-reveal'
              style={{ transitionDelay: '110ms' }}
            >
              <h3>
                The house <span>26—28 SEP</span>
              </h3>
              {HOUSE.map((slot) => (
                <div
                  className={`hw26-slot${slot.gate ? ' hw26-slot--gate' : ''}`}
                  key={slot.t + slot.w}
                >
                  <span className='hw26-slot-time'>{slot.t}</span>
                  <span className='hw26-slot-what'>{slot.w}</span>
                </div>
              ))}
            </div>
          </div>

          <p
            className='hw26-reveal'
            style={{
              marginTop: '3rem',
              maxWidth: '60ch',
              fontSize: '0.9rem',
              lineHeight: 1.8,
              color: 'var(--hw-bone)',
            }}
          >
            Investors and venture partners walk the floor for the whole run,
            not just on pitch day — they see teams in action, at their benches,
            while the product is still being born. Have something you can show
            in two minutes.
          </p>
        </div>
      </section>

      {/* ---------------- FOUR FORCES ---------------- */}
      <section className='hw26-section'>
        <div className='hw26-inner'>
          <div className='hw26-head hw26-reveal'>
            <span className='hw26-num'>05</span>
            <h2>One house, four forces</h2>
            <span className='hw26-label' style={{ marginLeft: 'auto' }}>
              The ecosystem
            </span>
          </div>

          <dl className='hw26-kit hw26-reveal'>
            {FORCES.map((force) => (
              <div className='hw26-kit-item' key={force.name}>
                <span className='hw26-kit-qty'>{force.tag}</span>
                <dt>{force.name}</dt>
                <dd>{force.what}</dd>
              </div>
            ))}
          </dl>

          <p
            className='hw26-reveal'
            style={{
              marginTop: '2.5rem',
              maxWidth: '60ch',
              fontSize: '0.9rem',
              lineHeight: 1.8,
              color: 'var(--hw-bone)',
            }}
          >
            The hackathon is the entry point, not the product. When it ends,
            everyone — participants, partners, investors, media — joins one
            open ecosystem chat, and the strongest founders are invited to
            keep building in the same house.
          </p>
        </div>
      </section>

      {/* ---------------- ORGANIZERS & SPONSORS ---------------- */}
      <section className='hw26-section'>
        <div className='hw26-inner'>
          <div className='hw26-head hw26-reveal'>
            <span className='hw26-num'>06</span>
            <h2>Organizers &amp; Sponsors</h2>
          </div>

          <div className='hw26-subhead hw26-reveal'>
            <span className='hw26-label hw26-label--mint'>Organizers</span>
            <span className='hw26-poweredby-rule' />
          </div>

          <div className='hw26-sponsors-lead hw26-reveal'>
            {ORGANIZERS.map((org) => (
              <div className='hw26-sponsor-lead' key={org.name}>
                {org.src ? (
                  <a className='hw26-org-logo' href={org.href}>
                    <img alt={org.name} src={org.src} />
                  </a>
                ) : (
                  // Typographic mark until the real logo file lands.
                  <a className='hw26-org-mark' href={org.href}>
                    {org.name}
                  </a>
                )}
                <p>{org.line}</p>
              </div>
            ))}
          </div>

          <div className='hw26-subhead hw26-reveal'>
            <span className='hw26-label hw26-label--mint'>Partners</span>
            <span className='hw26-poweredby-rule' />
          </div>

          <div className='hw26-sponsors-lead hw26-reveal'>
            {LEAD_SPONSORS.map((s) => (
              <div className='hw26-sponsor-lead' key={s.name}>
                {s.src ? (
                  // Vector marks, served as-authored. Running a partner's logo
                  // through the image optimizer would re-encode it, which
                  // their brand terms do not allow.
                  <img
                    alt={s.name}
                    className={s.stacked ? 'hw26-mark--stacked' : undefined}
                    src={s.src}
                  />
                ) : (
                  // Typographic mark until the real logo file lands, same as
                  // the organizer cells above.
                  <a className='hw26-org-mark' href={s.href}>
                    {s.name}
                  </a>
                )}
                <p>{s.line}</p>
              </div>
            ))}
          </div>

          <div className='hw26-sponsors-rest hw26-reveal'>
            {REST_PARTNERS.map((partner) => (
              <div className='hw26-sponsor' key={partner.name}>
                <span className='hw26-sponsor-name'>{partner.name}</span>
                <span className='hw26-label'>{partner.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- CLOSER ---------------- */}
      <section className='hw26-section hw26-closer'>
        <div className='hw26-inner'>
          <h2 className='hw26-reveal'>
            Bring a problem
            <br />
            your house has
          </h2>
          <p className='hw26-reveal'>
            {hackathon.capacity ? `${hackathon.capacity} seats. ` : ''}
            Three days, one machine per team, and a floor full of other teams
            to wire yours into. Open stock throughout, and a pitch day in front
            of investors. Applications close on 12 September.
          </p>
          <div className='hw26-reveal'>
            <a className='hw26-apply hw26-apply--lg' href={applyHref}>
              Apply now
            </a>
          </div>
        </div>
      </section>

      {/* ---------------- END PLATE ---------------- */}
      <footer className='hw26-endplate'>
        <div aria-hidden='true' className='hw26-endplate-hazard' />
        <p aria-hidden='true' className='hw26-endplate-bleed'>
          2026
        </p>

        <div className='hw26-endplate-body'>
          <div className='hw26-endplate-top'>
            <p className='hw26-endplate-mark'>
              Alien Bazaar
              <br />
              <em>Warsaw 26</em>
            </p>
            <div className='hw26-stamp'>
              Registration open
              <span>Closes 12 SEP 2026</span>
            </div>
          </div>

          <dl className='hw26-titleblock'>
            {TITLE_BLOCK.map((cell) => (
              <div
                className={`hw26-tb${cell.tone ? ` hw26-tb--${cell.tone}` : ''}`}
                key={cell.k}
              >
                <dt>{cell.k}</dt>
                <dd>{cell.v}</dd>
              </div>
            ))}
            <div className='hw26-tb hw26-tb--gate'>
              <dt>Applications close</dt>
              <dd>12 SEP 2026</dd>
            </div>
            <div className='hw26-tb'>
              <dt>Seats</dt>
              <dd>{hackathon.capacity ?? '—'}</dd>
            </div>
            <div className='hw26-tb'>
              <dt>Team max</dt>
              <dd>{hackathon.maxTeamSize}</dd>
            </div>
          </dl>
        </div>

        <div className='hw26-endplate-foot'>
          <span className='hw26-label'>
            {hackathon.location ?? 'Warsaw, Poland'}
          </span>
          <div aria-hidden='true' className='hw26-ticks'>
            {Array.from({ length: 24 }, (_, i) => (
              <i key={`tick-${i}`} />
            ))}
          </div>
          <span className='hw26-label'>Hacklab × Epikor · AB—WAW—26</span>
        </div>
      </footer>

      <ThemeToggle />
    </div>
  )
}
