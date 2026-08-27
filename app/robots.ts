import type { MetadataRoute } from 'next'

import { SITE_URL } from '../lib/event'

/**
 * Open to everything except the inquiry endpoint, which is a POST handler for
 * the partner and sponsor forms and has nothing to read.
 *
 * There is no separate rule for AI crawlers, and that is the decision rather
 * than an omission: this site is a poster for an event that wants to be found,
 * so an agent asked "hardware hackathons in Europe next year" should be able
 * to read it in full.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: '/api/' }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
