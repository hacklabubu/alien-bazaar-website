/** Sponsorship packages from the current Alien Bazaar sponsorship deck. */

export type TierId = 'silver' | 'gold' | 'platinum' | 'uranium'

export type Package = {
  id: TierId
  tier: string
  emoji: string
  price: number
  priceLabel: string
  positioning: string
  tagline: string
  summary: string
  bestFor?: string
  closer?: string
  benefits: string[]
}

export type MatrixRow = {
  category: string
  values: Record<TierId, string | boolean | null>
}

export const PACKAGES: Package[] = [
  {
    id: 'silver',
    tier: 'Silver',
    emoji: 'Ag',
    price: 5000,
    priceLabel: '$5,000',
    positioning: 'Join the final day',
    tagline: 'Final-day access',
    summary:
      'A focused package for brands that want visibility, content and direct access to the final pitches.',
    benefits: [
      'Final-day access, including the pitching and networking session',
      'Access to the open community chat',
      'Logo in the sponsor section of the website',
      '3 short vertical videos for Instagram',
    ],
  },
  {
    id: 'gold',
    tier: 'Gold',
    emoji: 'Au',
    price: 10000,
    priceLabel: '$10,000',
    positioning: 'Work alongside the teams',
    tagline: 'Full-event integration',
    summary:
      'Three days inside the hackathon, with stronger placement, team access and live product testing.',
    bestFor:
      'Best for companies that want to meet builders, test a product in context and be visible throughout the event.',
    benefits: [
      'Full 3-day access, including pitching and networking',
      'Open community chat and private chat with selected teams',
      'Larger website logo placement',
      'On-venue signage and event materials',
      '5 short vertical videos for Instagram',
      '1 horizontal podcast feature',
      'On-site product placement',
      'On-site testing of your product while teams code the hardware and robots',
    ],
  },
  {
    id: 'platinum',
    tier: 'Platinum',
    emoji: 'Pt',
    price: 20000,
    priceLabel: '$20,000',
    positioning: 'Become part of the infrastructure',
    tagline: 'Embedded strategic partner',
    summary:
      'The deepest working partnership: your product, brand and team become part of the event, its builds and its post-event intelligence.',
    bestFor:
      'Best for companies seeking product validation, category insight, investor-grade intelligence and a direct role in the final judging.',
    closer:
      'Platinum is built for partners who want measurable involvement in what teams build — not only exposure around it.',
    benefits: [
      'Full 3-day access, including pitching and networking',
      'Open community chat and private chat with selected teams',
      'Top website placement plus on-venue signage and event materials',
      "Logo placed on teams' hackathon projects and builds",
      '10 short vertical videos for Instagram',
      '3 horizontal podcast features',
      'On-site product placement with featured content integration',
      'Full-event testing of your own product',
      'Integration of your product into the HackLab hackathon platform',
      'Private organizers-only channel with key stakeholders',
      'Applicant, engagement, team-performance and hardware-performance analytics',
      'Investment and partnership insights on teams and hardware companies',
      'Dedicated media interview plus access to mentors, partners, startups, teams and media',
      'Official voting seat on the pitch judging panel',
      'A custom-built hardware rig assembled during the hackathon and gifted at closing',
    ],
  },
  {
    id: 'uranium',
    tier: 'Uranium',
    emoji: 'U',
    price: 60000,
    priceLabel: '$60,000',
    positioning: 'Put your name on the event',
    tagline: 'Main titular sponsor',
    summary:
      'One partner per edition. The event carries your name — in the title lock-up, on the stage, in the press and across every piece of media it produces — on top of everything Platinum includes.',
    bestFor:
      'Best for one company that wants the edition to be theirs: title billing, category exclusivity, the stage, a named prize and every benefit below it.',
    closer:
      'Uranium is a single seat. Once it is taken, no other brand can hold the title or the category for Alien Bazaar Warsaw 2026.',
    benefits: [
      'Title billing: the event is presented by you, in the name lock-up used on the site, the stage, the badges and every announcement',
      'Sole partner at this tier, with category exclusivity against competing brands across the whole event',
      'Opening keynote from the main stage and the closing award handover',
      'A named prize track and trophy carrying your brand',
      'Your name in the event press release, media-partner coverage and the post-event report',
      'Title card on all event media, including every vertical video and podcast feature',
      'Everything in Platinum, including full 3-day access, product and platform integration, post-event analytics, the judging seat and the custom hardware rig',
    ],
  },
]

