import type { Metadata, Viewport } from 'next'
import { JetBrains_Mono, Orbitron, Poppins } from 'next/font/google'

import './globals.css'
import { EVENT, SITE_URL } from '../lib/event'
import { buildStructuredData } from '../lib/structured-data'

/**
 * Orbitron for display, JetBrains Mono for everything else — the two-font
 * contrast the hacklab system is built on. The four Geist Pixel cuts are
 * attached by the lander itself, not globally, so they stay scoped to the
 * elements that earn them.
 */
const orbitron = Orbitron({
  subsets: ['latin'],
  variable: '--font-orbitron',
  weight: ['500', '700', '800', '900'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  weight: ['400', '500', '700'],
  display: 'swap',
})

/**
 * Poppins Light, and only that cut: it is not a face this page sets type in,
 * it is one partner's own — GHOST publish their wordmark in Poppins 300, so
 * the tile that carries their icon sets the word beside it in the same thing.
 * One weight, one tile; anything more and it would be a fourth face on a page
 * built on two.
 *
 * `preload: false` for that same reason. One tile, deep in the sponsor wall,
 * is not worth a `<link rel="preload">` racing the hero for the connection —
 * it loads when the wall is on its way into view, and swaps.
 */
const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['300'],
  display: 'swap',
  preload: false,
})

/**
 * `metadataBase` is the one that has to be set: without it Next emits the OG
 * image and every canonical as a relative path, and the crawlers that matter
 * — and the agents that read this page — resolve those against nothing. With
 * it, `alternates.canonical: '/'` and the `opengraph-image.jpg` file
 * convention both come out absolute.
 *
 * The card itself is app/opengraph-image.jpg, picked up by file convention;
 * its dimensions and type are emitted from the file, so there is no image
 * entry to write here and none to keep in sync.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { absolute: EVENT.title },
  description: EVENT.summary,
  alternates: { canonical: '/' },
  openGraph: {
    title: EVENT.title,
    description: EVENT.summary,
    type: 'website',
    url: '/',
    siteName: EVENT.title,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: EVENT.title,
    description: EVENT.summary,
  },
}

export const viewport: Viewport = {
  themeColor: '#070707',
}

/**
 * The page opens at the top, every time. Browsers restore the previous scroll
 * offset on reload, which on this page drops you mid-section with the hero's
 * intro playing behind you; `scrollRestoration = 'manual'` is the switch that
 * turns that off, and it has to be thrown before the browser gets to it.
 *
 * So this runs inline at the top of the body rather than from an effect — an
 * effect fires after first paint, by which point the restored offset has
 * already been painted and undoing it is a visible jump. `scrollTo(0, 0)`
 * covers the browser that ignores the hint; there is no smooth behaviour on
 * it, because at this point in the parse there is nothing to scroll and
 * nothing to animate.
 *
 * `scrollRestoration` is guarded rather than assumed: assigning to a property
 * that does not exist is silent, but the `in` test says which browsers this is
 * for. There are no fragment links on this page, so nothing here is competing
 * with an anchor the visitor asked for.
 *
 * The theme is a separate story: the page is dark, full stop. It used to ship
 * a toggle and a pre-paint script that restored the visitor's stored choice
 * from localStorage; the toggle is gone, and the script had to go with it —
 * left in place it would strand anyone who ever pressed "Light mode" in a
 * theme with no control on the page to leave it. `data-theme` is still stamped
 * here and the light palette is still in lander.css, so reinstating the pair
 * is a button and this same inline-script shape.
 */
const SCROLL_RESET_SCRIPT = `try{if('scrollRestoration' in history)history.scrollRestoration='manual';window.scrollTo(0,0)}catch(e){}`

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      className={`${orbitron.variable} ${jetbrainsMono.variable} ${poppins.variable}`}
      data-theme='dark'
      lang='en'
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: SCROLL_RESET_SCRIPT }} />
        {/* The event and its organizer, in JSON-LD. In the layout rather than
            on the homepage because every route here is a face of the one
            event, and a crawler that lands on /sponsor should get the same
            answer about what this is as one that lands on /.

            One script tag per document — see lib/structured-data.ts for why
            they are two documents rather than one graph. */}
        {buildStructuredData().map((doc) => (
          <script
            dangerouslySetInnerHTML={{ __html: JSON.stringify(doc) }}
            key={doc['@id']}
            type='application/ld+json'
          />
        ))}
        {children}
      </body>
    </html>
  )
}
