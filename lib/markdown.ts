import { EVENT, JOIN_URL, SITE_URL } from './event'
import { PROSE_PAGES, proseToMarkdown } from './prose-pages'

/**
 * The site's pages as markdown, for agents that ask for them.
 *
 * This is content negotiation in the plain HTTP sense: same URL, two
 * representations. A browser sends `Accept: text/html` and gets the poster; an
 * agent sends `Accept: text/markdown` and gets the text below, which is the
 * same facts without the 85 KB of markup, fonts and photography wrapped around
 * them. The routing lives in proxy.ts; this module is only the content.
 *
 * Written from `EVENT` for the same reason the JSON-LD and llms.txt are: the
 * markdown a machine reads and the HTML a person reads have to be the same
 * event, and the only way to guarantee that is for both to be printed from one
 * object rather than kept in step by hand.
 *
 * The prose is deliberately not a transcript of the page. The poster says
 * things in pictures, in a countdown and in a wall of logos; restating those
 * as markdown would produce a worse document than simply stating what the
 * event is. What an agent needs is the facts, the shape of the three days, and
 * where to send someone who wants in.
 */

const fmtDate = (d: Date) =>
  new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: EVENT.timezone,
  }).format(d)

const FACTS = `- **What:** ${EVENT.title}, a hardware hackathon
- **When:** ${fmtDate(EVENT.startsAt)} – ${fmtDate(EVENT.endsAt)} (${EVENT.timezone}); doors at 08:00 on the first day
- **Where:** ${EVENT.location}
- **Capacity:** ${EVENT.capacity ?? 'unstated'} participants, teams of up to ${EVENT.maxTeamSize}
- **Cost:** free to attend. Travel and accommodation are not reimbursed.
- **Apply:** ${JOIN_URL}`

const FOOTER = `
---

- Participant questions: sos@hacklab.so
- Sponsorship and partnerships: tymofiigusak@epikor.eu
- Instagram: https://www.instagram.com/alienbazaar_
- Machine-readable summary: ${SITE_URL}/llms.txt
- All pages: ${SITE_URL}/sitemap.xml

Organized by Epikor (https://epikor.eu) and Hacklab (https://hacklab.so).
`

const HOME = `# ${EVENT.title}

${EVENT.summary}

${FACTS}

## The format

Every team books one main machine and builds on it for three days. The
catalogue runs to drones, robot arms, underwater drones, robodogs, quadrupeds,
humanoids and headsets; a team takes exactly one, and extras — cables,
Raspberry Pis, camera modules and the rest — are unlocked at the event.

The part that makes it this event rather than a general hackathon is what
happens between the machines. Teams wire their machines into each other, so
what gets pitched to investors after 48 work hours is not one team's robot but
the combined system all of them add up to.

## Practical answers

- Participation is free.
- One main hardware unit per team. Extras are available on site.
- Teams are up to ${EVENT.maxTeamSize} people. Room for ${EVENT.capacity ?? 'a limited number of'} participants in total.
- Travel and accommodation are not reimbursed.

## Other pages

- Sponsorship tiers: ${SITE_URL}/sponsor
- Becoming a partner: ${SITE_URL}/partner
- The partner network: ${SITE_URL}/partners
- The organizing team: ${SITE_URL}/team
- About the event: ${SITE_URL}/about
- Contact: ${SITE_URL}/contact
${FOOTER}`

const SPONSOR = `# Sponsorship — ${EVENT.title}

Three partnership tiers put a brand, a product and a team inside the event
rather than on a banner beside it.

${FACTS}

## Tiers

- **Gold** — presence across the event and access to the final day.
- **Diamond** — the above, plus deeper integration across the three days.
- **Uranium** — full event and product integration, the largest of the three.

The tiers differ in how far a sponsor's hardware and people are woven into
what the teams actually build, not only in logo placement. For the current
inclusions and pricing, write to tymofiigusak@epikor.eu.

## Why a hardware event is different

Teams here commit to one machine for three days and then wire it into
everyone else's. A sponsor supplying that machine, or the components around
it, is supplying the thing the work is made of — which is a different kind of
presence from sponsoring a track at a software hackathon.

- Become a partner: ${SITE_URL}/partner
- Current partners: ${SITE_URL}/partners
${FOOTER}`

