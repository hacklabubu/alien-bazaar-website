import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { ImageResponse } from 'next/og'

import { EVENT } from '../lib/event'

/**
 * The share card: the hero plate fading in from the right, the
 * wordmark, and where and when. The page's two faces, its mint, its
 * near-black — nothing else. Rendered once at build time.
 */
export const alt = EVENT.title
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const MINT = '#82f5c6'
const VOID = '#070707'
const BONE = '#c3c3c3'

/** Satori takes TTF/OTF, not woff2 — ask Google Fonts for the subset we set. */
async function googleFont(family: string, weight: number, text: string) {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, '+')}:wght@${weight}&text=${encodeURIComponent(text)}`,
  ).then((res) => res.text())
  const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1]
  if (!url) throw new Error(`Font not found: ${family} ${weight}`)
  return fetch(url).then((res) => res.arrayBuffer())
}

export default async function Image() {
  const hero = await readFile(join(process.cwd(), 'public/hero/ab-hero-bg.png'))
  const src = (buf: Buffer) => `data:image/png;base64,${buf.toString('base64')}`

  const display = 'ALIEN BAZAAR'
  const facts = ['WARSAW', '25—27.09.2026']

  const [chakra, mono] = await Promise.all([
    googleFont('Chakra Petch', 700, display),
    googleFont('JetBrains Mono', 500, facts.join('')),
  ])

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: VOID,
        }}
      >
        {/* The plate, pushed right so the crowd sits behind the fade. */}
        <img
          alt=''
          src={src(hero)}
          width={1126}
          height={630}
          style={{ position: 'absolute', top: 0, right: -180 }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            backgroundImage: `linear-gradient(90deg, ${VOID} 0%, ${VOID} 22%, rgba(7,7,7,0.85) 42%, rgba(7,7,7,0.3) 62%, rgba(7,7,7,0) 78%)`,
          }}
        />


        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '72px 80px',
            height: '100%',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                fontFamily: 'Chakra Petch',
                fontSize: 128,
                lineHeight: 0.88,
                letterSpacing: -2,
                color: '#ffffff',
              }}
            >
              <span>ALIEN</span>
              <span>BAZAAR</span>
            </div>
            <div
              style={{
                display: 'flex',
                gap: 24,
                fontFamily: 'JetBrains Mono',
                fontSize: 24,
                letterSpacing: 2,
                color: BONE,
              }}
            >
              <span style={{ color: MINT }}>{facts[0]}</span>
              <span>{facts[1]}</span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Chakra Petch', data: chakra, weight: 700 },
        { name: 'JetBrains Mono', data: mono, weight: 500 },
      ],
    },
  )
}
