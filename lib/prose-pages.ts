import { EVENT, JOIN_URL, SITE_URL } from './event'

/**
 * The three plain pages — about, contact, privacy — written once.
 *
 * Every other page on this site is a poster: the facts are carried by
 * photography, a countdown, a wall of logos, and the markdown form in
 * lib/markdown.ts is necessarily a summary of something that does not reduce
 * to text. These three are the opposite. They are prose and nothing else, and
 * so the HTML a person reads and the markdown an agent negotiates for should
 * not merely agree — they should be the same document, rendered twice.
 *
 * Hence the shape below: content as structure, and two renderers over it. The
 * alternative is a page component and a markdown string sitting in different
 * files, which agree on the day they are written and quietly stop agreeing at
 * the first correction.
 *
 * The inline syntax is `[text](href)` and nothing more. It is the one piece of
 * formatting this content needs — an email address, a link to the apply page —
 * and supporting exactly it means `renderInline` stays a dozen lines instead of
 * pulling a markdown parser into the bundle to render prose we wrote ourselves.
 */

export type Block = { p: string } | { ul: string[] }

export type ProseSection = { heading: string; blocks: Block[] }

export type ProsePage = {
  slug: string
  title: string
  /** The `<title>` and the markdown `# ` line — the page's name on its own. */
  name: string
  description: string
  lede: string
  sections: ProseSection[]
}

const CAPACITY = EVENT.capacity ?? 0

export const ABOUT: ProsePage = {
  slug: '/about',
  name: 'About',
  title: `About — ${EVENT.title}`,
  description: `What ${EVENT.title} is, how the three days work, and who runs it.`,
  lede: EVENT.summary,
  sections: [
    {
      heading: 'What this is',
      blocks: [
        {
          p: `${EVENT.title} is a three-day hardware hackathon in Warsaw, organized by [Epikor](https://epikor.eu) and [Hacklab](https://hacklab.so) and hosted at Hacker Bloc. It runs from 25 to 27 September 2026. Applications are handled on Hacklab's event platform; this site is the event's poster and its machine-readable record.`,
        },
        {
          p: `It is free to attend. There is room for ${CAPACITY} participants, in teams of up to ${EVENT.maxTeamSize}. Travel and accommodation are not reimbursed.`,
        },
      ],
    },
    {
      heading: 'How it works',
      blocks: [
        {
          p: `Every team books exactly one main machine and works on it for the three days. The catalogue runs to drones, robot arms, underwater drones, robodogs, quadrupeds, humanoids and headsets. Components beyond that main unit — cables, Raspberry Pis, camera modules and the rest — are unlocked at the event rather than booked in advance.`,
        },
        {
          p: `Teams then wire their machines into each other. That is the constraint the whole event is built around: what gets pitched to investors after 48 work hours is the combined system, not a single team's device. It rewards teams who spend the first hours agreeing on interfaces with the people at the next bench, and it produces a demo day where the machines have something to say to each other.`,
        },
      ],
    },
    {
      heading: 'Who it is for',
      blocks: [
        {
          p: `Anyone who builds things that move — and anyone who wants to. In practice that has meant:`,
        },
        {
          ul: [
            'Robotics and drone people, from hobbyists to research labs.',
            'Embedded and firmware engineers.',
            'Mechanical and electrical engineers who want a deadline and a demo.',
            'Software people who would like their code attached to a motor for once.',
          ],
        },
        {
          p: `No team needs all four. The machines are booked whole, so a team that is strong on software and thin on mechanical will find the hardware already built and waiting.`,
        },
      ],
    },
    {
      heading: 'Who runs it',
      blocks: [
        {
          p: `[Epikor](https://epikor.eu) and [Hacklab](https://hacklab.so), with a partner network across the United States, England, Germany, Switzerland, Poland and China supplying the hardware, the components and the prizes. The people organizing it are listed on the [team page](${SITE_URL}/team).`,
        },
        {
          p: `To take part, apply at [${JOIN_URL}](${JOIN_URL}). For anything else, the [contact page](${SITE_URL}/contact) has the right address.`,
        },
      ],
    },
  ],
}

