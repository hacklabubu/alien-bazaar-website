'use client'

import {
  GeistPixelCircle,
  GeistPixelGrid,
  GeistPixelSquare,
} from '../app/fonts/pixel'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import './lander.css'
import './sponsor.css'
import { InquiryModal } from './inquiry-modal'
import {
  MATRIX,
  PACKAGES,
  type Package,
  type TierId,
} from '../lib/packages'
import { EVENT } from '../lib/event'

const TIERS: TierId[] = ['silver', 'gold', 'platinum', 'uranium']

const TIER_META: Record<
  TierId,
  { emoji: string; short: string; label: string }
> = {
  silver: { emoji: 'Ag', short: 'SLV', label: 'Silver' },
  gold: { emoji: 'Au', short: 'GLD', label: 'Gold' },
  platinum: { emoji: 'Pt', short: 'PLT', label: 'Platinum' },
  uranium: { emoji: 'U', short: 'URN', label: 'Uranium' },
}

function useReveal() {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const nodes = root.current?.querySelectorAll('.hw26-reveal')
    if (!nodes?.length) return

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
      { rootMargin: '0px 0px -10% 0px', threshold: 0.06 }
    )
    for (const n of nodes) io.observe(n)
    return () => io.disconnect()
  }, [])

  return root
}

function MatrixCell({ value }: { value: string | boolean | null }) {
  if (value === true) {
    return (
      <span aria-label='Included' className='ab-sp-check'>
        ✓
      </span>
    )
  }
  if (value === false || value === null) {
    return (
      <span aria-label='Not included' className='ab-sp-dash'>
        —
      </span>
    )
  }
  return <span className='ab-sp-cell-text'>{value}</span>
}

function PackageCard({
  onSelect,
  pkg,
  order,
}: {
  onSelect: (pkg: Package) => void
  pkg: Package
  order: number
}) {
  const featured = pkg.id === 'uranium'

  return (
    <article
      className={`ab-sp-card ab-sp-card--${pkg.id}${featured ? ' ab-sp-card--featured' : ''} hw26-reveal`}
      id={`package-${pkg.id}`}
      style={{ transitionDelay: `${order * 80}ms` }}
    >
      <header className='ab-sp-card-head'>
        <span aria-hidden className='ab-sp-card-emoji'>
          {pkg.emoji}
        </span>
        <span className='hw26-label ab-sp-card-tier'>{pkg.tier}</span>
      </header>

      <p className='ab-sp-card-price'>{pkg.priceLabel}</p>
      <p className='ab-sp-card-tag'>{pkg.tagline}</p>
      <p className='ab-sp-card-pos'>{pkg.positioning}</p>

      <ul className='ab-sp-card-list'>
        {pkg.benefits.slice(0, 5).map((b) => (
          <li key={b}>{b}</li>
        ))}
        {pkg.benefits.length > 5 ? (
          <li className='ab-sp-card-more'>
            +{pkg.benefits.length - 5} more
          </li>
        ) : null}
      </ul>

      <button
        className={`hw26-apply${featured ? '' : ' hw26-apply--ghost'} ab-sp-card-cta`}
        onClick={() => onSelect(pkg)}
        type='button'
      >
        Claim {pkg.tier}
      </button>
    </article>
  )
}

/**
 * Sponsorship packages for Alien Bazaar.
 *
 * Same neoindustrial shell as the lander — phosphor mint, Orbitron display,
 * JetBrains Mono body, chamfered plates — applied to a commercial page
 * rather than an event brochure. The four packages are the product; the
 * matrix is the proof; the deep-dives are the pitch. Uranium sits at the top
 * as the single titular seat, which is why it is the featured plate.
 */
