import type { Metadata } from 'next'

import { PartnersPage } from '../../components/partners'
import { EVENT } from '../../lib/event'

export const metadata: Metadata = {
  title: { absolute: `Partners — ${EVENT.title}` },
  description:
    'The international partner network supporting Alien Bazaar Warsaw 2026.',
}

export default function Page() {
  return <PartnersPage hackathon={EVENT} />
}
