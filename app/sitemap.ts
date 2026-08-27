import type { MetadataRoute } from 'next'

import { SITE_URL } from '../lib/event'

/**
 * Every indexable URL on the site — all eight of them, so the list is written
 * out rather than derived. Walking the app directory to generate this would be
 * a build-time filesystem crawl in exchange for saving a few lines, and it
 * would happily publish the next route somebody adds before anyone had decided
 * it should be indexed.
 *
 * `lastModified` is a written date, not `new Date()`. That is the whole point
 * of the field and the one way to get it wrong: stamping build time onto every
 * entry claims the entire site changed on every deploy, which is false and
 * which trains crawlers to ignore the field for this domain. A literal date is
 * a claim somebody made on purpose.
 *
 * The contract that comes with it: when you change what a page *says* — not
 * its styling, not a dependency bump — move its date. If that feels like a
 * chore, leaving a date stale is worse than the alternative, so delete the
 * field for that page instead of letting it lie.
 */

/** ISO dates, one per page. See the note above before editing. */
const LAST_MODIFIED = {
  home: '2026-08-26',
  sponsor: '2026-08-26',
  partner: '2026-08-26',
  partners: '2026-08-26',
  team: '2026-08-26',
  about: '2026-08-26',
  contact: '2026-08-26',
  privacy: '2026-08-26',
} as const

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: LAST_MODIFIED.home,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/sponsor`,
      lastModified: LAST_MODIFIED.sponsor,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/partner`,
      lastModified: LAST_MODIFIED.partner,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/partners`,
      lastModified: LAST_MODIFIED.partners,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/team`,
      lastModified: LAST_MODIFIED.team,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: LAST_MODIFIED.about,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: LAST_MODIFIED.contact,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: LAST_MODIFIED.privacy,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
}
