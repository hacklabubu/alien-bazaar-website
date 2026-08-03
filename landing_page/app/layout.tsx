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
 * Applies the visitor's stored theme before first paint, so a light-mode
 * visitor never sees a dark flash. Dark is the default for everyone else —
 * the server renders data-theme='dark' and this only ever overrides it.
 */
const THEME_SCRIPT = `try{if(localStorage.getItem('hw26-theme')==='light')document.documentElement.dataset.theme='light'}catch(e){}`

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
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        {children}
      </body>
    </html>
  )
}
