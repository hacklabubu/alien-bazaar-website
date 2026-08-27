import type { Metadata } from 'next'

import { SponsorPage } from '../../components/sponsor'
import { EVENT } from '../../lib/event'

export const metadata: Metadata = {
  title: { absolute: `Sponsorship — ${EVENT.title}` },
  description:
    'Sponsorship packages for Alien Bazaar Warsaw 2026: Silver, Gold, Platinum and Uranium — from final-day access to full product integration and the titular seat.',
  openGraph: {
    title: `Sponsorship — ${EVENT.title}`,
    description:
      'Four partnership tiers, up to the titular Uranium seat. Put your brand, product and team inside Alien Bazaar — 20 teams, 20 machines, three days in Warsaw.',
    type: 'website',
  },
}

export default function Page() {
  return <SponsorPage />
}