export const CONTACT: ProsePage = {
  slug: '/contact',
  name: 'Contact',
  title: `Contact — ${EVENT.title}`,
  description: `Who to write to about ${EVENT.title}, and what each address is for.`,
  lede: `Two addresses, and they do different jobs. Writing to the right one is the difference between an answer today and an answer after a forward.`,
  sections: [
    {
      heading: 'Participants',
      blocks: [
        {
          p: `[sos@hacklab.so](mailto:sos@hacklab.so) — questions about attending: applications, teams, the hardware catalogue, what to bring, accessibility, and anything else about being in the room. Use this address whether you are still deciding or already have a place.`,
        },
        {
          p: `Applications themselves are not handled on this site. They run on Hacklab's event platform at [${JOIN_URL}](${JOIN_URL}), which is where an application is submitted and where its status lives.`,
        },
      ],
    },
    {
      heading: 'Sponsorship and partnerships',
      blocks: [
        {
          p: `[tymofiigusak@epikor.eu](mailto:tymofiigusak@epikor.eu) — sponsorship tiers, supplying hardware or components, prizes, and any other organizational partnership.`,
        },
        {
          p: `The tiers are described on the [sponsorship page](${SITE_URL}/sponsor) and the partnering process on the [partner page](${SITE_URL}/partner). Both pages have a form on them, which reaches the same address.`,
        },
      ],
    },
    {
      heading: 'Elsewhere',
      blocks: [
        {
          ul: [
            'Instagram: [@alienbazaar_](https://www.instagram.com/alienbazaar_)',
            'Epikor: [epikor.eu](https://epikor.eu)',
            'Hacklab: [hacklab.so](https://hacklab.so)',
          ],
        },
      ],
    },
    {
      heading: 'Where and when',
      blocks: [
        {
          p: `${EVENT.location}. The event runs 25–27 September 2026; doors open at 08:00 on the first day, and the 48 work hours are counted from there.`,
        },
      ],
    },
  ],
}

export const PRIVACY: ProsePage = {
  slug: '/privacy',
  name: 'Privacy',
  title: `Privacy — ${EVENT.title}`,
  description: `What this site collects, which is very little, and what happens to it.`,
  lede: `This site is a poster. It collects almost nothing, and this page says exactly what "almost" covers.`,
  sections: [
    {
      heading: 'Browsing this site',
      blocks: [
        {
          p: `The pages here are static. There is no analytics script, no advertising network, and no third-party tracker. This site sets no cookies, which is why there is no cookie banner on it.`,
        },
        {
          p: `Fonts and images are served from this domain rather than from a third-party CDN, so reading the site does not announce your visit to anyone else. The site is hosted on Vercel, whose servers necessarily see the request — an IP address and a user agent — in order to answer it.`,
        },
      ],
    },
    {
      heading: 'The partner and sponsor forms',
      blocks: [
        {
          p: `The one place this site accepts information is the inquiry form behind the partner and sponsorship pages. When you submit it, the fields you filled in are sent to the organizers so a person can reply to you:`,
        },
        {
          ul: [
            'Your name and your organization.',
            'Your email address, so the reply has somewhere to go.',
            'What you wrote in the message, and which partnership tier you were asking about.',
          ],
        },
        {
          p: `Submissions are rate-limited and de-duplicated, which means the server keeps a short-lived record of recent submissions in order to recognise a repeat of the same one. That is the whole of it: the information is used to answer your enquiry and to organize the event. It is not sold, and it is not used for marketing unrelated to ${EVENT.title}.`,
        },
      ],
    },
    {
      heading: 'Applying to attend',
      blocks: [
        {
          p: `Applications are not handled here. The apply links point to Hacklab's event platform at [${JOIN_URL}](${JOIN_URL}); anything you enter there is covered by Hacklab's own privacy terms rather than by this page.`,
        },
      ],
    },
    {
      heading: 'Your data',
      blocks: [
        {
          p: `To ask what has been kept about you, to correct it, or to have it deleted, write to [sos@hacklab.so](mailto:sos@hacklab.so).`,
        },
      ],
    },
    {
      heading: 'Changes',
      blocks: [
        {
          p: `This page describes how the site behaves as it is currently built. If it starts collecting something else, this page changes with it.`,
        },
      ],
    },
  ],
}

export const PROSE_PAGES: ProsePage[] = [ABOUT, CONTACT, PRIVACY]

/** Split a string on `[text](href)`, so both renderers walk the same pieces. */
export function splitInline(
  text: string
): ({ text: string } | { text: string; href: string })[] {
  const out: ({ text: string } | { text: string; href: string })[] = []
  const re = /\[([^\]]+)\]\(([^)]+)\)/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ text: text.slice(last, m.index) })
    out.push({ text: m[1], href: m[2] })
    last = m.index + m[0].length
  }
  if (last < text.length) out.push({ text: text.slice(last) })
  return out
}

/** The page as markdown — the inline syntax is already markdown's own. */
export function proseToMarkdown(page: ProsePage): string {
  const body = page.sections
    .map((s) => {
      const blocks = s.blocks
        .map((b) =>
          'p' in b ? b.p : b.ul.map((li) => `- ${li}`).join('\n')
        )
        .join('\n\n')
      return `## ${s.heading}\n\n${blocks}`
    })
    .join('\n\n')

  return `# ${page.title}\n\n${page.lede}\n\n${body}\n`
}
