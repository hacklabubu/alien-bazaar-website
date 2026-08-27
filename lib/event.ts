/**
 * The event, as the landing page needs it.
 *
 * On hacklab.so this object comes from the `hackathons` row so the lander can
 * never drift from the event page. Standalone, it is declared here — the same
 * shape, so the component is identical in both places and can be moved back
 * without edits.
 *
 * Times are written with an explicit +02:00 offset (Europe/Warsaw is CEST in
 * September) rather than left to the machine's local zone, so a build running
 * on a server in another timezone cannot shift the dates.
 */

export type HardwareEvent = {
  slug: string
  title: string
  summary: string
  startsAt: Date
  endsAt: Date
  timezone: string
  location: string
  maxTeamSize: number
  capacity: number | null
}

export const EVENT: HardwareEvent = {
  slug: 'ab26',
  title: 'Alien Bazaar — Warsaw 2026',
  summary:
    'Three days of home automation at the Hacker House in Warsaw. Every team books one machine, teams wire their machines into each other, and what gets pitched to investors after 48 work hours is the combined system.',
  // 08:00 on the first day. The doors open at eight and the 48 work hours are
  // counted from there, which is also what the hero clock on the lander counts
  // down to — it reads this field directly, and the FAQ's "what time is it
  // starting" answer is the same figure written out.
  startsAt: new Date('2026-09-25T08:00:00+02:00'),
  endsAt: new Date('2026-09-27T20:00:00+02:00'),
  timezone: 'Europe/Warsaw',
  location: 'Hacker Bloc powered by Epikor and Hacklab — Warsaw, Poland',
  maxTeamSize: 5,
  capacity: 100,
}

/**
 * Where every join control on the site points — the hero, the timeline stop,
 * the closer, and the menu overlay's "Apply now" all read this one constant,
 * so the destination cannot drift between them.
 *
 * The base is the event page on hacklab.so, derived from the slug so a slug
 * change carries; NEXT_PUBLIC_APPLY_URL overrides that base to aim it at a
 * local instance while developing. The join controls point at whichever base
 * is in force, so the override reaches every control.
 */
const APPLY_BASE =
  process.env.NEXT_PUBLIC_APPLY_URL ??
  `https://hacklab.so/hackathons/${EVENT.slug}`

export const JOIN_URL = APPLY_BASE

/**
 * Where this site actually lives — the origin every canonical URL, the OG
 * image URL, and the sitemap are resolved against.
 *
 * The apex 308s to `www`, so `www` is the canonical host and the one written
 * here: pointing canonicals at a redirecting origin makes every page claim a
 * URL that is not the one being served. A preview deployment overrides it
 * through NEXT_PUBLIC_SITE_URL so its canonicals point at itself rather than
 * at production.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.alienbazaar.com'
