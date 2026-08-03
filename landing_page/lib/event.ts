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
  slug: 'hardware-hackathon-warsaw-2026',
  title: 'Hardware Hackathon Warsaw 2026',
  summary:
    'Two days, four tracks, and a lab full of robots you can book. Hardware only, at the Hacker House in Warsaw.',
  startsAt: new Date('2026-09-12T09:00:00+02:00'),
  endsAt: new Date('2026-09-13T20:00:00+02:00'),
  timezone: 'Europe/Warsaw',
  location: 'Hacker House powered by Hacklab and Epikor — Warsaw, Poland',
  maxTeamSize: 4,
  capacity: 200,
}

/**
 * Where "Apply now" goes. Points at the event page on hacklab.so; override
 * with NEXT_PUBLIC_APPLY_URL to aim it at a local instance while developing.
 */
export const APPLY_URL =
  process.env.NEXT_PUBLIC_APPLY_URL ??
  `https://hacklab.so/hackathons/${EVENT.slug}`
