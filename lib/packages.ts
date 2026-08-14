/**
 * Sponsorship packages for Alien Bazaar Warsaw 2026.
 *
 * Structured so the package cards, comparison matrix, and deep-dive
 * sections all read from one source — a price change or a new benefit
 * cannot land in one place and miss the other two.
 */

export type TierId = 'bronze' | 'silver' | 'gold' | 'platinum'

export type Package = {
  id: TierId
  tier: string
  emoji: string
  price: number
  priceLabel: string
  spots: number
  positioning: string
  tagline: string
  summary: string
  bestFor?: string
  titles?: string[]
  positionings?: string[]
  /** Closing line under the Platinum deep-dive only. */
  closer?: string
  benefits: string[]
}

/**
 * Feature rows for the comparison matrix.
 *
 * Values are the cell content per tier. `true` renders a check, `false` or
 * `null` renders an em dash, and a string is printed as-is. Order is the
 * reading order of the table.
 */
export type MatrixRow = {
  category: string
  values: Record<TierId, string | boolean | null>
}

export const PACKAGES: Package[] = [
  {
    id: 'bronze',
    tier: 'Bronze',
    emoji: '🥉',
    price: 2500,
    priceLabel: '$2,500',
    spots: 24,
    positioning: 'Support Alien Bazaar',
    tagline: 'Digital Supporter',
    summary: 'The simplest way to support Alien Bazaar.',
    benefits: [
      'Company logo on the Alien Bazaar website',
      'Clickable link to your company',
    ],
  },
  {
    id: 'silver',
    tier: 'Silver',
    emoji: '🥈',
    price: 5000,
    priceLabel: '$5,000',
    spots: 12,
    positioning: 'Meet the builders',
    tagline: 'Meet the Builders',
    summary: 'Your company stops being a logo and enters the room.',
    bestFor:
      'Best for companies that want brand awareness, developer exposure and access to talent.',
    benefits: [
      'Large website placement',
      'Physical branding at the event',
      'Sponsor announcement',
      '2 company passes',
      'Sponsor booth',
      'Demo Day access',
      'Ability to distribute products, swag, credits or hardware',
      'Networking with hackers and founders',
      'Opportunity to introduce your product to participants',
    ],
  },
  {
    id: 'gold',
    tier: 'Gold',
    emoji: '🥇',
    price: 10000,
    priceLabel: '$10,000',
    spots: 6,
    positioning: 'Become part of the hackathon',
    tagline: 'Become Part of the Hackathon',
    summary: 'Your company becomes integrated into the experience.',
    titles: [
      'Official AI Partner',
      'Official Robotics Partner',
      'Official Cloud Partner',
      'Official Hardware Partner',
      'Official Developer Tools Partner',
    ],
    benefits: [
      'Everything in Silver',
      'Premium branding',
      'Premium activation space',
      '6 company passes',
      'Dedicated recruiting activation',
      'Technical workshop or presentation',
      'Product / API / hardware integration',
      'Optional branded hacker challenge',
      'Optional sponsor bounty',
      'Sponsor representative judging your challenge',
      'Curated introductions to selected hackers',
      'Priority access to teams and founders',
      'Dedicated sponsor content',
      'Short opening or closing ceremony appearance',
      'Industry / category exclusivity at Gold level',
    ],
  },
  {
    id: 'platinum',
    tier: 'Platinum',
    emoji: '👽',
    price: 20000,
    priceLabel: '$20,000',
    spots: 3,
    positioning: 'Own a piece of Alien Bazaar',
    tagline: 'Own a Piece of Alien Bazaar',
    summary:
      "This isn't traditional sponsorship. Your company becomes one of the brands defining the event.",
    positionings: [
      'MAIN AI PARTNER OF ALIEN BAZAAR',
      'ROBOTICS POWERED BY [COMPANY]',
      'ALIEN BAZAAR × [COMPANY]',
      'HACKER LOUNGE BY [COMPANY]',
      'ROBOT ARENA POWERED BY [COMPANY]',
      'BUILD ZONE BY [COMPANY]',
    ],
    closer:
      "Platinum partners aren't standing outside the culture advertising to hackers. They're inside it.",
    benefits: [
      'Everything in Gold',
      'Dominant website and venue branding',
      'Main-stage visibility',
      '10 VIP passes',
      'Flagship activation built specifically for your company',
      'Featured stage appearance',
      'Included flagship sponsor challenge',
      'Included premium bounty',
      'Jury participation',
      'Priority access to top hackers and teams',
      'Priority curated talent introductions',
      'Priority founder and investor introductions',
      'Dedicated recruiting experience',
      'Deep product, API or hardware integration',
      'Dedicated professional content',
      'Video and social media integration',
      'Major presence in Alien Bazaar recap content',
      'Full category exclusivity',
      'Custom strategic activation designed with the organizers',
    ],
  },
]

