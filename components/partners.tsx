import {
  GeistPixelCircle,
  GeistPixelGrid,
  GeistPixelLine,
  GeistPixelSquare,
} from '../app/fonts/pixel'
import Link from 'next/link'

import { type HardwareEvent } from '../lib/event'
import { Endplate, PartnerDirectory } from './lander'
import './lander.css'

export function PartnersPage({ hackathon }: { hackathon: HardwareEvent }) {
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
        <PartnerDirectory />

        <section className='hw26-section'>
          <div aria-hidden='true' className='hw26-grid' />
          <div className='hw26-inner'>
            <div className='hw26-head'>
              <h2>Partner network</h2>
            </div>

            <div className='hw26-partners-map'>
              <div className='hw26-partners-map-meta'>
                <span>Partner network</span>
                <span>06 countries</span>
              </div>
              <picture>
                <source
                  media='(orientation: landscape) and (max-height: 700px)'
                  srcSet='/partners-world-map-landscape.svg'
                />
                <source
                  media='(max-width: 900px)'
                  srcSet='/partners-world-map-mobile.svg'
                />
                <img
                  alt='Partner locations: United States, England, Germany, Switzerland, Poland and China. Alien Bazaar is based in Poland.'
                  src='/partners-world-map.svg'
                />
              </picture>
            </div>
          </div>
        </section>
      </main>

      <Endplate hackathon={hackathon} />
    </div>
  )
}
