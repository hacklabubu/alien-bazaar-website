/** Sponsorship packages from the current Alien Bazaar sponsorship deck. */

export type TierId = 'gold' | 'diamond' | 'uranium'

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
    id: 'gold',
    tier: 'Gold',
    emoji: 'Au',
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
    id: 'diamond',
    tier: 'Diamond',
    emoji: '◇',
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
    id: 'uranium',
    tier: 'Uranium',
    emoji: 'U',
    price: 20000,
    priceLabel: '$20,000',
    positioning: 'Become part of the infrastructure',
    tagline: 'Embedded strategic partner',
    summary:
      'The deepest partnership: your product, brand and team become part of the event, its builds and its post-event intelligence.',
    bestFor:
      'Best for companies seeking product validation, category insight, investor-grade intelligence and a direct role in the final judging.',
    closer:
      'Uranium is built for partners who want measurable involvement in what teams build — not only exposure around it.',
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
]

export const MATRIX: MatrixRow[] = [
  {
    category: 'Price',
    values: { gold: '$5,000', diamond: '$10,000', uranium: '$20,000' },
  },
  {
    category: 'Event access',
    values: {
      gold: 'Final day: pitching + networking',
      diamond: 'Full 3 days',
      uranium: 'Full 3 days',
    },
  },
  {
    category: 'Platform chat access',
    values: {
      gold: 'Open community chat',
      diamond: 'Open chat + private selected-team chat',
      uranium: 'Open chat + private selected-team chat',
    },
  },
  {
    category: 'Logo placement',
    values: {
      gold: 'Website sponsor section',
      diamond: 'Larger website placement + venue materials',
      uranium: 'Top placement + venue materials + team builds',
    },
  },
  {
    category: 'Media house content',
    values: {
      gold: '3 vertical videos',
      diamond: '5 vertical videos + 1 podcast feature',
      uranium: '10 vertical videos + 3 podcast features',
    },
  },
  {
    category: 'Product placement',
    values: {
      gold: null,
      diamond: 'On-site placement',
      uranium: 'On-site placement + featured integration',
    },
  },
  {
    category: 'Test your own product',
    values: {
      gold: null,
      diamond: 'On-site while teams build',
      uranium: 'Full event + HackLab platform integration',
    },
  },
  {
    category: 'Organizers-only chat',
    values: { gold: null, diamond: null, uranium: true },
  },
  {
    category: 'Post-event analytics',
    values: {
      gold: null,
      diamond: null,
      uranium: 'Applicants, engagement, teams, hardware + investment insights',
    },
  },
  {
    category: 'Interviews',
    values: {
      gold: null,
      diamond: null,
      uranium: 'Dedicated interview + full interview access',
    },
  },
  {
    category: 'Judge',
    values: { gold: null, diamond: null, uranium: 'Official voting member' },
  },
  {
    category: 'Signature gift',
    values: { gold: null, diamond: null, uranium: 'Custom-built hardware rig' },
  },
]
