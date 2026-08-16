'use client'

import {
  GeistPixelCircle,
  GeistPixelGrid,
  GeistPixelLine,
  GeistPixelSquare,
} from 'geist/font/pixel'
import Link from 'next/link'
import { useState } from 'react'

import { type HardwareEvent } from '../lib/event'
import { Endplate } from './lander'
import { InquiryModal } from './inquiry-modal'
import './lander.css'
import './partner.css'

const PARTNER_TYPES = [
  {
    index: '01',
    title: 'Ecosystem partner',
    copy: 'Communities, accelerators, associations and organizations growing the builder ecosystem.',
  },
  {
    index: '02',
    title: 'Hardware partner',
    copy: 'Robots, tools, components or equipment that teams can build with during the hackathon.',
  },
  {
    index: '03',
    title: 'Media partner',
    copy: 'Editorial coverage, creator content, interviews and distribution before, during or after the event.',
  },
  {
    index: '04',
    title: 'Prize partner',
    copy: 'Products, services, credits or experiences awarded to the teams and builders.',
  },
] as const

export function PartnerPage({ hackathon }: { hackathon: HardwareEvent }) {
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const options = PARTNER_TYPES.map((type) => type.title)

  return (
    <div
      className={`hw26 ab-partner ${GeistPixelCircle.variable} ${GeistPixelGrid.variable} ${GeistPixelSquare.variable} ${GeistPixelLine.variable}`}
    >
      <div className='hw26-teamnav ab-partner-nav'>
        <Link className='hw26-apply hw26-apply--ghost hw26-apply--nav' href='/partners'>
          Partners
        </Link>
        <Link className='hw26-apply hw26-apply--ghost hw26-apply--nav' href='/'>
          Home
        </Link>
      </div>

      <main>
        <section className='hw26-section ab-partner-hero'>
          <div aria-hidden='true' className='hw26-grid' />
          <div className='hw26-inner'>
            <p className='hw26-label hw26-label--mint'>Partner with Alien Bazaar</p>
            <div className='hw26-head'>
              <h2>Choose your role</h2>
            </div>
            <p className='ab-partner-lead'>
              Select the type that fits your organization. We will open a ready-to-send email for that partnership track.
            </p>

            <div className='ab-partner-grid'>
              {PARTNER_TYPES.map((type) => (
                <article className='ab-partner-card' key={type.title}>
                  <span className='ab-partner-index'>{type.index}</span>
                  <h3>{type.title}</h3>
                  <p>{type.copy}</p>
                  <button
                    className='ab-partner-card-cta'
                    onClick={() => setSelectedType(type.title)}
                    type='button'
                  >
                    Choose this type <span aria-hidden='true'>→</span>
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Endplate hackathon={hackathon} />

      {selectedType ? (
        <InquiryModal
          initialCategory={selectedType}
          kind='partner'
          onClose={() => setSelectedType(null)}
          options={options}
        />
      ) : null}
    </div>
  )
}
