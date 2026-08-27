import type { Metadata } from 'next'

import { ProsePageView } from '../../components/prose'
import { EVENT } from '../../lib/event'
import { ABOUT } from '../../lib/prose-pages'

export const metadata: Metadata = {
  title: { absolute: ABOUT.title },
  description: ABOUT.description,
  alternates: { canonical: '/about' },
  openGraph: {
    title: ABOUT.title,
    description: ABOUT.description,
    type: 'website',
    url: '/about',
  },
}

export default function Page() {
  return <ProsePageView hackathon={EVENT} page={ABOUT} />
}
