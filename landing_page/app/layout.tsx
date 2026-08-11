import type { Metadata, Viewport } from 'next'
import { JetBrains_Mono, Orbitron } from 'next/font/google'
import localFont from 'next/font/local'

import './globals.css'
import { EVENT } from '../lib/event'

/**
 * Orbitron for display, JetBrains Mono for everything else — the two-font
 * contrast the hacklab system is built on. Terminess is here for one job: the
 * ASCII craft in the hero, which needs a real terminal face to hold its shape.
 * The four Geist Pixel cuts are attached by the lander itself, not globally,
 * so they stay scoped to the elements that earn them.
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

const terminess = localFont({
  src: './fonts/TerminessNerdFont-Regular.woff2',
  variable: '--font-terminess',
  weight: '400',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { absolute: EVENT.title },
  description: EVENT.summary,
  openGraph: {
    title: EVENT.title,
    description: EVENT.summary,
    type: 'website',
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
      className={`${orbitron.variable} ${jetbrainsMono.variable} ${terminess.variable}`}
      data-theme='dark'
      lang='en'
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: SCROLL_RESET_SCRIPT }} />
        {children}
      </body>
    </html>
  )
}
