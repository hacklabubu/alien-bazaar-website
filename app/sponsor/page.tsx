import type { Metadata } from 'next'

import { SponsorPage } from '../../components/sponsor'
import { EVENT } from '../../lib/event'

export const metadata: Metadata = {
  title: { absolute: `Sponsorship — ${EVENT.title}` },
  description:
    'Sponsorship packages for Alien Bazaar Warsaw 2026: Gold, Diamond and Uranium — from final-day access to full event and product integration.',
  openGraph: {
    title: `Sponsorship — ${EVENT.title}`,
    description:
      'Three partnership tiers. Put your brand, product and team inside Alien Bazaar — 20 teams, 20 machines, three days in Warsaw.',
    type: 'website',
  },
}

export default function Page() {
  return <SponsorPage />
}
