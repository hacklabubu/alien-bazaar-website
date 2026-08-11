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
  slug: 'alien-bazaar-warsaw-2026',
  title: 'Alien Bazaar — Warsaw 2026',
  summary:
    'Three days of home automation at the Hacker House in Warsaw. Every team books one machine, teams wire their machines into each other, and what gets pitched to investors after 48 work hours is the combined system.',
  // Noon on the first day, not the morning: the doors open at 12:00 and the
  // 48 work hours are counted from there, which is also what the hero clock
  // on the lander counts down to — it reads this field directly.
  startsAt: new Date('2026-09-25T12:00:00+02:00'),
  endsAt: new Date('2026-09-27T20:00:00+02:00'),
  timezone: 'Europe/Warsaw',
  location: 'Hacker Bloc powered by Epikor and Hacklab — Warsaw, Poland',
  maxTeamSize: 4,
  capacity: 100,
}

/**
 * Where "Apply now" goes. Points at the event page on hacklab.so; override
 * with NEXT_PUBLIC_APPLY_URL to aim it at a local instance while developing.
 */
export const APPLY_URL =
  process.env.NEXT_PUBLIC_APPLY_URL ??
  `https://hacklab.so/hackathons/${EVENT.slug}`
