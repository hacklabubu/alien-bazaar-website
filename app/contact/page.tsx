import type { Metadata } from 'next'

import { ProsePageView } from '../../components/prose'
import { EVENT } from '../../lib/event'
import { CONTACT } from '../../lib/prose-pages'

export const metadata: Metadata = {
  title: { absolute: CONTACT.title },
  description: CONTACT.description,
  alternates: { canonical: '/contact' },
  openGraph: {
    title: CONTACT.title,
    description: CONTACT.description,
    type: 'website',
    url: '/contact',
  },
}

export default function Page() {
  return <ProsePageView hackathon={EVENT} page={CONTACT} />
}