export const MATRIX: MatrixRow[] = [
  {
    category: 'Price',
    values: {
      bronze: '$2,500',
      silver: '$5,000',
      gold: '$10,000',
      platinum: '$20,000',
    },
  },
  {
    category: 'Available spots',
    values: { bronze: '24', silver: '12', gold: '6', platinum: '3' },
  },
  {
    category: 'Positioning',
    values: {
      bronze: 'Support Alien Bazaar',
      silver: 'Meet the builders',
      gold: 'Become part of the hackathon',
      platinum: 'Own a piece of Alien Bazaar',
    },
  },
  {
    category: 'Website presence',
    values: {
      bronze: 'Logo + link',
      silver: 'Large logo + link',
      gold: 'Premium placement',
      platinum: 'Dominant placement',
    },
  },
  {
    category: 'Event branding',
    values: {
      bronze: null,
      silver: 'Sponsor wall',
      gold: 'Premium venue branding',
      platinum: 'Main-stage + venue branding',
    },
  },
  {
    category: 'Social media',
    values: {
      bronze: null,
      silver: 'Sponsor announcement',
      gold: 'Dedicated sponsor feature',
      platinum: 'Dedicated campaign + content',
    },
  },
  {
    category: 'Company passes',
    values: {
      bronze: null,
      silver: '2',
      gold: '6',
      platinum: '10 VIP',
    },
  },
  {
    category: 'Demo Day access',
    values: {
      bronze: null,
      silver: true,
      gold: 'Priority',
      platinum: 'VIP',
    },
  },
  {
    category: 'Sponsor booth',
    values: {
      bronze: null,
      silver: 'Standard booth',
      gold: 'Premium activation space',
      platinum: 'Custom flagship activation',
    },
  },
  {
    category: 'Swag / product distribution',
    values: {
      bronze: null,
      silver: true,
      gold: true,
      platinum: 'Premium integration',
    },
  },
  {
    category: 'Technical workshop',
    values: {
      bronze: null,
      silver: null,
      gold: 'Up to 30 min',
      platinum: 'Main technical session',
    },
  },
  {
    category: 'Recruiting access',
    values: {
      bronze: null,
      silver: 'General networking',
      gold: 'Dedicated recruiting activation',
      platinum: 'Priority talent access',
    },
  },
  {
    category: 'Curated hacker introductions',
    values: {
      bronze: null,
      silver: null,
      gold: 'Selected introductions',
      platinum: 'Priority curated introductions',
    },
  },
  {
    category: 'Meet founders & teams',
    values: {
      bronze: null,
      silver: true,
      gold: 'Priority',
      platinum: 'Private / curated access',
    },
  },
  {
    category: 'Product / API integration',
    values: {
      bronze: null,
      silver: 'Optional',
      gold: 'Promoted to teams',
      platinum: 'Deep event integration',
    },
  },
  {
    category: 'Hardware placement',
    values: {
      bronze: null,
      silver: 'Optional',
      gold: 'Dedicated showcase',
      platinum: 'Part of event infrastructure',
    },
  },
  {
    category: 'Sponsor challenge',
    values: {
      bronze: null,
      silver: null,
      gold: 'Optional branded challenge',
      platinum: 'Included flagship challenge',
    },
  },
  {
    category: 'Sponsor bounty',
    values: {
      bronze: null,
      silver: null,
      gold: 'Optional',
      platinum: 'Included + premium positioning',
    },
  },
  {
    category: 'Judging participation',
    values: {
      bronze: null,
      silver: null,
      gold: 'Challenge judge',
      platinum: 'Jury participation',
    },
  },
  {
    category: 'Opening / closing ceremony',
    values: {
      bronze: null,
      silver: 'Sponsor mention',
      gold: 'Short stage appearance',
      platinum: 'Featured stage presence',
    },
  },
  {
    category: 'Dedicated branded content',
    values: {
      bronze: null,
      silver: null,
      gold: true,
      platinum: 'Premium video + social',
    },
  },
  {
    category: 'Post-event content',
    values: {
      bronze: null,
      silver: 'Logo mention',
      gold: 'Dedicated feature',
      platinum: 'Major integration',
    },
  },
  {
    category: 'Investor networking',
    values: {
      bronze: null,
      silver: null,
      gold: 'Access',
      platinum: 'Priority introductions',
    },
  },
  {
    category: 'Category exclusivity',
    values: {
      bronze: null,
      silver: null,
      gold: 'Gold-level exclusivity',
      platinum: 'Full category exclusivity',
    },
  },
  {
    category: 'Official partner title',
    values: {
      bronze: null,
      silver: null,
      gold: 'e.g. Official AI Partner',
      platinum: 'e.g. Main AI Partner',
    },
  },
  {
    category: 'Custom activation',
    values: {
      bronze: null,
      silver: null,
      gold: 'Limited',
      platinum: 'Built together from scratch',
    },
  },
  {
    category: 'Naming integration',
    values: {
      bronze: null,
      silver: null,
      gold: null,
      platinum: 'Selected areas / experiences',
    },
  },
  {
    category: 'Strategic collaboration',
    values: {
      bronze: null,
      silver: null,
      gold: null,
      platinum: 'Direct with organizers',
    },
  },
]

/** Where the sponsorship CTA points. Override with NEXT_PUBLIC_SPONSOR_URL. */
export const SPONSOR_CONTACT_URL =
  process.env.NEXT_PUBLIC_SPONSOR_URL ??
  'mailto:sponsors@alienbazaar.com?subject=Alien%20Bazaar%20Sponsorship'
