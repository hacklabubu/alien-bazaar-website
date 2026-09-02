import type { Metadata } from 'next'

import { AgendaPage } from '../../components/agenda'
import { EVENT } from '../../lib/event'

export const metadata: Metadata = {
  title: { absolute: `Agenda — ${EVENT.title}` },
  description:
    'The three-day running order for Alien Bazaar Warsaw 2026, from doors to afterparty.',
}

export default function Page() {
  return <AgendaPage hackathon={EVENT} />
}