export const MATRIX: MatrixRow[] = [
  {
    category: 'Price',
    values: {
      silver: '$5,000',
      gold: '$10,000',
      platinum: '$20,000',
      uranium: '$60,000',
    },
  },
  {
    category: 'Title billing',
    values: {
      silver: null,
      gold: null,
      platinum: null,
      uranium: 'Event presented by you, in the name lock-up',
    },
  },
  {
    category: 'Category exclusivity',
    values: {
      silver: null,
      gold: null,
      platinum: null,
      uranium: 'Sole partner, no competing brand',
    },
  },
  {
    category: 'Stage time',
    values: {
      silver: null,
      gold: null,
      platinum: null,
      uranium: 'Opening keynote + closing award handover',
    },
  },
  {
    category: 'Named prize track',
    values: {
      silver: null,
      gold: null,
      platinum: null,
      uranium: 'Branded track and trophy',
    },
  },
  {
    category: 'Event access',
    values: {
      silver: 'Final day: pitching + networking',
      gold: 'Full 3 days',
      platinum: 'Full 3 days',
      uranium: 'Full 3 days',
    },
  },
  {
    category: 'Platform chat access',
    values: {
      silver: 'Open community chat',
      gold: 'Open chat + private selected-team chat',
      platinum: 'Open chat + private selected-team chat',
      uranium: 'Open chat + private selected-team chat',
    },
  },
  {
    category: 'Logo placement',
    values: {
      silver: 'Website sponsor section',
      gold: 'Larger website placement + venue materials',
      platinum: 'Top placement + venue materials + team builds',
      uranium: 'Title lock-up + venue materials + team builds',
    },
  },
  {
    category: 'Media house content',
    values: {
      silver: '3 vertical videos',
      gold: '5 vertical videos + 1 podcast feature',
      platinum: '10 vertical videos + 3 podcast features',
      uranium: 'Platinum content, title-carded across every cut',
    },
  },
  {
    category: 'Product placement',
    values: {
      silver: null,
      gold: 'On-site placement',
      platinum: 'On-site placement + featured integration',
      uranium: 'On-site placement + featured integration',
    },
  },
  {
    category: 'Test your own product',
    values: {
      silver: null,
      gold: 'On-site while teams build',
      platinum: 'Full event + HackLab platform integration',
      uranium: 'Full event + HackLab platform integration',
    },
  },
  {
    category: 'Organizers-only chat',
    values: { silver: null, gold: null, platinum: true, uranium: true },
  },
  {
    category: 'Post-event analytics',
    values: {
      silver: null,
      gold: null,
      platinum: 'Applicants, engagement, teams, hardware + investment insights',
      uranium: 'Applicants, engagement, teams, hardware + investment insights',
    },
  },
  {
    category: 'Interviews',
    values: {
      silver: null,
      gold: null,
      platinum: 'Dedicated interview + full interview access',
      uranium: 'Dedicated interview + press release + full interview access',
    },
  },
  {
    category: 'Judge',
    values: {
      silver: null,
      gold: null,
      platinum: 'Official voting member',
      uranium: 'Official voting member',
    },
  },
  {
    category: 'Signature gift',
    values: {
      silver: null,
      gold: null,
      platinum: 'Custom-built hardware rig',
      uranium: 'Custom-built hardware rig',
    },
  },
]
