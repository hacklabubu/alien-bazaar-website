import { EVENT, JOIN_URL, SITE_URL } from './event'

/**
 * The page, restated for machines.
 *
 * Everything here is already on the page in prose — the dates, the venue, the
 * capacity, that it costs nothing. This is the same set of facts in the shape
 * a crawler or an agent can read without parsing the poster, and it is built
 * from the same `EVENT` object the visible copy is built from, so the two
 * cannot drift: change the start date in lib/event.ts and the hero clock, the
 * FAQ and this graph all move together.
 *
 * Two documents, not one `@graph`. The graph form is the tidier way to say
 * "this event, run by this organization" — one node per thing, cross-linked by
 * `@id` — and it is what this was written as first. Readers disagreed about
 * it: a scanner reading the graph reported back "Organization with name and
 * description" and asked for the `url`, `logo` and `address` that were sitting
 * on the node all along, having evidently flattened the two nodes into one and
 * read the Event's fields as the Organization's. Splitting them into separate
 * top-level objects costs one repeated `organizer` reference and removes the
 * ambiguity: each document has exactly one subject, and its fields can only
 * belong to that subject. The `@id`s stay, so anything that does understand
 * linked data still sees one organization rather than two copies of one.
 *
 * The venue address is `addressLocality` and `addressCountry` only. Hacker
 * Bloc's street address is not on the page, and a structured address is a
 * claim: writing a street here that nobody has confirmed would put a wrong
 * pin on a map for the sake of filling a field.
 *
 * Dates go out as UTC instants via `toISOString()`. The source in lib/event.ts
 * writes them with an explicit +02:00 offset so a build in another timezone
 * cannot shift them, and `Z` preserves exactly that instant — it is the same
 * moment stated in the zone every consumer agrees on, not a dropped timezone.
 */

const ORGANIZATION = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'Hacklab',
  description:
    'Hacklab runs hardware hackathons and community build events, including Alien Bazaar in Warsaw.',
  url: 'https://hacklab.so',
  logo: `${SITE_URL}/sponsors/hacklab.png`,
  image: `${SITE_URL}/opengraph-image.jpg`,
  email: 'sos@hacklab.so',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'sos@hacklab.so',
    availableLanguage: ['en', 'pl'],
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Warsaw',
    addressCountry: 'PL',
  },
  sameAs: [
    'https://www.instagram.com/alienbazaar_',
    'https://hacklab.so',
    'https://epikor.eu',
  ],
}

export function buildStructuredData() {
  const organization = { '@context': 'https://schema.org', ...ORGANIZATION }

  const event = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    '@id': `${SITE_URL}/#event`,
    name: EVENT.title,
    description: EVENT.summary,
    startDate: EVENT.startsAt.toISOString(),
    endDate: EVENT.endsAt.toISOString(),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    url: SITE_URL,
    image: [`${SITE_URL}/opengraph-image.jpg`],
    maximumAttendeeCapacity: EVENT.capacity ?? undefined,
    inLanguage: 'en',
    isAccessibleForFree: true,
    location: {
      '@type': 'Place',
      name: 'Hacker Bloc',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Warsaw',
        addressCountry: 'PL',
      },
    },
    organizer: ORGANIZATION,
    // Free to attend — the FAQ says so in as many words — so the price is a
    // stated 0 rather than an omitted field. Currency is required alongside a
    // price even when the price is nothing.
    offers: {
      '@type': 'Offer',
      url: JOIN_URL,
      price: '0',
      priceCurrency: 'PLN',
      availability: 'https://schema.org/InStock',
      validFrom: new Date('2026-01-01T00:00:00+01:00').toISOString(),
    },
  }

  return [organization, event]
}
