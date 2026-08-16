import type { Metadata } from 'next'

import { PartnerPage } from '../../components/partner'
import { EVENT } from '../../lib/event'

export const metadata: Metadata = {
  title: { absolute: `Become a partner — ${EVENT.title}` },
  description:
    'Choose how your organization wants to partner with Alien Bazaar Warsaw 2026.',
}

export default function Page() {
  return <PartnerPage hackathon={EVENT} />
}