export function SponsorPage() {
  const root = useReveal()
  const [formOpen, setFormOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<string | undefined>()
  const packageOptions = PACKAGES.map(
    (pkg) => `${pkg.tier} — ${pkg.priceLabel}`,
  )

  const openForm = (pkg?: Package) => {
    setSelectedPackage(pkg ? `${pkg.tier} — ${pkg.priceLabel}` : undefined)
    setFormOpen(true)
  }

  return (
    <div
      className={`hw26 ab-sp ${GeistPixelCircle.variable} ${GeistPixelGrid.variable} ${GeistPixelSquare.variable}`}
      ref={root}
    >
      {/* ---------------- TOP BAR ---------------- */}
      <nav className='ab-sp-nav' aria-label='Sponsorship'>
        <Link className='ab-sp-nav-brand' href='/'>
          <span className='ab-sp-nav-mark' aria-hidden>
            👽
          </span>
          <span className='ab-sp-nav-name'>Alien Bazaar</span>
        </Link>
        <span className='hw26-label ab-sp-nav-page'>Sponsorship</span>
        <button className='ab-sp-nav-cta' onClick={() => openForm()} type='button'>
          Get in touch
        </button>
      </nav>

      {/* ---------------- HERO ---------------- */}
      <header className='ab-sp-hero'>
        <div aria-hidden className='hw26-grid ab-sp-hero-grid' />
        <div className='ab-sp-hero-inner'>
          <p className='hw26-label hw26-label--mint ab-sp-hero-eyebrow hw26-reveal'>
            Alien Bazaar · Warsaw 2026 · 25–27 SEP
          </p>
          <h1 className='ab-sp-hero-title hw26-reveal'>
            Sponsorship
            <br />
            <em>packages</em>
          </h1>
          <p className='ab-sp-hero-lead hw26-reveal'>
            Put your brand inside Europe&apos;s sharpest hardware hackathon —
            20 teams, 20 machines, three days at Hacker Bloc in Warsaw. Four
            packages. From final-day visibility to full product integration,
            an official seat on the judging panel, and the titular seat that
            puts your name on the event itself.
          </p>

          <div className='ab-sp-hero-stats hw26-reveal'>
            {PACKAGES.map((pkg) => (
              <div className={`ab-sp-stat ab-sp-stat--${pkg.id}`} key={pkg.id}>
                <span className='ab-sp-stat-emoji' aria-hidden>
                  {pkg.emoji}
                </span>
                <span className='ab-sp-stat-price'>{pkg.priceLabel}</span>
                <span className='hw26-label'>{pkg.tier}</span>
              </div>
            ))}
          </div>

          <div className='ab-sp-hero-actions hw26-reveal'>
            <a className='hw26-apply' href='#packages'>
              View packages
            </a>
            <a className='hw26-apply hw26-apply--ghost' href='#compare'>
              Compare all
            </a>
          </div>
        </div>
      </header>

      {/* ---------------- PACKAGE CARDS ---------------- */}
      <section className='hw26-section' id='packages'>
        <div aria-hidden className='hw26-grid' />
        <div className='hw26-inner'>
          <div className='hw26-head hw26-reveal'>
            <h2>The four tiers</h2>
          </div>
          <p className='ab-sp-section-lead hw26-reveal'>
            Pick the level of integration. Silver joins the final day. Gold
            works alongside the teams. Platinum becomes part of the event
            infrastructure and the intelligence produced around it. Uranium is
            the main titular sponsor — one partner, whose name the event
            carries.
          </p>

          <div className='ab-sp-cards'>
            {PACKAGES.map((pkg, i) => (
              <PackageCard
                key={pkg.id}
                onSelect={openForm}
                order={i}
                pkg={pkg}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- COMPARISON MATRIX ---------------- */}
      <section className='hw26-section ab-sp-matrix-section' id='compare'>
        <div className='hw26-inner'>
          <div className='hw26-head hw26-reveal'>
            <h2>Full comparison</h2>
          </div>
          <p className='ab-sp-section-lead hw26-reveal'>
            Every benefit, side by side. Scroll the table on smaller screens —
            the tiers stay pinned.
          </p>

          <div className='ab-sp-matrix-wrap hw26-reveal'>
            <table className='ab-sp-matrix'>
              <thead>
                <tr>
                  <th scope='col' className='ab-sp-matrix-cat'>
                    Category
                  </th>
                  {TIERS.map((tier) => (
                    <th
                      className={`ab-sp-matrix-tier ab-sp-matrix-tier--${tier}`}
                      key={tier}
                      scope='col'
                    >
                      <span aria-hidden className='ab-sp-matrix-emoji'>
                        {TIER_META[tier].emoji}
                      </span>
                      <span className='ab-sp-matrix-tier-name'>
                        {TIER_META[tier].label}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MATRIX.map((row) => (
                  <tr key={row.category}>
                    <th className='ab-sp-matrix-cat' scope='row'>
                      {row.category}
                    </th>
                    {TIERS.map((tier) => (
                      <td
                        className={`ab-sp-matrix-cell ab-sp-matrix-cell--${tier}`}
                        key={tier}
                      >
                        <MatrixCell value={row.values[tier]} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ---------------- DEEP DIVES ---------------- */}
      <section className='hw26-section' id='details'>
        <div aria-hidden className='hw26-grid' />
        <div className='hw26-inner'>
          <div className='hw26-head hw26-reveal'>
            <h2>Package details</h2>
          </div>

          <div className='ab-sp-dives'>
            {PACKAGES.map((pkg, i) => (
              <article
                className={`ab-sp-dive ab-sp-dive--${pkg.id} hw26-reveal`}
                id={pkg.id}
                key={pkg.id}
                style={{ transitionDelay: `${(i % 2) * 60}ms` }}
              >
                <header className='ab-sp-dive-head'>
                  <div className='ab-sp-dive-titles'>
                    <span className='hw26-label hw26-label--mint'>
                      {pkg.emoji} {pkg.tier} · {pkg.priceLabel}
                    </span>
                    <h3 className='ab-sp-dive-title'>{pkg.tagline}</h3>
                  </div>
                </header>

                <p className='ab-sp-dive-summary'>{pkg.summary}</p>

                <div className='ab-sp-dive-body'>
                  <div>
                    <p className='hw26-label ab-sp-dive-list-label'>You get</p>
                    <ul className='ab-sp-dive-list'>
                      {pkg.benefits.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                  </div>

                  {pkg.bestFor ? (
                    <aside className='ab-sp-dive-aside'>
                      <p className='ab-sp-dive-bestfor'>{pkg.bestFor}</p>
                    </aside>
                  ) : null}
                </div>

                {pkg.closer ? (
                  <p className='ab-sp-dive-closer'>{pkg.closer}</p>
                ) : null}

                <button
                  className={`hw26-apply${pkg.id === 'uranium' ? '' : ' hw26-apply--ghost'} ab-sp-dive-cta`}
                  onClick={() => openForm(pkg)}
                  type='button'
                >
                  Claim {pkg.tier} · {pkg.priceLabel}
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- CLOSER ---------------- */}
      <section className='hw26-section hw26-closer ab-sp-closer'>
        <div className='hw26-inner'>
          <h2 className='hw26-reveal'>
            Don&apos;t sponsor
            <br />
            from the outside
          </h2>
          <p className='hw26-reveal'>
            Alien Bazaar is twenty teams, twenty machines, and three days of
            building home automation under one roof in Warsaw. Silver brings
            you to the final pitches. Gold puts you beside the teams for all
            three days. Platinum integrates your product, gives you the data
            and puts you on the judging panel. Uranium puts your name on the
            event.
          </p>
          <div className='ab-sp-closer-actions hw26-reveal'>
            <button
              className='hw26-apply hw26-apply--lg'
              onClick={() => openForm()}
              type='button'
            >
              Become a sponsor
            </button>
            <Link className='hw26-apply hw26-apply--ghost hw26-apply--lg' href='/'>
              Back to event
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- END PLATE ---------------- */}
      <footer className='hw26-endplate'>
        <div aria-hidden className='hw26-endplate-hazard' />
        <p aria-hidden className='hw26-endplate-bleed'>
          2026
        </p>

        <div className='hw26-endplate-body'>
          <div className='hw26-endplate-top'>
            <p className='hw26-endplate-mark'>
              Alien Bazaar
              <br />
              <em>Sponsors</em>
            </p>
            <div className='hw26-stamp'>
              Open for partners
              <span>4 PARTNERSHIP TIERS</span>
            </div>
          </div>

          <dl className='hw26-titleblock'>
            <div className='hw26-tb'>
              <dt>Project</dt>
              <dd>AB—WAW—26</dd>
            </div>
            <div className='hw26-tb'>
              <dt>Sheet</dt>
              <dd>SPONSOR</dd>
            </div>
            <div className='hw26-tb hw26-tb--mint'>
              <dt>Status</dt>
              <dd>Open</dd>
            </div>
            <div className='hw26-tb'>
              <dt>Event</dt>
              <dd>25–27 SEP 2026</dd>
            </div>
            <div className='hw26-tb'>
              <dt>Venue</dt>
              <dd>Hacker Bloc</dd>
            </div>
            <div className='hw26-tb'>
              <dt>City</dt>
              <dd>Warsaw</dd>
            </div>
            <div className='hw26-tb'>
              <dt>Silver</dt>
              <dd>$5K</dd>
            </div>
            <div className='hw26-tb'>
              <dt>Gold</dt>
              <dd>$10K</dd>
            </div>
            <div className='hw26-tb'>
              <dt>Platinum</dt>
              <dd>$20K</dd>
            </div>
            <div className='hw26-tb hw26-tb--mint'>
              <dt>Uranium</dt>
              <dd>$60K</dd>
            </div>
          </dl>
        </div>

        <div className='hw26-endplate-foot'>
          <span className='hw26-label'>{EVENT.location}</span>
          <div aria-hidden className='hw26-ticks'>
            {Array.from({ length: 24 }, (_, i) => (
              <i key={`tick-${i}`} />
            ))}
          </div>
          <span className='hw26-label'>Epikor × Hacklab · AB—WAW—26</span>
        </div>
      </footer>

      {formOpen ? (
        <InquiryModal
          initialCategory={selectedPackage}
          kind='sponsor'
          onClose={() => setFormOpen(false)}
          options={packageOptions}
        />
      ) : null}
    </div>
  )
}
