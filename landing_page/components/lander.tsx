'use client'

import {
  GeistPixelCircle,
  GeistPixelGrid,
  GeistPixelLine,
  GeistPixelSquare,
} from 'geist/font/pixel'
import Image from 'next/image'
import {
  type CSSProperties,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

import './lander.css'
// The load sequence is intentionally disabled for now. intro.tsx and
// intro.css are untouched and still build — uncomment this line and the
// <HardwareIntro /> render at the top of the tree to bring it back.
// import { HardwareIntro } from './intro'
// The intro itself stays switched off; `useScramble` is the one thing in that
// file the live page uses — see SecretLine below.
import { useScramble } from './intro'
import { type HardwareEvent } from '../lib/event'

/**
 * Alien Bazaar — Warsaw 2026. The event's own landing page.
 *
 * Neoindustrial: machine-shop signage read through a phosphor terminal.
 * Structure carries meaning rather than decorating it — the rig panels carry
 * a unit count because the booking sheet is finite and that number is the
 * whole constraint, and the mint accent marks both the interactive and the
 * gates that can cost you something.
 *
 * The page is dark. A light palette still exists in lander.css, keyed off
 * data-theme on <html>, but nothing on the page sets that attribute any
 * more — the toggle that did has been removed.
 *
 * Facts come from the event row, so the page cannot drift from
 * `/hackathons/<slug>`. Copy that is not in the database lives here.
 */

/**
 * The ribbon under the hero. Four facts, not nine: when, how many teams, how
 * much hardware, where — the questions a reader has before they have decided
 * to read anything else, answered in the width of one band.
 *
 * Mint goes on the team count and nowhere else. The unit count is the same
 * figure seen from the other side — one machine per team — so it is a fact
 * about the floor rather than a second cap, and this page reserves the accent
 * for the number that can cost you a seat.
 */
const TICKER = [
  { label: '25.09.–27.09.2026.' },
  { label: '20 TEAMS', mint: true },
  { label: '20 HARDWARE UNITS' },
  { label: 'KOSIARZY 21B, WARSAW' },
]

/**
 * How many times the four facts are laid end to end inside one marquee
 * track. The loop translates each track by exactly its own width, so it is
 * only seamless while a single track is at least as wide as the viewport —
 * with four short labels that is not true on a desktop, and the band would
 * show a hole every cycle. Four runs clear any ordinary monitor; the
 * `min-width` on the track in the stylesheet is what covers the rest.
 */
const TICKER_RUNS = 4

/**
 * The floor, by what the machine is.
 *
 * The closed/open split is gone and so are the two mint labels that carried
 * it. A team choosing hardware is not choosing a set of terms, it is choosing
 * between an arm, a drone, something that goes underwater, a humanoid, and
 * the odds and ends — so the groups are the categories themselves, five of
 * them, each titled in the medium heading cut (`.hw26-cat`) rather than in a
 * 10px eyebrow. One `h2` still; the group titles are the `h3`s under it and
 * the entry names step down to `h4`.
 *
 * One line per entry, and for two of them one short caption under it. Not the
 * blurb that came off this section earlier — that was a paragraph per cell at
 * a third of the sheet, which turns an inventory into twelve essays. `note`
 * is a single clause saying the one thing the name cannot, and it is rendered
 * only where there is one.
 *
 * `units` is the count as the organizers write it — `2x`, `6x`, `?` — so the
 * display figure stays a short glyph run in every cell rather than a sum, and
 * the reader is never asked whether `02` means two or the second of
 * something.
 *
 * The per-entry status tag is gone with the split it described. "Ready to
 * use" against "Custom design by you" was the closed/open distinction said a
 * second time, and under these headings it would be saying it about groups
 * that no longer divide that way. The one status still worth printing is that
 * something is not settled yet, which is what `tba` is.
 *
 * `photo` is the plate behind the panel, and the rule is now the machine
 * rather than the group: a cell carries the picture of *its own* machine, and
 * the three cells whose machine has not been shot yet carry none. Nine of
 * twelve have one. This replaces the old rule that plates went on a whole
 * group or on none of it, which existed because the house had seven stock
 * photographs and dressing robo fish in a picture of a workshop bench was
 * worse than leaving the cell flat. There is a stylized render per machine
 * now, so the stand-in problem is gone and with it the reason to ration
 * plates by group. What is left is the honest reading: a plate means we can
 * show you this one.
 *
 * They are ground for type at 16% opacity in greyscale, so they are `alt=''`.
 *
 * `tba` is the marker: this exists but is not announced. `unannounced` is the
 * stronger case — the entry *is* the placeholder, so it takes `?` where a
 * count goes and the muted panel. The two are separate because VR is real,
 * there are two of them, and only the details are pending; muting that cell
 * would throw away a count the reader can use.
 *
 * An `unannounced` cell can still carry a plate, and two of them do. The
 * machine is picked and photographed; what is not settled is how many and
 * under what name, which is exactly what the `?` and the muted chrome say.
 * The plate rides one step dimmer there than on an announced cell — see the
 * placeholder block in the stylesheet — so the mute survives the picture.
 */
type Rig = {
  name: string
  units?: string
  note?: string
  photo?: string
  tba?: boolean
  unannounced?: boolean
}

const RIG_GROUPS: { label: string; items: Rig[] }[] = [
  {
    label: 'Robot arms',
    items: [
      {
        name: 'Big arms on wheeled platform',
        units: '2x',
        photo: '/hardware/robo-arm-big.png',
      },
      {
        name: 'Manipulators',
        units: '6x',
        photo: '/hardware/robo-arm.png',
      },
      {
        name: 'Build your own',
        units: '2x',
        note: 'Robo arms on a wheeled platform',
        photo: '/hardware/robo-arm-byo.png',
      },
      {
        name: 'TBA',
        units: '?',
        tba: true,
        unannounced: true,
        photo: '/hardware/cobot-tba.png',
      },
    ],
  },
  {
    label: 'Drones',
    items: [
      { name: 'Tbot', units: '2x', photo: '/hardware/tbot.png' },
      { name: 'FPV', units: '1x', photo: '/hardware/drone-fpv.png' },
      { name: 'Build your own', units: '1x', photo: '/hardware/drone-byo.png' },
    ],
  },
  {
    label: 'Underwater drones',
    items: [
      { name: 'Robo fish', units: '3x', photo: '/hardware/robo-fish.png' },
      { name: 'Underwater drone', units: '1x' },
    ],
  },
  {
    label: 'Humanoids',
    items: [
      {
        name: 'TBA',
        units: '?',
        tba: true,
        unannounced: true,
        photo: '/hardware/humanoid.png',
      },
    ],
  },
  {
    label: 'Other',
    items: [
      { name: 'VR', units: '2x', tba: true },
      // Non-breaking hyphen: the cell's measure puts the line break exactly
      // on it, and "ROBODOG W01-" over "TEK" reads as a hyphenated word
      // rather than as the machine's name. Wrapped before the model number
      // instead, it comes out as two whole tokens.
      { name: 'Robodog W01‑TEK', units: '1x', photo: '/hardware/w01-tek.jpeg' },
    ],
  },
]

/**
 * The add-ons: what is on the floor besides a machine to book.
 *
 * Its own section rather than a sixth category, because these are not
 * something a team books one of — the print farm and the parts room are
 * there for everybody, so they get no counts and no group headings. Two
 * cells, the same chrome, and a caption each carrying the only thing that
 * needs saying: the print deadline, and what the components are for.
 */
const ADDONS: Rig[] = [
  {
    name: '3D Printed objects',
    note: "Send us your files by 18.09. and we'll print them for you",
  },
  { name: 'Components', note: 'Use them to extend your hardware' },
]

/**
 * The timeline: six stops between today and the doors opening.
 *
 * The shape of the run in one line. A reader who has just seen what they can
 * book wants to know when they have to have booked it by, and gets that here
 * without reading a table.
 *
 * The undated stop sits third, between the two registration dates, rather
 * than at the head of the line where it used to be. Registration opens on
 * 1 September and closes on the 15th, and that stretch is the one the reader
 * is being asked to act inside; an unannounced beat reads as something that
 * happens while they are forming a team. Ahead of 1 SEP it would read as a
 * gate before registration rather than an event during it, which is not what
 * it is.
 *
 * `live` is the mint flag, and only two stops carry it: NOW, because it is
 * the one thing on the line you can act on this second, and 25.09., because
 * it is the moment the hero clock is counting to. The page reserves the
 * accent for what is interactive or counted, and those are exactly the two.
 */
const TIMELINE: {
  when: string
  what: string
  live?: boolean
  cta?: boolean
  secret?: boolean
}[] = [
  {
    when: 'NOW',
    what: 'Join the platform, meet builders, and start putting a team together.',
    live: true,
    cta: true,
  },
  {
    when: '1 SEP',
    what: 'Registration opens, and the full hardware list is published — subcategories, dimensions, documentation.',
  },
  { when: 'TBA', what: 'Secret event', secret: true },
  { when: '15 SEP', what: 'Team creation and applications deadline' },
  { when: '18 SEP', what: 'We announce selected teams' },
  { when: '25.09.', what: 'The hackathon begins', live: true },
]

/**
 * The brackets beside the line, each one a stretch of time rather than a
 * moment: what the reader is doing between two stops. Written as the stop
 * numbers they span, which since the rewrite is not a shorthand for a
 * position — it *is* the position.
 *
 * They used to be percentages of the band, which only worked while every stop
 * occupied an identical column. The list and the bracket strip are now two
 * subgrids of one grid, so a bracket is placed by naming the rows it spans
 * and lands on its ticks whatever height the stops come out at. Nothing is
 * measured, in script or in CSS, and adding a stop moves the brackets by
 * changing these two numbers and nothing else.
 *
 * `from` is the stop the stretch starts at and `to` is the stop it ends at,
 * both inclusive of the tick: the first bracket runs from today to the
 * booking deadline, the second covers selection, and the third is the print
 * queue between the announcement and the doors.
 */
const TIMELINE_SPANS = [
  { from: 1, to: 4, label: 'Chat, create teams, book hardware' },
  { from: 4, to: 5, label: 'Selection process' },
  { from: 5, to: 6, label: 'We print your requested objects' },
]

/**
 * The two organizers, as marks and nothing else. Each carried a line saying
 * what it does; both are gone — this row is co-branding, and the two names
 * are what it is for. Nothing on the wall carries a line any more, so the
 * treatment here is no longer the exception it once was.
 *
 * `href` is read by the cell rather than by the mark inside it: the whole
 * tile is the link. See the sponsor wall in the tree below.
 */
const ORGANIZERS: {
  name: string
  src: string
  href: string
  mark?: string
}[] = [
  {
    name: 'Epikor',
    // The full horizontal lockup as they publish it — mark plus wordmark,
    // already white, used unmodified. It replaces the bare glyph this cell
    // carried before, which was their site's inline mark recoloured by hand
    // and had no wordmark on it at all.
    //
    // A lockup is not the same object as a glyph, so it cannot keep the
    // glyph's height: see the sizing note in the stylesheet.
    src: '/sponsors/epikor.svg',
    href: 'https://epikor.eu',
    mark: 'hw26-org-logo--epikor',
  },
  {
    name: 'Hacklab',
    // White mark, drawn for the dark plate the organizer cells keep in
    // both themes.
    src: '/sponsors/hacklab.png',
    href: 'https://hacklab.so',
  },
]

/**
 * A cell on the partner wall.
 *
 * `src` is required, and that is deliberate rather than incidental. There was a
 * typographic fallback here for a partner that published no artwork of any
 * kind; it has been removed once before, restored when W01-TEK needed it, and
 * removed again now that W01-TEK has a real file. Every name on this wall has
 * one. Making the field required is what stops the branch coming back on a
 * hunch: a partner with no mark will not typecheck, which is the moment to
 * decide what to do about it rather than silently printing their name in
 * Orbitron.
 *
 * `mark` names a per-logo sizing class. These are marks at wildly different
 * aspect ratios — a 5.3:1 wordmark and a stacked helmet lockup do not read as
 * the same size at the same height — so optical balance is a decision per file,
 * taken in CSS and pointed at from here.
 */
type Partner = {
  name: string
  href: string
  src: string
  mark?: string
}

/**
 * The partners, in two tiers.
 *
 * They were five equal lead cells. They are not five equal partners, and a
 * wall that says they are is the wall making a claim nobody authorised — so
 * the two leads take the large cell and the other three take one at half its
 * width, which is the same tile at the same treatment and half the sheet.
 *
 * Every mark is the partner's own file — NVIDIA's straight off their brand
 * page, the rest normalised for the dark plate these cells keep in both
 * themes: white or full-colour ink on transparent, except EuroTech, whose
 * mark is only published on its own deep blue and comes as that plate.
 *
 * Every cell is a centred mark and nothing else. NVIDIA's used to carry a
 * sentence saying what it supplies, and it was the only one — which meant the
 * wall stated one partner's contribution and left the other four's to be
 * guessed at, and put a paragraph of body copy in one tile of a row of logos.
 * With it gone the wall makes no claim about who gave what, and the two cells
 * are the same object at the same weight, which is what a tier is.
 */
const LEAD_SPONSORS: Partner[] = [
  {
    name: 'NVIDIA',
    src: '/sponsors/nvidia.svg',
    href: 'https://www.nvidia.com',
    // Their two-colour mark is the stacked lockup, so matching a horizontal
    // wordmark's height would leave it reading half the size.
    mark: 'hw26-mark--stacked',
  },
  {
    name: 'ESRA — European Student Robotics Association',
    src: '/sponsors/esra.png',
    href: 'https://www.studentrobotics.eu/',
    mark: 'hw26-mark--esra',
  },
]

/**
 * The second tier: the same cell at half a lead's width, three of them.
 *
 * Three tiles on a four-column track leaves one track spare, and the gap
 * between these cells is the container showing through — so that track would
 * come out as a lit rectangle the size of a plate. The wall has met this twice
 * already and answered it two ways: span the leftover, or shrink the
 * container so there is no leftover. Spanning is out here, because a tile at
 * two tracks is a lead cell and the tier is defined by not being one. So the
 * container is three tracks wide on a four-track measure — see the arithmetic
 * in the stylesheet, which is the same sum the solo rows below run.
 *
 * Each mark is re-sized rather than scaled: a cell at half the width is not
 * the same cell smaller, and the two plates in particular carry ink across
 * their whole box.
 */
const SMALL_SPONSORS: Partner[] = [
  {
    name: 'Eurotech Federation',
    src: '/sponsors/eurotech.png',
    href: 'https://www.eurotech-federation.com/',
    // Cropped to the lockup on its own deep blue, not a cut-out mark: every
    // pixel of it is ink, so it reads far heavier per unit of height than the
    // transparent marks beside it and is sized down to compensate.
    mark: 'hw26-mark--eurotech',
  },
  {
    name: 'Oxbridge Frontier Intelligence',
    src: '/sponsors/ofi.png',
    href: 'https://www.oxbridgefrontier.com/',
    mark: 'hw26-mark--ofi',
  },
  {
    name: 'SPRTK',
    src: '/sponsors/sprtk.png',
    href: 'https://sprtk.com/',
    // The only mark on the wall that is taller than it is wide — five letters
    // overlapped into one monogram, no wordmark under it. At the row's height
    // it would come out narrower than a favicon.
    mark: 'hw26-mark--sprtk',
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
  { k: 'Venue', v: 'Hacker Bloc' },
  { k: 'Coord', v: '52.2297°N 21.0122°E' },
  { k: 'Duration', v: '48 WORK H' },
]

/**
 * The hardware partners — the outfits putting machines and parts on the floor.
 * Smaller tiles than the leads, same treatment otherwise: the mark, nothing
 * else, and the whole tile is the link.
 */
const HARDWARE_PARTNERS: Partner[] = [
  {
    name: 'BMF — Brave Mind Fighters',
    src: '/sponsors/bmf.png',
    href: 'https://bravemindfighters.com/',
    // A helmet stacked over its wordmark: nearly square, so it needs well
    // over the row's height to read at the row's size.
    mark: 'hw26-mark--bmf',
  },
  {
    name: 'W01-TEK',
    src: '/sponsors/w01tek.png',
    href: 'https://machinekind.ai/',
    // A bare wordmark at 5.3:1 in its own face — no symbol beside it, so all
    // of its height is cap height and it grows fast per pixel. The widest
    // thing in this row, and held down accordingly.
    mark: 'hw26-mark--w01tek',
  },
  {
    name: 'SkyMav',
    src: '/sponsors/skymav.png',
    href: 'https://skymav.pl/',
  },
  {
    name: 'GHOST',
    src: '/sponsors/ghost.png',
    href: 'https://ghost.put.poznan.pl/',
    // Line-art badge beside four short lines of type, all in white — the
    // solid orange block this used to be has been cut away. It is the type
    // that sets the floor: at the row's height those lines close up.
    mark: 'hw26-mark--ghost',
  },
  {
    name: 'MAB Robotics',
    src: '/sponsors/mab.png',
    href: 'https://www.mabrobotics.pl/',
    // The full lockup rather than the bare monogram it used to be: a heavy
    // three-letter mark with "robotics" tucked under its right shoulder, and
    // 3:1 overall. Wide marks grow fast per pixel of height, so this one now
    // runs under the row's base rather than over it.
    mark: 'hw26-mark--mab',
  },
]

/**
 * The media partners. Their own heading rather than a sixth hardware tile:
 * what they put on the floor is coverage, and a group of one that says so is
 * worth more than a name filed under a heading that does not describe it.
 *
 * The mark is a white lockup on the channel's own orange plate — that is how
 * it is published, and there is no transparent cut of it. It gets no frame
 * around that rectangle; it is sized down instead, which is the note in the
 * stylesheet.
 */
const MEDIA_PARTNERS: Partner[] = [
  {
    name: 'Przygody Przedsiębiorców',
    src: '/sponsors/przygody.png',
    href: 'https://youtube.com/@przygodyprzedsiebiorcow',
    mark: 'hw26-mark--przygody',
  },
]

/**
 * The sponsors proper — money rather than machines or coverage, which is why
 * this is not the hardware wall with one more tile on it.
 *
 * That argument now has teeth: these render at the lead cell, the same plate
 * the top Ecosystem Partners get, so the tier is stated in the size of the
 * cell and not only in the heading above it. Filed under the same head as the
 * hardware wall and drawn at three times its tile, the distinction survives
 * someone reading the page rather than its subheads.
 */
const SPONSORS: Partner[] = [
  {
    name: 'prelint',
    src: '/sponsors/prelint.svg',
    href: 'https://prelint.com/',
    mark: 'hw26-mark--prelint',
  },
]

/**
 * Fisher–Yates, on a copy.
 *
 * Not `sort(() => Math.random() - 0.5)`, which is the one-liner everyone
 * reaches for and is not a shuffle. A comparator is a promise that the ordering
 * it describes is consistent, and a random one breaks that promise — the engine
 * is then free to visit whatever subset of the pairs its algorithm happens to
 * need, so the permutations come out at wildly unequal probabilities and a tile
 * that started near the front tends to finish there. A wall that quietly favours
 * the incumbent order is the exact thing this feature exists to stop doing.
 * Fisher–Yates draws each remaining slot uniformly and is no longer to write.
 *
 * The copy is not politeness either. Every array handed to this is a module
 * constant that outlives the render, so mutating one would permanently reorder
 * the source everything else on the page reads from, and the second visit to
 * the section would be shuffling an already-shuffled list.
 */
function shuffled<T>(items: readonly T[]): readonly T[] {
  const out = items.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * `useLayoutEffect` in the browser, `useEffect` where there is no browser.
 *
 * React warns that layout effects do nothing during server rendering, which is
 * true and harmless here — but the warning is real noise on every server
 * render, so the choice is made once at module scope rather than per call. It
 * cannot go stale: nothing grows a `window` halfway through a process.
 */
const useIsoLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * A partner row in a different order on every visit.
 *
 * The order cannot be decided during render. This page is statically generated,
 * so the HTML every visitor gets is one build's output — genuinely per-visit
 * randomness can only be produced in the browser, and a value produced in the
 * browser during the first render is a value the server could not have written.
 * That is the same trap the countdown is arranged around, and for the same
 * reason it takes the same shape: the canonical order is what the server sends
 * and what the first client render produces, and the real answer arrives one
 * effect later, once the two have already agreed.
 *
 * A *layout* effect specifically, which is the whole reason this is not three
 * lines of `useEffect`. A plain effect runs after the browser has painted, so
 * the reader would see the canonical row and then watch it deal itself out
 * again; a layout effect runs between the commit and the paint, so the only
 * order ever put on a screen is the shuffled one.
 *
 * `items` is a module constant at every call site, so its identity never
 * changes and the effect runs once per mount rather than once per render.
 */
function useShuffled<T>(items: readonly T[]): readonly T[] {
  const [order, setOrder] = useState(items)

  useIsoLayoutEffect(() => {
    setOrder(shuffled(items))
  }, [items])

  return order
}

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

/**
 * The timeline's desktop pin: vertical page scroll spent travelling the line
 * sideways.
 *
 * The whole mechanism is one number. `overflow` is how much wider the track is
 * than the box it sits in, and it is handed to the stylesheet as `--tl-pin`,
 * where it becomes the section's surplus height over one screen. So a full
 * sweep of the pin is a full sweep of the line by construction — there is no
 * second constant to keep in step, and adding a stop lengthens both at once.
 *
 * Progress comes off the section's own `getBoundingClientRect().top` rather
 * than from a scroll position: `top` is 0 the moment the frame sticks and
 * `-(height - viewport)` the moment it lets go, which is exactly the range the
 * translate needs, and it stays correct if anything above the section changes
 * height. Scroll events are coalesced onto one animation frame, so a trackpad
 * firing faster than the display cannot queue up work.
 *
 * What the track does with that progress is damped rather than bolted to it.
 * Nailed 1:1 the line was a second scrollbar — it started at full speed on the
 * pixel the frame stuck, stopped dead on the pixel it released, and every jitter
 * in a trackpad gesture was on the screen at full amplitude. Two things fix
 * that and they do different jobs: a curve softens the two ends of the sweep,
 * and a per-frame chase softens the input. Both are written out where they are
 * defined below, along with the pair of guarantees they are not allowed to
 * cost — that the line is at exactly 0 when the pin takes hold and at exactly
 * full travel when it lets go, and that it comes to a stop rather than creeping
 * after the reader has.
 *
 * Three cases refuse the pin outright, and they all take the same branch:
 * below the breakpoint the layout is vertical and has nothing to travel;
 * under reduced motion, hijacking the scroll is precisely the thing being
 * asked for less of; and if the track already fits there is nothing to
 * travel *to*, so the section keeps its ordinary height and the reader is
 * not made to scroll past a screen of nothing. In all three the attribute is
 * never set, and the stylesheet's standing state — a scrollport the reader
 * can push — is what is left. With no script at all, none of this runs and
 * that same standing state is what ships.
 */
function useTimelinePin() {
  const section = useRef<HTMLElement>(null)
  const port = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sectionEl = section.current
    const portEl = port.current
    const trackEl = track.current
    if (!sectionEl || !portEl || !trackEl) return

    const wide = window.matchMedia('(min-width: 900px)')
    const still = window.matchMedia('(prefers-reduced-motion: reduce)')

    let overflow = 0
    let frame = 0
    let last = 0
    // Where the track actually is, against where the scroll says it should be.
    // Two numbers rather than one because the whole of the smoothing is the
    // gap between them.
    let at = 0

    const unpin = () => {
      overflow = 0
      at = 0
      sectionEl.removeAttribute('data-pinned')
      sectionEl.style.removeProperty('--tl-pin')
      trackEl.style.transform = ''
    }

    const paint = (x: number) => {
      trackEl.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`
    }

    // The shape of the sweep: an ease-in-out on progress, defined by its *rate*
    // rather than by a curve picked for its formula.
    //
    // The problem it solves is the handoff, not the middle. Linear, the reader
    // is scrolling the page down at some speed, the section reaches the top,
    // and in one frame all of that speed becomes sideways travel — then at the
    // far end the line stops dead and the page resumes. Two hard cuts between
    // two kinds of motion, and both read as the page catching on something.
    //
    // So the rate ramps from a standstill over the first `RAMP` of the pin,
    // runs flat through the middle, and ramps back to a standstill over the
    // last `RAMP` — the ramps being smoothstep, so the *acceleration* is
    // continuous too and the ramp itself does not start with a jolt. `shape` is
    // that rate integrated, which is why it is a quartic rather than the usual
    // cubic.
    //
    // Straight smoothstep across the whole range is the textbook answer here
    // and was tried first. It ramps for the entire sweep, so the middle has to
    // run at 1.5× to make the distance back up and the line visibly outruns the
    // scrollbar there. Confining the ramps to a fifth of the range each buys the
    // same standstill at both ends for a middle at 1.28×, which does not read as
    // a sprint.
    //
    // Both ends are exact by construction, which is the constraint that
    // outranks the feel: `ramp(0)` is 0, so `shape(0)` is 0, and `shape(1)` is
    // written as `1 − v·a·ramp(0)`, so it is exactly 1 — not a curve that
    // approaches 1 and leaves the last stop a few pixels offscreen forever.
    const RAMP = 0.22

    // The integral of smoothstep over [0, 1], normalised to reach 1/2 — which
    // is the area under a rate that starts at 0 and ends at 1.
    const ramp = (u: number) => u * u * u - (u * u * u * u) / 2

    const shape = (t: number) => {
      const v = 1 / (1 - RAMP) // flat-middle rate, set so the whole sweep is 1
      if (t <= RAMP) return v * RAMP * ramp(t / RAMP)
      if (t >= 1 - RAMP) return 1 - v * RAMP * ramp((1 - t) / RAMP)
      return v * (t - RAMP / 2)
    }

    // Where the scroll says the track should be, in pixels.
    const wanted = () => {
      const rect = sectionEl.getBoundingClientRect()
      // The section is one screen plus the overflow, so this is the overflow
      // again — read from layout rather than assumed, since `100svh` and
      // `innerHeight` can disagree while a mobile toolbar is retracting.
      const travel = rect.height - window.innerHeight
      const progress =
        travel <= 0 ? 0 : Math.min(1, Math.max(0, -rect.top / travel))
      return -(shape(progress) * overflow)
    }

    // The chase. Each frame closes a fixed *share* of the remaining distance,
    // which is an exponential approach: quick while the gap is wide, gentle as
    // it closes, and never overshooting. `SETTLE` is that share per 60Hz frame
    // and is raised to `dt / 16.667` so a 120Hz display closes the same gap in
    // the same milliseconds rather than twice as fast; `dt` is capped because a
    // backgrounded tab hands back a gap of seconds and the track should return
    // to where the scroll left it, not ease there from wherever it was.
    //
    // An exponential approach never actually arrives, which on a scrollbar at
    // rest is a track still creeping a hundredth of a pixel a frame forever —
    // and, worse, a last stop left forever short of the clamp. `EPSILON` is the
    // distance at which it stops pretending: inside a quarter pixel the
    // remainder is assigned rather than approached, the frame loop is not
    // renewed, and the position is exactly what `wanted()` returned. That is
    // what makes 0 at the start and full travel at the end exact figures.
    const SETTLE = 0.2
    const EPSILON = 0.25

    const draw = (now: number) => {
      frame = 0
      if (!overflow) return
      const dt = Math.min(50, Math.max(1, now - last))
      last = now

      const target = wanted()
      const gap = target - at
      if (Math.abs(gap) <= EPSILON) {
        // Settled: land on the target exactly and let the loop die.
        at = target
        paint(at)
        return
      }
      at += gap * (1 - (1 - SETTLE) ** (dt / 16.667))
      paint(at)
      frame = requestAnimationFrame(draw)
    }

    // Scroll only ever wakes the loop; it never paints. If a frame is already
    // pending the chase is running and will read the newest scroll position
    // itself, which is why one handle is enough for both jobs.
    const schedule = () => {
      if (!frame) {
        last = performance.now()
        frame = requestAnimationFrame(draw)
      }
    }

    const measure = () => {
      if (!wide.matches || still.matches) return unpin()
      // `scrollWidth` and `clientWidth` are layout figures and are not moved by
      // the transform already on the track, so the measurement does not have to
      // undo its own effect first.
      const next = Math.max(
        0,
        Math.round(trackEl.scrollWidth - portEl.clientWidth)
      )
      if (!next) return unpin()
      overflow = next
      sectionEl.style.setProperty('--tl-pin', `${next}px`)
      sectionEl.setAttribute('data-pinned', 'true')
      // A cut, not a chase. Measuring happens on mount, on resize and when the
      // track reflows — none of which is motion the reader performed, and all
      // of which would otherwise slide the line from a position that is no
      // longer where anything is.
      at = wanted()
      paint(at)
    }

    measure()

    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', measure)
    wide.addEventListener('change', measure)
    still.addEventListener('change', measure)

    // The listener covers the viewport changing; the observer covers the track
    // changing under it — a web font landing, or the copy reflowing — which
    // resizes nothing else and would otherwise leave the pin travelling the
    // wrong distance for the rest of the session.
    const ro =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    ro?.observe(portEl)
    ro?.observe(trackEl)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', measure)
      wide.removeEventListener('change', measure)
      still.removeEventListener('change', measure)
      ro?.disconnect()
      unpin()
    }
  }, [])

  return { section, port, track }
}

/**
 * One small tile on the sponsor wall — hardware partners, media partners and
 * sponsors all wear it, which is why it is a component rather than three
 * copies of the same map body.
 *
 * The whole tile is the link, and `aria-label` names the organisation so the
 * accessible name is not the alt text of the mark inside it. Marks are served
 * as-authored: running a partner's logo through the image optimizer would
 * re-encode it, which their brand terms do not allow.
 *
 * There is no `src`-less branch any more — see the note on `Partner` for why
 * that is a decision and not an oversight.
 */
function SponsorTile({ partner }: { partner: Partner }) {
  return (
    <a aria-label={partner.name} className='hw26-sponsor' href={partner.href}>
      <img
        alt={partner.name}
        className={`hw26-sponsor-logo${partner.mark ? ` ${partner.mark}` : ''}`}
        src={partner.src}
      />
    </a>
  )
}

/**
 * One cell on the floor, used by both the categories and the add-ons.
 *
 * Shared because the two sections are the same object twice — a chamfered
 * panel with a count, a name and sometimes a caption — and the only thing
 * that differs is how deep in the outline the name sits. Under the
 * categories it is an `h4`, because the category title above it is the `h3`;
 * in the add-ons there is no group title, so the name is the `h3` itself.
 * The level is a prop rather than a guess from context, since JSX cannot ask
 * what heading came before it.
 *
 * `order` is only the stagger. Cells fade in a row at a time and 90ms apart,
 * which is the same figure the about cells use.
 */
function RigCell({
  headingLevel = 4,
  item,
  order,
}: {
  headingLevel?: 3 | 4
  item: Rig
  order: number
}) {
  const Name = headingLevel === 3 ? 'h3' : 'h4'

  return (
    <article
      className={`hw26-rig hw26-rig--compact${item.unannounced ? ' hw26-rig--tba' : ''} hw26-reveal`}
      style={{ transitionDelay: `${order * 90}ms` }}
    >
      {/* Ground, not a product shot — see the note on RIG_GROUPS. Empty
          `alt` because a render that is 16% of a greyscale backdrop is
          texture rather than something anyone is being shown; the name below
          it is what identifies the machine. */}
      {item.photo ? (
        <div className='hw26-rig-photo'>
          <Image
            alt=''
            fill
            sizes='(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw'
            src={item.photo}
          />
        </div>
      ) : null}

      {/* The display figure is what there is: six manipulators, three robo
          fish, two of the big arms.

          The placeholders' "?" is the same glyph slot in the same cut, so
          the grid's rhythm holds across the group — but it is a shape
          standing in for a number rather than a number, so it is out of the
          accessibility tree and the marker below carries the meaning
          instead. */}
      {item.units ? (
        <div aria-hidden={item.unannounced} className='hw26-rig-no'>
          {item.units}
        </div>
      ) : null}

      {/* The only status left. On a placeholder it is the whole content of
          the cell; on VR it heads the name in a cell that also carries a real
          count in the corner, which is the honest shape of "there are two of
          these and nothing else is settled". */}
      {item.tba ? (
        <span className='hw26-label hw26-rig-units'>To be announced</span>
      ) : null}

      <Name className='hw26-rig-name'>{item.name}</Name>

      {item.note ? <p className='hw26-rig-note'>{item.note}</p> : null}
    </article>
  )
}

/**
 * The one line on the page that arrives encrypted, for the one stop that has
 * nothing to announce yet.
 *
 * The effect is `useScramble` from the intro, held until the line is actually
 * on screen: a decrypt that finishes above the fold is a decrypt nobody sees.
 * An IntersectionObserver of its own rather than the page's reveal observer,
 * because the two want different things — reveal fires late, at 8% and 12%
 * up from the bottom edge, and this wants to be already running by the time
 * the words are readable. It disconnects on the first hit, so the line
 * resolves once and stays resolved.
 *
 * Under reduced motion the observer is never wired up at all, which leaves
 * the hook unarmed and the finished string on the page from the first render
 * — the same thing the server sent and the same thing a reader with
 * scripting off keeps.
 *
 * It sits scrambled for two seconds before it starts resolving, and that hold
 * is the effect rather than a delay before it. A line that decrypts the instant
 * it appears is a transition; a line that sits there as ciphertext long enough
 * to be read as ciphertext, and only then gives way, is the stop admitting it
 * is holding something back — which is the one thing this stop has to say.
 *
 * The hold is `useScramble`'s own `delay` argument and not a timer wrapped
 * around it, which matters for what is on screen during it: the hook clamps
 * progress at zero through the delay, so every character is a live random glyph
 * for those two seconds. A second timer gating `armed` would have held the
 * readable string instead and then scrambled it, which is the effect backwards.
 */
function SecretLine({ text }: { text: string }) {
  const line = useRef<HTMLSpanElement>(null)
  const [armed, setArmed] = useState(false)
  const out = useScramble(text, 2000, 900, armed)

  useEffect(() => {
    const node = line.current
    if (!node) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (typeof IntersectionObserver === 'undefined') return

    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        setArmed(true)
        io.disconnect()
      }
    })
    io.observe(node)
    return () => io.disconnect()
  }, [])

  return (
    <span className='hw26-tl-secret' ref={line}>
      {out}
    </span>
  )
}

/**
 * The units of the hero countdown, largest first. Kept as data so the markup
 * is one loop and the placeholder and the live readout cannot drift out of
 * step with each other.
 */
const COUNTDOWN_UNITS = [
  { key: 'days', label: 'Days' },
  { key: 'hours', label: 'Hrs' },
  { key: 'minutes', label: 'Min' },
  { key: 'seconds', label: 'Sec' },
] as const

/**
 * Whole days/hours/minutes/seconds left until `target`, clamped at zero: once
 * the doors open the panel should read all zeros rather than start counting
 * up in negatives, which is what a bare subtraction would do the moment the
 * event starts.
 */
function untilParts(target: Date, now: number) {
  const total = Math.max(0, Math.floor((target.getTime() - now) / 1000))
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor(total / 3600) % 24,
    minutes: Math.floor(total / 60) % 60,
    seconds: total % 60,
  }
}

/** Two digits minimum, so the numerals never reflow as they tick down. */
const pad = (n: number) => String(n).padStart(2, '0')

/**
 * The countdown to the first morning.
 *
 * A clock is the one thing on this page that is guaranteed to render
 * differently on the server than in the browser — same trap as the ICU month
 * names below, but unavoidable rather than a formatting choice. So the server
 * renders a fixed placeholder and `now` stays null until the first effect
 * runs; the initial client render matches the HTML exactly, and the real
 * figures arrive one frame later.
 *
 * The interval is cleared on unmount, which also covers the theme toggle
 * remounting the tree in development.
 */
function Countdown({ target }: { target: Date }) {
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    setNow(Date.now())
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const parts = now === null ? null : untilParts(target, now)

  return (
    <div className='hw26-count'>
      {COUNTDOWN_UNITS.map((unit) => (
        <div className='hw26-count-cell' key={unit.key}>
          {/* Dashes, not zeros, for the pre-hydration frame: a zero would
              claim the event had already started for the split second before
              the clock takes over. En dashes rather than the em dashes this
              used to be — an em dash is a full em, so the pair was half
              again as wide as two digits and the panel visibly snapped
              narrower the moment the clock took over. */}
          <span className='hw26-count-n'>
            {parts ? pad(parts[unit.key]) : '––'}
          </span>
          <span className='hw26-label hw26-count-u'>{unit.label}</span>
        </div>
      ))}
    </div>
  )
}

/**
 * The alphabet the rain is drawn from. Digits, capitals with I, O and Q left
 * out, and a handful of operators — the ambiguous letters go because at 13px a
 * column of them reads as a word half-forming, and the point of the field is
 * that it is output rather than language.
 */
const RAIN_GLYPHS = '0123456789ABCDEFGHJKLMNPRSTUVWXYZ+-=/\\|<>#·×'

type RainColumn = {
  x: number
  head: number // row index of the leading glyph, fractional
  speed: number // rows per second
  tail: number // rows of fading trail behind the head
  cells: string[] // glyph per row index, so a character stays put as the trail passes over it
}

/**
 * Digital rain behind the brief.
 *
 * Hand-rolled on a canvas rather than taken as a dependency: the whole of it is
 * a list of columns, a head position and a trail length, and the two decisions
 * that matter here are exactly the ones a library would have made for me.
 *
 * The first is that the canvas stays genuinely transparent. The textbook
 * version of this effect clears each frame by filling the whole canvas with
 * translucent black, which is what gives the trails their fade for nothing —
 * but it also lays a near-black slab across everything behind it, and behind
 * this canvas is the page's own field, which has to keep showing through. So
 * the frame is cleared outright and the fade is computed per glyph instead:
 * alpha falls off as the square of the distance from the head, which is under
 * a percent by the far end of the trail, so a trail ends rather than stops.
 *
 * The second is the direction of travel. A column that runs off the bottom
 * re-enters from above the top edge rather than wrapping in place, and the
 * stylesheet fades the canvas out downward. Between them the rain reads as
 * spilling from behind the ticker and dying before it reaches the copy, rather
 * than as a texture the section happens to be sitting on — see `.hw26-rain`.
 *
 * Nothing here runs during render, and nothing random is read during render:
 * the canvas is empty markup on the server and stays empty until an effect
 * touches it, so there is no hydration mismatch to arrange around.
 */
function BriefRain() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [reduced, setReduced] = useState(false)

  // Read in an effect rather than at first render for the usual reason — the
  // server has no media queries — and kept live, because the setting can be
  // changed while the page is open and this is precisely the kind of thing
  // somebody turns it off for.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const el = canvas.current
    if (!el) return
    const ctx = el.getContext('2d')
    if (!ctx) return

    let raf = 0
    let timer = 0
    let cols: RainColumn[] = []
    let rows = 0
    let colW = 26
    let rowH = 19
    let fontSize = 13
    let frameMs = 1000 / 20
    let cssW = 0
    let cssH = 0
    let family = 'monospace'
    let last = 0
    let cancelled = false
    let narrow = false

    const pick = () => RAIN_GLYPHS[(Math.random() * RAIN_GLYPHS.length) | 0]

    // `seeded` is for the very first field only: the columns are scattered down
    // the section so the rain is already falling when it is first looked at,
    // instead of the whole thing marching in from the top in one wave. Every
    // respawn after that comes back in from above the top edge, which is what
    // makes a column read as falling out from behind the ribbon rather than
    // popping into existence at the point it left.
    //
    // The gap it re-enters through is deliberately short — barely more than
    // the tail itself, so a column is out of sight for about as long as one
    // takes to fall past. A longer random one parked a third of the columns
    // above the top edge at any moment and the field went patchy, which reads
    // as broken rather than as sparse. Sparseness is the column pitch's job;
    // this only has to hide the seam.
    const respawn = (c: RainColumn, seeded: boolean) => {
      c.speed = narrow ? 4 + Math.random() * 4 : 5 + Math.random() * 6
      c.tail = narrow
        ? 9 + ((Math.random() * 7) | 0)
        : 14 + ((Math.random() * 11) | 0)
      c.cells.length = 0
      c.head = seeded
        ? Math.random() * rows
        : -c.tail - Math.random() * rows * 0.05
    }

    const measure = () => {
      const rect = el.getBoundingClientRect()
      cssW = rect.width
      cssH = rect.height
      if (cssW < 1 || cssH < 1) return

      // Phones get fewer, slower, shorter columns and half the frame rate: the
      // section is a third of the width and the whole effect is background, so
      // there is nothing to be gained by spending a battery on it.
      narrow = window.innerWidth < 640
      fontSize = narrow ? 11 : 13
      colW = 26
      rowH = narrow ? 17 : 19
      frameMs = narrow ? 1000 / 12 : 1000 / 20
      rows = Math.ceil(cssH / rowH)

      // Capped at 2 — a third of a device pixel per CSS pixel buys nothing at
      // this weight and costs the whole bitmap again.
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      el.width = Math.round(cssW * dpr)
      el.height = Math.round(cssH * dpr)
      // setTransform rather than scale: this runs again on every resize, and
      // scale multiplies into whatever is already there, so the second call
      // would draw at dpr² and every one after that would be worse.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // A 2d context cannot read a CSS custom property, so the page's mono
      // stack is inherited onto the canvas element and read back off it here
      // already resolved to real family names.
      family = getComputedStyle(el).fontFamily || 'monospace'

      // Laid out centred rather than flush left: the remainder of the division
      // is split between the two edges, so the field is symmetrical about the
      // section instead of leaving a column-wide gutter down the right.
      const n = Math.max(1, Math.floor(cssW / colW))
      const edge = (cssW - n * colW) / 2
      cols = []
      for (let i = 0; i < n; i++) {
        const c: RainColumn = {
          x: edge + i * colW,
          head: 0,
          speed: 0,
          tail: 0,
          cells: [],
        }
        respawn(c, true)
        cols.push(c)
      }
    }

    // Glyphs are chosen per row and kept, not chosen per frame. Rerolling every
    // frame turns the trail into static; holding the character means the trail
    // is a light passing down a column of fixed text, which is the thing being
    // imitated.
    const glyphAt = (c: RainColumn, row: number) => (c.cells[row] ??= pick())

    const draw = () => {
      ctx.clearRect(0, 0, cssW, cssH)
      ctx.font = fontSize + 'px ' + family
      ctx.textBaseline = 'top'

      for (const c of cols) {
        for (let i = 0; i < c.tail; i++) {
          const row = Math.floor(c.head) - i
          if (row < 0 || row > rows) continue
          if (i === 0) {
            // The leading glyph, mint lifted towards white so the head of a
            // column reads as brighter rather than merely as more opaque.
            ctx.fillStyle = 'rgba(205,255,235,0.24)'
          } else {
            const f = 1 - i / c.tail
            // Linear, not curved — and at this strength there is no longer the
            // room to be anything else. On a near-black ground anything under
            // about four percent alpha is off the screen entirely, and the
            // trail now opens at thirteen: the ceiling sits in the floor's
            // neighbourhood, three or four steps above it, with the last rows
            // going under. That is the intent rather than a shortfall — the
            // rain is meant to sit right at the edge of noticeable. But it is
            // also why the ramp cannot go back to being curved: a curve spends
            // most of its length in the bottom of its range, where mint washes
            // out to grey long before it fades out, and there is no range left
            // to spend that way. Linear holds the hue nearly the whole way down
            // and only reaches the floor at the very end, which is the entire
            // point of colouring it mint. 130,245,198 is --hw-mint, #82f5c6.
            ctx.fillStyle = 'rgba(130,245,198,' + (0.13 * f).toFixed(3) + ')'
          }
          ctx.fillText(glyphAt(c, row), c.x, row * rowH)
        }
      }
    }

    const step = (dt: number) => {
      for (const c of cols) {
        c.head += c.speed * dt
        if (c.head - c.tail > rows) respawn(c, false)
        // One character somewhere in the live trail flips per frame or so.
        // Without it the columns are rigid strings sliding past; with it the
        // field keeps twitching even where nothing is moving into view.
        if (Math.random() < 0.25) {
          const r = Math.floor(c.head) - ((Math.random() * c.tail) | 0)
          if (r >= 0) c.cells[r] = pick()
        }
      }
    }

    // The loop runs at 20fps on a desktop and 12 on a phone — the low rate is
    // the effect rather than a concession, since a terminal repainting is what
    // this is meant to be — and the throttle is a timer wrapped around the
    // frame request rather than a check inside it. An early return would still
    // wake the device for every one of the display's 60 or 120 frames a second
    // and discard four fifths of them; a setTimeout only asks for the frames it
    // means to draw. requestAnimationFrame stays in the chain for the one thing
    // a bare interval cannot do: a backgrounded tab stops on its own.
    //
    // `dt` is clamped because the two are not the same thing — coming back to
    // the tab after a minute, an unclamped delta would teleport every column
    // several screens down in one step.
    const frame = (t: number) => {
      raf = 0
      const dt = last ? Math.min((t - last) / 1000, 0.2) : 1 / 30
      last = t
      step(dt)
      draw()
      timer = window.setTimeout(tick, frameMs)
    }

    const tick = () => {
      timer = 0
      raf = requestAnimationFrame(frame)
    }

    const start = () => {
      if (raf || timer) return
      last = 0
      tick()
    }

    const stop = () => {
      if (raf) cancelAnimationFrame(raf)
      if (timer) clearTimeout(timer)
      raf = 0
      timer = 0
    }

    // Reduced motion keeps the field and drops the motion: one static frame,
    // no observer, no loop at all. Redrawn once when the webfont lands, since
    // the only frame there is would otherwise be stuck in the fallback face.
    if (reduced) {
      measure()
      draw()
      document.fonts?.ready.then(() => {
        if (!cancelled) draw()
      })
      return () => {
        cancelled = true
      }
    }

    measure()

    // Its own observer rather than the page's reveal one. That one is a
    // one-shot — it marks an element shown and unobserves it — and this has to
    // keep firing in both directions for the life of the section, because the
    // whole value of it is that nothing is being computed while the rain is off
    // screen. The margin starts it just before the section arrives, so the
    // field is already falling by the time it is looked at rather than filling
    // in from an empty canvas.
    let io: IntersectionObserver | null = null
    if (typeof IntersectionObserver === 'undefined') {
      start()
    } else {
      io = new IntersectionObserver(
        (entries) => {
          const entry = entries[entries.length - 1]
          if (!entry) return
          if (entry.isIntersecting) start()
          else stop()
        },
        { rootMargin: '150px 0px' }
      )
      io.observe(el)
    }

    // Re-measure on resize: the bitmap has a fixed pixel size and the element
    // does not, so the two have to be brought back into step or the field
    // stretches. This cannot feed back into itself — setting `width` and
    // `height` changes the bitmap, not the CSS box the observer is watching.
    let ro: ResizeObserver | null = null
    const onResize = () => {
      measure()
      draw()
    }
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(onResize)
      ro.observe(el)
    } else {
      window.addEventListener('resize', onResize)
    }

    return () => {
      cancelled = true
      stop()
      if (io) io.disconnect()
      if (ro) ro.disconnect()
      else window.removeEventListener('resize', onResize)
    }
  }, [reduced])

  return <canvas aria-hidden className='hw26-rain' ref={canvas} />
}

export function Lander({ hackathon }: { hackathon: HardwareEvent }) {
  const root = useReveal()
  const timeline = useTimelinePin()

  // Two of the partner rows are dealt again on every visit, so no name owns the
  // first plate. Only these two: the sponsor row and the media row hold one
  // name each, the organizers are a fixed pair of hosts, and the two lead
  // Ecosystem cells are a tier of their own where position is the tier — those
  // four stay exactly as written. See `useShuffled` for why the order arrives
  // after the first render rather than during it.
  const ecosystem = useShuffled(SMALL_SPONSORS)
  const hardware = useShuffled(HARDWARE_PARTNERS)

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
      {/* The load sequence is disabled for now — see the commented import at
          the top of this file. Restoring it is those two lines and nothing
          else; intro.tsx and intro.css are unchanged.

          <HardwareIntro /> */}

      {/* ---------------- HERO ---------------- */}
      <header className='hw26-hero'>
        {/* Three layers on one stage, back to front: the lit room, the name,
            then a cutout of the same frame that puts the people back in
            front of it. The stage is what holds the two plates in register —
            see the hero block in lander.css.

            Both plates are `priority`: between them they are the LCP on
            every visit, and the composite is wrong rather than merely
            unfinished if the cutout arrives late. Quality 90 rather than the
            default 75 because the room falls off to black and 75 bands that
            gradient visibly. They stay PNG at source — the cutout needs its
            alpha, and `next/image` serves AVIF and WebP derivatives anyway,
            so the lossless source costs the visitor nothing.

            `alt` is empty on both: they are two halves of one picture, the
            name in it is the h1 between them, and describing either would
            announce the event twice. */}
        <div className='hw26-hero-stage'>
          <Image
            alt=''
            className='hw26-hero-layer hw26-hero-layer--bg'
            fill
            priority
            quality={90}
            sizes='100vw'
            src='/hero/ab-hero-bg.png'
          />

          {/* The document's only h1, and now real text rather than a hidden
              duplicate of pixels — it is set on the page, selectable, and
              indexable. The two words are separate elements because each
              carries its own `data-text` for the glitch copies, so the
              string is repeated per line by necessity; the space between
              them is explicit so the accessible name is not "AlienBazaar".
              Whitespace-only text is never a flex item, so it costs no
              layout. */}
          <h1 className='hw26-hero-title'>
            <span className='hw26-title-word hw26-glitch' data-text='Alien'>
              Alien
            </span>{' '}
            <span className='hw26-title-word hw26-glitch' data-text='Bazaar'>
              Bazaar
            </span>
          </h1>

          <Image
            alt=''
            className='hw26-hero-layer hw26-hero-layer--fg'
            fill
            priority
            quality={90}
            sizes='100vw'
            src='/hero/ab-hero-fg.png'
          />

          {/* The mark, worn as the tittle of ALIEN's I. Last in the stage and
              the only thing above the cutout — it belongs to the wordmark,
              not to the room, so nothing in the photograph crosses it. `alt`
              is empty because it is the same name the h1 above already
              carries, drawn rather than spelled. */}
          {/* Wrapped, and the wrapper is not decoration. The mark wears the
              tube's scanline and grille mask, and a mask clips and modulates
              everything the element paints — including the phosphor bloom
              around it, which came out as a rectangle of striped haze the
              size of the image box. So the span carries the placement and the
              optics and the image inside it carries the mask, which is the
              same split the wordmark makes between the h1 and the two words.
              See the two blocks in the stylesheet. */}
          <span className='hw26-hero-tittle'>
            <Image
              alt=''
              className='hw26-hero-tittle-img'
              height={379}
              priority
              quality={90}
              src='/hero/ab-logo.png'
              width={274}
            />
          </span>
        </div>

        <div className='hw26-hero-panel'>
          {/* The line above the clock says what is being counted towards.
              The when and the where moved to the ribbon directly below the
              fold, which left this line free to make the claim instead —
              the countdown reads as a countdown either way, and a number
              with a claim attached is worth more than a number with a date
              the reader is about to see again. */}
          <p className='hw26-label hw26-hero-when'>
            The biggest hardware hackathon in Europe starts in:
          </p>

          {/* Straight off the event row. The page had a constant of its own
              here while the dates were being decided and the two sources
              disagreed; now that the event is 25–27 September there is one
              source again, and the clock cannot drift from the schedule
              below it. */}
          <Countdown target={hackathon.startsAt} />

          {/* A real <button>, not the anchor this used to be. The control is
              closed for now, and `disabled` is the only thing that makes that
              true rather than merely painted: an anchor with a dimmed class is
              still focusable, still clickable, and still announced as a link
              you can follow. The button takes the same `.hw26-apply` chrome so
              nothing about the panel moves, plus the modifier that dims it. */}
          <button
            className='hw26-apply hw26-apply--disabled'
            disabled
            type='button'
          >
            Join hackathon
          </button>
        </div>
      </header>

      {/* ---------------- TICKER ---------------- */}
      <div className='hw26-ticker'>
        {/* Two tracks so the loop has something to follow it in, and several
            runs of the facts inside each so a track is never narrower than
            the screen — see TICKER_RUNS. Everything after the very first run
            is the same four labels again, so only that one is left in the
            accessibility tree; the rest is texture. */}
        {[0, 1].map((copy) => (
          <div className='hw26-ticker-track' key={copy}>
            {Array.from({ length: TICKER_RUNS }, (_, run) => (
              <span
                aria-hidden={copy > 0 || run > 0}
                className='hw26-ticker-run'
                key={run}
              >
                {TICKER.map((item) => (
                  <span key={item.label}>
                    {item.mint ? <b>{item.label}</b> : item.label}
                    <span style={{ opacity: 0.4 }}>{' ///'}</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* ---------------- THE BRIEF ---------------- */}
      <section className='hw26-section hw26-section--rain hw26-section--centred'>
        <BriefRain />
        <div className='hw26-inner'>
          <div className='hw26-head hw26-reveal'>
            <h2>What is Alien Bazaar?</h2>
          </div>

          {/* The place a reader arrives at wanting answers rather than a
              thesis, which is why it is two paragraphs doing two jobs. The
              first is what the event is: the house, the twenty teams, the
              hardware they are handed, three days, no set task. The second is
              what it costs you and what it is not going to cover.

              The break between them is load-bearing. Free entry, the dates,
              and the flat statement that travel and lodging are the
              participant's own are what someone checks before committing to
              anything. Left to run on at the end of the pitch they read as a
              clause of it — a caveat softening a sales line rather than the
              terms of coming. Standing apart, they are terms.

              The venue and the components and the team count are named here
              as well as in the sections that go into them, and that
              repetition is deliberate: this is the one place a reader should
              not have to assemble the event out of four other sections.

              The measure is finally doing the job it was set for. 64ch was
              chosen for the one passage on the page that is genuinely read
              rather than scanned, and for a while it was holding four
              lines. */}
          <div className='hw26-brief hw26-reveal'>
            <p>
              Alien Bazaar is a new kind of hardware hackathon, happening live
              at Hacker Bloc — a 3-story hacker house in Warsaw. We're
              bringing together the 20 best teams from Europe — engineers who
              are deeply skilled in their category — giving them 20 pieces of
              hardware, access to 3D printers, components, and tools, and
              putting everyone under one roof for 3 days. All the equipment and
              components you need are provided by us. No preset tasks — total
              creative freedom. The main goal: team up and build solutions that
              automate the home.
            </p>
            <p>
              Participation in the hackathon is free. The hackathon will take
              place on September 25–27, 2026. Travel and accommodation outside
              the house are covered by participants themselves — the organizers
              do not reimburse these costs.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- HARDWARE CATEGORIES ---------------- */}
      {/* Its own section rather than a subhead inside the brief above: it
          takes the same head every other section gets. The five categories
          are groups *inside* that one head — they are one inventory, and
          giving each its own display title would read as five unrelated
          sections. What divides them is the medium heading (`.hw26-cat`),
          which is the level this page did not have until this section needed
          it: too big to be lost between the panels, nowhere near the
          section title. */}
      {/* The grid is the graph paper this page is drawn on, and it goes on the
          two sections that are literally sheets of parts: this inventory and
          the partner wall at the bottom. Skipping everything between them is
          what keeps it texture — behind every section it stops being noticed,
          and a page that is uniformly ruled is a page with no ruled sections
          in it. */}
      <section className='hw26-section'>
        <div aria-hidden='true' className='hw26-grid' />
        <div className='hw26-inner'>
          <div className='hw26-head hw26-reveal'>
            <h2>Hardware categories</h2>
          </div>

          {RIG_GROUPS.map((group) => (
            <div className='hw26-rig-group' key={group.label}>
              <h3 className='hw26-cat hw26-reveal'>{group.label}</h3>

              <div className='hw26-rigs'>
                {group.items.map((item, i) => (
                  <RigCell item={item} key={`${item.name}-${i}`} order={i} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- ADD-ONS ---------------- */}
      {/* Directly under the categories because it answers the question the
          last cell leaves open: you have picked a machine, and these are the
          two things in the house that are not one. No group headings — two
          cells do not need dividing — so the medium level is skipped here and
          the entry names sit straight under the `h2`. */}
      <section className='hw26-section'>
        <div className='hw26-inner'>
          <div className='hw26-head hw26-reveal'>
            <h2>Add-ons</h2>
          </div>

          <div className='hw26-rigs'>
            {ADDONS.map((item, i) => (
              <RigCell
                headingLevel={3}
                item={item}
                key={item.name}
                order={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- TIMELINE ---------------- */}
      {/* Sits directly under the inventory because that is what raises the
          question it answers: you have just been told there is one machine
          per team and a finite sheet, and the next thing worth knowing is by
          when. */}
      <section className='hw26-section hw26-tl-section' ref={timeline.section}>
        {/* The frame that sticks. It is an ordinary block until the driver in
            useTimelinePin decides otherwise, which is why a phone, a reader
            under reduced motion and a page with no script all get the plain
            section and none of the machinery. */}
        <div className='hw26-tl-pin'>
          <div className='hw26-inner'>
            <div className='hw26-head hw26-reveal'>
              <h2>Timeline</h2>
            </div>

            {/* The scrollport, and the reason the fallbacks are honest: the
                track is wider than this box above the breakpoint, and when the
                pin is not running this is what the reader can push to reach the
                far end. It sits inside `.hw26-inner` so the line and the
                heading above it start on the same column at every width. */}
            <div className='hw26-tl-port' ref={timeline.port}>
              {/* One grid, two subgrids: the bracket strip and the stops share
                  a track, which is the whole reason a bracket can be placed by
                  naming the stops it spans instead of by measuring anything —
                  and the reason the same markup draws the line down the page on
                  a phone and across it on a desktop. The subgrid is taken on
                  rows in one and on columns in the other; nothing here changes.

                  `--tl-stops` is the stop count, handed to the stylesheet so
                  the parent grid and TIMELINE cannot disagree about how many
                  tracks there are. */}
              <div
                className='hw26-tl-track'
                ref={timeline.track}
                style={{ '--tl-stops': TIMELINE.length } as CSSProperties}
              >
                {/* The brackets. `aria-hidden` because each label is an
                    annotation on a shape — read out of the line it brackets it
                    is a fragment, and the stops themselves already carry the
                    whole sequence in order. */}
                <div aria-hidden='true' className='hw26-tl-braces'>
                  {TIMELINE_SPANS.map((span) => (
                    <div
                      className='hw26-tl-brace'
                      key={span.label}
                      style={
                        {
                          '--tl-span-from': span.from,
                          '--tl-span-to': span.to,
                        } as CSSProperties
                      }
                    >
                      <span className='hw26-label hw26-tl-brace-label'>
                        {span.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* An ordered list, because that is what this is: six things in
                    an order that matters, and the order is the content. */}
                <ol className='hw26-tl-items'>
                  {TIMELINE.map((stop, i) => (
                    <li
                      className={`hw26-tl-item${stop.live ? ' hw26-tl-item--live' : ''}`}
                      key={stop.when + stop.what}
                    >
                      {/* The ordinal, spelled out because the list is not
                          numbered on screen. Hidden from the tree because the
                          `ol` already announces the position, so the glyph
                          would be said twice. */}
                      <span
                        aria-hidden='true'
                        className='hw26-label hw26-tl-step'
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className='hw26-tl-when'>{stop.when}</span>
                      <div className='hw26-tl-body'>
                        <p className='hw26-tl-what'>
                          {stop.secret ? (
                            <SecretLine text={stop.what} />
                          ) : (
                            stop.what
                          )}
                        </p>
                        {/* This and the hero's control were deliberately
                            split — one closed, one open — and that split is
                            gone: both are closed now. So the stop still names
                            the thing to do without pretending it can be done
                            yet, and like the hero's it is a real <button>
                            carrying `disabled` rather than an anchor wearing
                            a dimmed class. Keeps both chrome classes so the
                            note-width sizing survives the change. */}
                        {stop.cta ? (
                          <button
                            className='hw26-apply hw26-tl-cta hw26-apply--disabled'
                            disabled
                            type='button'
                          >
                            Join the chat
                          </button>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- ORGANIZERS & SPONSORS ---------------- */}
      <section className='hw26-section'>
        <div aria-hidden='true' className='hw26-grid' />
        <div className='hw26-inner'>
          <div className='hw26-head hw26-reveal'>
            <h2>Partners &amp; Organizers</h2>
          </div>

          <div className='hw26-subhead hw26-reveal'>
            <span className='hw26-label hw26-label--mint'>Sponsors</span>
            <span className='hw26-poweredby-rule' />
          </div>

          {/* The lead cell, not the wall's small tile: the tier is money, and
              the page says so in the size of the plate rather than in the
              heading alone. One entry still takes one lead slot — half the
              container — because a tile drawn across the whole sheet reads as
              a banner rather than as the first name under a heading that will
              take more. The container shrinks; see `--one` in the
              stylesheet. */}
          <div className='hw26-sponsors-lead hw26-sponsors-lead--one hw26-reveal'>
            {SPONSORS.map((s) => (
              <a
                aria-label={s.name}
                className='hw26-sponsor-lead'
                href={s.href}
                key={s.name}
              >
                <img alt={s.name} className={s.mark} src={s.src} />
              </a>
            ))}
          </div>

          <div className='hw26-subhead hw26-reveal'>
            <span className='hw26-label hw26-label--mint'>
              Ecosystem Partners
            </span>
            <span className='hw26-poweredby-rule' />
          </div>

          {/* Same tile-as-link treatment as the organizers below, and here it
              buys more: the cell was previously dead space beside a link on
              the artwork alone. Marks are served as-authored — running a
              partner's logo through the image optimizer would re-encode it,
              which their brand terms do not allow. */}
          <div className='hw26-sponsors-lead hw26-sponsors-lead--partners hw26-reveal'>
            {LEAD_SPONSORS.map((s) => (
              <a
                aria-label={s.name}
                className='hw26-sponsor-lead'
                href={s.href}
                key={s.name}
              >
                <img alt={s.name} className={s.mark} src={s.src} />
              </a>
            ))}
          </div>

          {/* The second tier, directly under the first and sharing its edge:
              the same tile and the same anchor, at half the width. No subhead
              of its own — these are Ecosystem Partners too, and a second
              heading would be inventing a rank the organizers have not
              published. The size is the whole statement.

              Dealt again per visit, and this row is the easy half of that: it
              is three tiles on three tracks, or three on one below 480px, so
              there is never a leftover to close and nothing in the stylesheet
              selects a position inside it. The order is free to be anything.
              Keys are the partner names, so React moves the existing nodes
              instead of rebuilding them — which matters because the reveal
              observer has already been handed these elements. */}
          <div className='hw26-sponsors-lead hw26-sponsors-lead--small hw26-reveal'>
            {ecosystem.map((s) => (
              <a
                aria-label={s.name}
                className='hw26-sponsor-lead'
                href={s.href}
                key={s.name}
              >
                <img alt={s.name} className={s.mark} src={s.src} />
              </a>
            ))}
          </div>

          <div className='hw26-subhead hw26-reveal'>
            <span className='hw26-label hw26-label--mint'>
              Hardware partners
            </span>
            <span className='hw26-poweredby-rule' />
          </div>

          {/* The wall's smaller tile, and the three rows that use it are the
              same grid with a different count in it. The tile itself is
              `SponsorTile` above.

              Dealt again per visit, and unlike the ecosystem row this one has a
              layout stake in how. Five tiles do not divide by three or by two,
              so the stylesheet closes the short last row by spanning
              `.hw26-sponsor:last-child` across the leftover track. `:last-child`
              is a claim about DOM position, not about where a tile ended up on
              screen — which rules out the tempting implementation, shuffling by
              handing each tile a CSS `order`. That leaves the DOM-last tile
              sitting somewhere in the middle of the grid wearing a double-width
              span, and the actual last tile short. Reordering the array instead
              moves the nodes themselves, and since grid auto-placement follows
              DOM order the visually-last tile and the DOM-last tile stay the
              same element under every permutation, so the span lands where it
              is meant to.

              `key` is the partner name, which is unique here, so React reorders
              the existing DOM nodes rather than tearing them down and building
              new ones — and the reveal observer in `useReveal` is already
              holding these exact elements. */}
          <div className='hw26-sponsors-rest hw26-reveal'>
            {hardware.map((p) => (
              <SponsorTile key={p.name} partner={p} />
            ))}
          </div>

          <div className='hw26-subhead hw26-reveal'>
            <span className='hw26-label hw26-label--mint'>Media partners</span>
            <span className='hw26-poweredby-rule' />
          </div>

          {/* One tile, at the width a tile has in the row above — see the
              `--solo` note in the stylesheet. A group of one stretched across
              the sheet would read as a lead partner filed under the wrong
              heading; at the wall's own tile width it reads as what it is,
              which is the first name under a heading that will take more. */}
          <div className='hw26-sponsors-rest hw26-sponsors-rest--solo hw26-reveal'>
            {MEDIA_PARTNERS.map((p) => (
              <SponsorTile key={p.name} partner={p} />
            ))}
          </div>

          <div className='hw26-subhead hw26-reveal'>
            <span className='hw26-label hw26-label--mint'>Organizers</span>
            <span className='hw26-poweredby-rule' />
          </div>

          {/* The whole tile is the link, not the mark inside it. A logo in a
              cell that is otherwise inert gives the reader a target the size
              of the artwork and a hover state on the cell that promises more
              than it delivers; making the cell itself the anchor is one link
              per tile, no nested interactive content, and the hit area the
              hover was already implying.

              `aria-label` names the organisation, because the accessible name
              would otherwise be the alt text. No `target`: every outbound link
              on this page opens in place, and a sponsor mark is not the one to
              break that with. */}
          <div className='hw26-sponsors-lead hw26-reveal'>
            {ORGANIZERS.map((org) => (
              <a
                aria-label={org.name}
                className='hw26-sponsor-lead'
                href={org.href}
                key={org.name}
              >
                <img
                  alt={org.name}
                  className={`hw26-org-logo${org.mark ? ` ${org.mark}` : ''}`}
                  src={org.src}
                />
              </a>
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
            to wire yours into. Components and benches throughout, and a pitch
            day in front of investors. Applications open on 1 September and
            close on the 15th.
          </p>
          <div className='hw26-reveal'>
            <button
              className='hw26-apply hw26-apply--lg hw26-apply--disabled'
              disabled
              type='button'
            >
              Apply now
            </button>
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
            {/* The stamp used to read "Registration open", which stopped
                being true the moment registration got an opening date of its
                own: for now it is not open, it is announced. Both dates on
                the stamp rather than one, because the window is the fact. */}
            <div className='hw26-stamp'>
              Registration
              <span>01 SEP — 15 SEP 2026</span>
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
              <dd>15 SEP 2026</dd>
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
          <span className='hw26-label'>Epikor × Hacklab · AB—WAW—26</span>
        </div>
      </footer>
    </div>
  )
}
