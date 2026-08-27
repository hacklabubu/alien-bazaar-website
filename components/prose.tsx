import Link from 'next/link'

import {
  GeistPixelCircle,
  GeistPixelGrid,
  GeistPixelLine,
  GeistPixelSquare,
} from '../app/fonts/pixel'
import { Endplate } from './lander'
import './lander.css'
import { type HardwareEvent } from '../lib/event'
import { type Block, type ProsePage, splitInline } from '../lib/prose-pages'

/**
 * The renderer for the three plain pages — about, contact, privacy.
 *
 * One component for all three, because they are one kind of page: a title, a
 * lede, and a run of headed prose. The content lives in lib/prose-pages.ts and
 * is rendered from there in two directions, here as HTML and in lib/markdown
 * as markdown, so the version a person reads and the version an agent
 * negotiates for cannot disagree.
 *
 * Built out of the landing page's own classes — `.hw26-section`, `.hw26-inner`,
 * `.hw26-head`, `.hw26-teamnav` — for the reason team.tsx gives: a lookalike is
 * the thing that drifts. Only the paragraph measure, the list and the two
 * heading levels are new, and those live at the foot of lander.css rather than
 * in a stylesheet of their own — see the note there about the 404 pulling any
 * such file onto every route.
 *
 * A server component. No state, no effects, no handlers — it ships no
 * JavaScript of its own, which for a privacy page that claims the site runs no
 * scripts is not only a performance argument.
 */

function Inline({ text }: { text: string }) {
  return (
    <>
      {splitInline(text).map((piece, i) =>
        'href' in piece ? (
          <a
            className='hw26-link'
            href={piece.href}
            key={i}
            // Mail and in-site links stay in the tab; anything off-site opens
            // away from the page, and carries the rel that makes that safe.
            {...(piece.href.startsWith('http')
              ? { rel: 'noopener noreferrer', target: '_blank' }
              : {})}
          >
            {piece.text}
          </a>
        ) : (
          <span key={i}>{piece.text}</span>
        )
      )}
    </>
  )
}

function ProseBlock({ block }: { block: Block }) {
  if ('ul' in block) {
    return (
      <ul className='hw26-prose-list'>
        {block.ul.map((li) => (
          <li key={li}>
            <Inline text={li} />
          </li>
        ))}
      </ul>
    )
  }
  return (
    <p className='hw26-prose-p'>
      <Inline text={block.p} />
    </p>
  )
}

export function ProsePageView({
  hackathon,
  page,
}: {
  hackathon: HardwareEvent
  page: ProsePage
}) {
  return (
    <div
      className={`hw26 ${GeistPixelCircle.variable} ${GeistPixelGrid.variable} ${GeistPixelSquare.variable} ${GeistPixelLine.variable}`}
    >
      <div className='hw26-teamnav'>
        <Link className='hw26-apply hw26-apply--ghost hw26-apply--nav' href='/'>
          Home
        </Link>
      </div>

      <main>
        <section className='hw26-section'>
          <div className='hw26-inner'>
            <div className='hw26-head'>
              <h1>{page.name}</h1>
            </div>
            <p className='hw26-prose-lede'>
              <Inline text={page.lede} />
            </p>
          </div>
        </section>

        {page.sections.map((section) => (
          <section className='hw26-section hw26-prose-section' key={section.heading}>
            <div className='hw26-inner'>
              <div className='hw26-head'>
                <h2>{section.heading}</h2>
              </div>
              {section.blocks.map((block, i) => (
                <ProseBlock block={block} key={i} />
              ))}
            </div>
          </section>
        ))}
      </main>

      <Endplate hackathon={hackathon} />
    </div>
  )
}