const PARTNER = `# Become a partner — ${EVENT.title}

How an organization partners with ${EVENT.title}.

${FACTS}

## What partnering means here

Partners supply hardware, components, prizes, venue support, or the community
reach that fills the room. The event books one machine per team and wires the
machines together, so a partner's contribution tends to end up inside the
projects rather than beside them.

If your organization makes robots, drones, printers, components, tooling or
developer platforms — or runs a community that would want to be in the room —
this is the page to act on. Write to tymofiigusak@epikor.eu with what you have
in mind.

- Sponsorship tiers and what each includes: ${SITE_URL}/sponsor
- Who is already involved: ${SITE_URL}/partners
${FOOTER}`

const PARTNERS = `# Partners — ${EVENT.title}

The partner network behind ${EVENT.title}, spanning the United States,
England, Germany, Switzerland, Poland and China. The event itself is based in
Poland.

${FACTS}

Partners supply the hardware teams book, the components they unlock on site,
the prizes, and the venue. The full, current wall of partner marks is on the
HTML page at ${SITE_URL}/partners — it is a set of logos, which is the one
thing markdown renders worse than a browser does.

- Become a partner: ${SITE_URL}/partner
- Sponsorship tiers: ${SITE_URL}/sponsor
${FOOTER}`

const TEAM = `# Team — ${EVENT.title}

The people organizing ${EVENT.title}.

${FACTS}

The event is organized by Epikor (https://epikor.eu) and Hacklab
(https://hacklab.so). The named organizing team, with roles and photographs,
is on the HTML page at ${SITE_URL}/team.

For anything a person rather than a page should answer: sos@hacklab.so for
participants, tymofiigusak@epikor.eu for sponsorship and partnerships.
${FOOTER}`

/**
 * Which paths have a markdown representation. A path that is not in here has
 * no second representation and is served as HTML whatever the Accept header
 * says — negotiating over content that does not exist would mean inventing it.
 */
const PAGES: Record<string, string> = {
  '/': HOME,
  '/sponsor': SPONSOR,
  '/partner': PARTNER,
  '/partners': PARTNERS,
  '/team': TEAM,
  // about, contact and privacy are prose in both directions, so their
  // markdown is printed from the same structure the HTML pages render — see
  // lib/prose-pages.ts. The five above are summaries of pages that do not
  // reduce to text, and are written by hand for that reason.
  ...Object.fromEntries(
    PROSE_PAGES.map((page) => [
      page.slug,
      `${proseToMarkdown(page)}${FOOTER}`,
    ])
  ),
}

/** The markdown for a path, or null if that path has no markdown form. */
export function markdownFor(pathname: string): string | null {
  const key =
    pathname.length > 1 && pathname.endsWith('/')
      ? pathname.slice(0, -1)
      : pathname
  return PAGES[key] ?? null
}

/** Every path with a markdown representation, for the 404 body and tests. */
export function markdownPaths(): string[] {
  return Object.keys(PAGES)
}

/**
 * The body a 404 returns. Markdown rather than an app shell, and it names the
 * places an agent can actually recover from — the sitemap, llms.txt, and the
 * list of real pages — because a 404 that only says "not found" makes an agent
 * guess at its next request.
 */
export const NOT_FOUND_MARKDOWN = `# 404 — page not found

There is no page at this address on ${SITE_URL}.

## Where to look instead

${markdownPaths()
  .map((p) => `- ${SITE_URL}${p === '/' ? '/' : p}`)
  .join('\n')}

## Machine-readable indexes

- Summary and when to use this site: ${SITE_URL}/llms.txt
- All indexable URLs: ${SITE_URL}/sitemap.xml
- Crawl rules: ${SITE_URL}/robots.txt

Every page above is also available as markdown from the same URL by sending
\`Accept: text/markdown\`.
`
