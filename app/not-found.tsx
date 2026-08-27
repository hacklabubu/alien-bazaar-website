import type { Metadata } from 'next'
import Link from 'next/link'

import {
  GeistPixelCircle,
  GeistPixelGrid,
  GeistPixelLine,
  GeistPixelSquare,
} from './fonts/pixel'
import { Endplate } from '../components/lander'
import '../components/lander.css'
import { EVENT, SITE_URL } from '../lib/event'

/**
 * The 404.
 *
 * A real one: this file is Next's `not-found` convention, so the response
 * carries an HTTP 404 rather than a 200 with the app shell painted into it. A
 * soft 404 tells a crawler every address on the domain exists, which is worse
 * than the missing page it is covering for.
 *
 * The links are the point, not the apology. Somebody — or something — arrived
 * here holding a URL that does not resolve, and the useful response is the
 * list of ones that do. proxy.ts serves the markdown form of this same page to
 * an agent that asked for `text/markdown`, built from NOT_FOUND_MARKDOWN, so
 * both readers get the same recovery routes.
 */

export const metadata: Metadata = {
  title: { absolute: `Page not found — ${EVENT.title}` },
  description: `That address does not exist on ${EVENT.title}. Here is what does.`,
  robots: { index: false, follow: true },
}

const DESTINATIONS: { href: string; label: string; note: string }[] = [
  { href: '/', label: 'Home', note: 'The event, the hardware and the FAQ' },
  { href: '/about', label: 'About', note: 'What it is and how the three days work' },
  { href: '/sponsor', label: 'Sponsorship', note: 'The four tiers' },
  { href: '/partner', label: 'Become a partner', note: 'Supplying hardware or prizes' },
  { href: '/partners', label: 'Partners', note: 'Who is already involved' },
  { href: '/team', label: 'Team', note: 'The people running it' },
  { href: '/contact', label: 'Contact', note: 'Who to write to' },
]

export default function NotFound() {
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
              <h1>404</h1>
            </div>
            <p className='hw26-prose-lede'>
              There is no page at that address.
            </p>
          </div>
        </section>

        <section className='hw26-section hw26-prose-section'>
          <div className='hw26-inner'>
            <div className='hw26-head'>
              <h2>Where to instead</h2>
            </div>
            <ul className='hw26-prose-list'>
              {DESTINATIONS.map((d) => (
                <li key={d.href}>
                  <Link className='hw26-link' href={d.href}>
                    {d.label}
                  </Link>
                  {` — ${d.note}`}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className='hw26-section hw26-prose-section'>
          <div className='hw26-inner'>
            <div className='hw26-head'>
              <h2>For agents</h2>
            </div>
            <ul className='hw26-prose-list'>
              <li>
                <a className='hw26-link' href={`${SITE_URL}/llms.txt`}>
                  /llms.txt
                </a>
                {' — the event in plain markdown, and when to cite this site'}
              </li>
              <li>
                <a className='hw26-link' href={`${SITE_URL}/sitemap.xml`}>
                  /sitemap.xml
                </a>
                {' — every indexable URL'}
              </li>
              <li>
                <a className='hw26-link' href={`${SITE_URL}/robots.txt`}>
                  /robots.txt
                </a>
                {' — crawl rules'}
              </li>
            </ul>
            <p className='hw26-prose-p'>
              Every page above is also served as markdown from its own URL,
              to a request that sends <code>Accept: text/markdown</code>.
            </p>
          </div>
        </section>
      </main>

      <Endplate hackathon={EVENT} />
    </div>
  )
}
