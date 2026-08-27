import type { Metadata } from 'next'

import { ProsePageView } from '../../components/prose'
import { EVENT } from '../../lib/event'
import { PRIVACY } from '../../lib/prose-pages'

export const metadata: Metadata = {
  title: { absolute: PRIVACY.title },
  description: PRIVACY.description,
  alternates: { canonical: '/privacy' },
  openGraph: {
    title: PRIVACY.title,
    description: PRIVACY.description,
    type: 'website',
    url: '/privacy',
  },
}

export default function Page() {
  return <ProsePageView hackathon={EVENT} page={PRIVACY} />
}
