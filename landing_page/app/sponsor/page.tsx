import type { Metadata } from 'next'

import { SponsorPage } from '../../components/sponsor'
import { EVENT } from '../../lib/event'

export const metadata: Metadata = {
  title: { absolute: `Sponsorship — ${EVENT.title}` },
  description:
    'Sponsorship packages for Alien Bazaar Warsaw 2026. Bronze, Silver, Gold and Platinum tiers — from digital support to owning a piece of Europe\'s sharpest hardware hackathon.',
  openGraph: {
    title: `Sponsorship — ${EVENT.title}`,
    description:
      'Four tiers. Forty-five spots. Put your brand inside Alien Bazaar — 20 teams, 20 machines, three days in Warsaw.',
    type: 'website',
  },
}

export default function Page() {
  return <SponsorPage />
}
