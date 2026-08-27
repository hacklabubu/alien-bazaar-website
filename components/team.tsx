import {
  GeistPixelCircle,
  GeistPixelGrid,
  GeistPixelLine,
  GeistPixelSquare,
} from '../app/fonts/pixel'
import Image from 'next/image'
import Link from 'next/link'

import { Endplate } from './lander'
import './lander.css'
import { type HardwareEvent } from '../lib/event'

/**
 * The team page.
 *
 * Its own file rather than a third section of the lander. The two pages share
 * a stylesheet, a footer and a button, and nothing else: the lander is a
 * scroll piece with an observer, a pinned timeline and a canvas in it, and
 * none of that has anything to say about a wall of faces. Keeping them apart
 * is what stops this page inheriting machinery it does not use.
 *
 * What it does borrow, it borrows literally — `.hw26-head`, `.hw26-section`,
 * `.hw26-rigs`, `.hw26-rig` — because a lookalike is the thing that drifts. A
 * section title here is the same element the landing page's section titles
 * are, so the rule above it, its size and its weight cannot come out slightly
 * different.
 *
 * No `hw26-reveal`. That class is the unrevealed half of a pair: on its own it
 * is `opacity: 0` and a 26px offset, and it only comes back when `useReveal`'s
 * observer stamps `data-shown` on the element. The hook is internal to
 * lander.tsx and exporting it — with the ref plumbing and the effect that goes
 * with it — to fade in thirteen static tiles is more machine than the page is.
 * Without the class the tiles are simply visible, which is what a page with no
 * scroll story should be.
 *
 * Not a client component. There is no state, no effect and no event handler
 * anywhere in it, so it renders on the server and ships no JavaScript of its
 * own; `Endplate` is the same — the lander's `'use client'` is a fact about
 * that module's other exports, and importing a component out of a client
 * module is allowed from a server one.
 */

/**
 * The roster, such as it is.
 *
 * Placeholder names, and deliberately shaped like placeholders. The
 * alternative is inventing plausible ones, which puts nine fictional
 * people on a real page under a real heading — and a name that reads as a name
 * is the kind of stand-in that survives to production because nobody scanning
 * the page can tell it is one. "Team Member 4" cannot.
 *
 * One photograph for all nine, which is the same admission said in
 * pictures: there is no roster yet. It is a stock frame, so it is `alt=''` —
 * see the note on the tile.
 */
const PERSON_PHOTO = '/team/tba.svg'

const ORGANIZERS = Array.from({ length: 3 }, (_, i) => `Team Member ${i + 1}`)
const MENTORS = Array.from({ length: 3 }, (_, i) => `Team Member ${i + 4}`)
const VOLUNTEERS = Array.from({ length: 3 }, (_, i) => `Team Member ${i + 7}`)

/**
 * One face in a hardware cell.
 *
 * Its own component rather than `RigCell` with another flag on it. That
 * component reads a `Rig`, and `Rig` is an inventory record — a count, a TBA
 * marker, an `unannounced` gate, a supplier credit — with a long argument
 * attached to each of those fields about what it may and may not claim about a
 * machine. A person is none of those things, and the way to keep that model
 * honest is to not put people in it. The panel is shared; the data model is
 * not.
 *
 * So: the plate and the name, and nothing else the inventory cell carries. No
 * count, because a person is not stock. No caption, because the name is the
 * whole of what the tile says. No credit, because nobody supplied them.
 *
 * `.hw26-rig` plain, not `--compact`. The compact variant shrinks to its
 * content and is cut for cells that are mostly type; here the picture is the
 * content, and the full panel's floor height is what gives it room to be one.
 *
 * `alt=''` and `fill`, the same as the inventory plates. The photograph is a
 * stock frame standing in for a person who has not been named yet, so
 * describing it would be describing a placeholder as though it were someone;
 * the `h4` under it is what names the tile either way.
 */
function PersonCell({ name }: { name: string }) {
  return (
    <article className='hw26-rig hw26-rig--person'>
      <div className='hw26-rig-photo'>
        <Image
          alt=''
          fill
          sizes='(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw'
          src={PERSON_PHOTO}
        />
      </div>

      <h4 className='hw26-rig-name'>{name}</h4>
    </article>
  )
}

/**
 * A heading and its grid — the shape both halves of this page take, written
 * once. Same `.hw26-head` block the landing page's own titles use, so the two
 * pages' section titles are the same object rather than two that resemble each
 * other.
 */
function PeopleSection({ people, title }: { people: string[]; title: string }) {
  return (
    <section className='hw26-section'>
      <div className='hw26-inner'>
        <div className='hw26-head'>
          <h2>{title}</h2>
        </div>

        <div className='hw26-rigs'>
          {people.map((name) => (
            <PersonCell key={name} name={name} />
          ))}
        </div>
      </div>
    </section>
  )
}

export function TeamPage({ hackathon }: { hackathon: HardwareEvent }) {
  return (
    /*
     * The same root the lander opens with, and it is not optional: every rule
     * in lander.css is scoped under `.hw26`, so without this class the page
     * renders as unstyled markup. The four Geist Pixel cuts ride along for the
     * same reason they do there — the stylesheet reaches them as variables,
     * and the section titles under `.hw26-cat` and the plate number in the
     * footer are set in two of them.
     */
    <div
      className={`hw26 ${GeistPixelCircle.variable} ${GeistPixelGrid.variable} ${GeistPixelSquare.variable} ${GeistPixelLine.variable}`}
    >
      {/* The way back, in the same corner and the same cut as the hero's link
          out — see `.hw26-apply--nav`. One class list, two destinations, so
          the pair reads as one control the site moves between rather than as
          two buttons that happen to look alike.

          In the flow here rather than absolutely positioned. On the hero it
          floats because the hero is a fixed composite with no room in its
          column; this page has no art to float over, and a link pinned over
          the top of a section title would only be covering the thing it sits
          above. */}
      <div className='hw26-teamnav'>
        <Link className='hw26-apply hw26-apply--ghost hw26-apply--nav' href='/'>
          Home
        </Link>
      </div>

      <PeopleSection people={ORGANIZERS} title='Organizers' />
      <PeopleSection people={MENTORS} title='Mentors' />
      <PeopleSection people={VOLUNTEERS} title='Volunteers' />

      <Endplate hackathon={hackathon} />
    </div>
  )
}
