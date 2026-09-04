/**
 * Where a visitor came from, carried across the hop to hacklab.so.
 *
 * Somebody who finds Alien Bazaar in an Instagram story, on a Luma page or on
 * a poster in a stairwell lands here, reads the page, and then leaves for
 * hacklab.so to apply. Unhelped, that second hop erases the first: hacklab
 * sees a referrer of alienbazaar.com and nothing else, so every signup this
 * site sends looks identical and no channel can be judged. This module
 * remembers the origin on the way in and spends it on the way out.
 *
 * The way out is hacklab's own rule. Its middleware stamps a first-touch
 * cookie from the first `utm_*` params it sees on a landing request, and at
 * account creation attaches them to the signup event as `utm_source` and
 * friends. So every join control here appends `utm_*` describing the original
 * source, which makes the hacklab signup say both "came via alienbazaar.com"
 * (the referrer) and "originally from Instagram" (`utm_source`), while
 * `utm_campaign=ab26` groups every signup this site routed regardless of where
 * the person started.
 *
 * Nothing in here touches the DOM or imports from Next, because both callers
 * run it: the proxy on the server, before the first paint, and the join
 * controls in the browser, after hydration.
 */

/** The first-touch cookie. Short and namespaced, because it is written by hand
 * in the proxy and read by hand out of `document.cookie`. */
export const FIRST_TOUCH_COOKIE = 'ab_ft'

/** Thirty days — the same window hacklab.so holds its own first touch for, so
 * a person who reads the poster now and applies three weeks later is still
 * counted against the channel that reached them. */
export const FIRST_TOUCH_MAX_AGE = 60 * 60 * 24 * 30

/**
 * The campaign every join control falls back to. It is the event slug — the
 * same `EVENT.slug` that `lib/event.ts` builds the hacklab URL from — written
 * out here rather than imported, because this module is loaded by the proxy
 * and stays free of the rest of the app.
 */
export const DEFAULT_CAMPAIGN = 'ab26'

/**
 * A cap on every value we carry, matching the cap hacklab's middleware applies
 * to the params it records. A query string is attacker-controlled; a cookie
 * that grows without bound is a cookie that eventually breaks the request.
 */
const MAX_VALUE_LENGTH = 200

export type FirstTouch = {
  source: string
  medium: string
  campaign?: string
  term?: string
  content?: string
}

type HostRule = {
  readonly host: RegExp
  readonly source: string
  readonly medium: string
}

/**
 * Referrer hosts we can name, and the class of traffic they represent.
 *
 * Every pattern matches on the registrable domain rather than an exact host,
 * because the apps rewrite outbound links through their own shims —
 * Instagram's is `l.instagram.com`, Facebook's `l.facebook.com`, Google's the
 * country domain of the day — and a visitor who tapped through a story is
 * still a visitor from Instagram.
 *
 * Instagram is `ig` rather than `instagram` because the hacklab links already
 * printed and shared by hand carry `utm_source=ig`. Two spellings for one
 * channel would split the count for no reason.
 */
const HOST_RULES: readonly HostRule[] = [
  // Social — somebody posted or messaged the link.
  { host: /(^|\.)instagram\.com$/, source: 'ig', medium: 'social' },
  { host: /(^|\.)facebook\.com$/, source: 'facebook', medium: 'social' },
  { host: /(^|\.)messenger\.com$/, source: 'messenger', medium: 'social' },
  { host: /(^|\.)linkedin\.com$/, source: 'linkedin', medium: 'social' },
  { host: /(^|\.)(twitter\.com|x\.com|t\.co)$/, source: 'x', medium: 'social' },
  {
    host: /(^|\.)(t\.me|telegram\.org|telegram\.me)$/,
    source: 'telegram',
    medium: 'social',
  },
  {
    host: /(^|\.)(discord\.com|discord\.gg|discordapp\.com)$/,
    source: 'discord',
    medium: 'social',
  },
  { host: /(^|\.)reddit\.com$/, source: 'reddit', medium: 'social' },
  { host: /(^|\.)tiktok\.com$/, source: 'tiktok', medium: 'social' },
  {
    host: /(^|\.)(threads\.net|threads\.com)$/,
    source: 'threads',
    medium: 'social',
  },
  { host: /(^|\.)whatsapp\.com$/, source: 'whatsapp', medium: 'social' },
  {
    host: /(^|\.)(youtube\.com|youtu\.be)$/,
    source: 'youtube',
    medium: 'social',
  },

  // Search — somebody went looking. The trailing group allows a two-label
  // suffix (`google.co.uk`) but no more, so `google.com.example.com` is not
  // mistaken for Google.
  {
    host: /(^|\.)google\.[a-z]{2,}(\.[a-z]{2,})?$/,
    source: 'google',
    medium: 'organic',
  },
  { host: /(^|\.)bing\.com$/, source: 'bing', medium: 'organic' },
  { host: /(^|\.)duckduckgo\.com$/, source: 'duckduckgo', medium: 'organic' },
  {
    host: /(^|\.)yandex\.[a-z]{2,}(\.[a-z]{2,})?$/,
    source: 'yandex',
    medium: 'organic',
  },

  // Event listings — the calendars the hackathon is cross-posted to.
  { host: /(^|\.)(lu\.ma|luma\.com)$/, source: 'luma', medium: 'referral' },
  { host: /(^|\.)meetup\.com$/, source: 'meetup', medium: 'referral' },
  {
    host: /(^|\.)eventbrite\.[a-z]{2,}(\.[a-z]{2,})?$/,
    source: 'eventbrite',
    medium: 'referral',
  },
]

/**
 * Labels that identify the same site rather than a different one — a mobile
 * host, or the link shim an app puts in front of its outbound URLs. Stripped
 * from an unrecognised host so `l.example.com` and `www.example.com` are
 * reported as one source instead of three.
 */
const PASSTHROUGH_LABEL = /^(www|m|l|lm)\./

function trimToCap(value: string | null | undefined): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim().slice(0, MAX_VALUE_LENGTH)
  return trimmed.length > 0 ? trimmed : undefined
}

/**
 * The same trim, but a value over the cap is dropped rather than shortened.
 * Anything we wrote ourselves was already capped, so an oversized value in a
 * cookie was put there by somebody else and truncating it would only invent a
 * plausible-looking source out of garbage.
 */
function keepUnderCap(value: string | null | undefined): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (trimmed.length === 0 || trimmed.length > MAX_VALUE_LENGTH) return undefined
  return trimmed
}

function withOptionals(
  source: string,
  medium: string,
  campaign: string | undefined,
  term: string | undefined,
  content: string | undefined,
): FirstTouch {
  const firstTouch: FirstTouch = { source, medium }
  if (campaign) firstTouch.campaign = campaign
  if (term) firstTouch.term = term
  if (content) firstTouch.content = content
  return firstTouch
}

function fromParams(search: URLSearchParams): FirstTouch | null {
  const source = trimToCap(search.get('utm_source'))
  const medium = trimToCap(search.get('utm_medium'))
  const campaign = trimToCap(search.get('utm_campaign'))
  const term = trimToCap(search.get('utm_term'))
  const content = trimToCap(search.get('utm_content'))

  if (!source && !medium && !campaign && !term && !content) return null

  // A link tagged with a campaign but no source still says something — it came
  // off a thing we made and handed out — so it is kept under a placeholder
  // source rather than thrown away.
  return withOptionals(source ?? 'unknown', medium ?? 'campaign', campaign, term, content)
}

function stripPort(host: string): string {
  return host.replace(/:\d+$/, '')
}

function isLocalHost(host: string): boolean {
  return (
    host === 'localhost' ||
    host.endsWith('.localhost') ||
    host === '127.0.0.1' ||
    host === '::1' ||
    host === '[::1]'
  )
}

/**
 * Whether a referrer is really this site. A visitor moving from the lander to
 * the team page and back has not arrived from anywhere, and neither has a
 * developer clicking around on localhost.
 */
function isSelfReferral(host: string, selfHost: string): boolean {
  if (isLocalHost(host)) return true
  const self = stripPort(selfHost).toLowerCase().replace(/^www\./, '')
  const bare = host.replace(/^www\./, '')
  return bare === self || bare.endsWith(`.${self}`)
}

function fromReferrer(referrer: string, selfHost: string): FirstTouch | null {
  let host: string
  try {
    const url = new URL(referrer)
    // A referrer that is not a web page — an app's custom scheme, say — names
    // no host we could report.
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    host = url.hostname.toLowerCase()
  } catch {
    return null
  }

  if (host.length === 0 || isSelfReferral(host, selfHost)) return null

  for (const rule of HOST_RULES) {
    if (rule.host.test(host)) return { source: rule.source, medium: rule.medium }
  }

  // Somewhere we have no name for. The host itself is the honest answer.
  return { source: host.replace(PASSTHROUGH_LABEL, ''), medium: 'referral' }
}

/**
 * What this visit says about where the person came from, or `null` if it says
 * nothing.
 *
 * Explicit `utm_*` params beat the referrer, because they were put on the link
 * deliberately — a poster's QR code, a newsletter, a partner's post — and they
 * describe a channel the referrer header cannot see at all.
 *
 * A direct visit returns `null` rather than claiming itself as the origin.
 * That is deliberate and it is the rule hacklab follows too: somebody who
 * types the address today, comes back through an Instagram story next week and
 * applies then should be credited to Instagram, and a "direct" first touch
 * written on day one would have blocked that forever.
 */
export function deriveFirstTouch(
  search: URLSearchParams,
  referrer: string | null,
  selfHost: string,
): FirstTouch | null {
  const tagged = fromParams(search)
  if (tagged) return tagged
  if (!referrer) return null
  return fromReferrer(referrer, selfHost)
}

/**
 * The cookie body: a query string, so it round-trips through `URLSearchParams`
 * on both sides and needs no parser of its own.
 */
export function serializeFirstTouch(firstTouch: FirstTouch): string {
  const params = new URLSearchParams()
  params.set('source', firstTouch.source)
  params.set('medium', firstTouch.medium)
  if (firstTouch.campaign) params.set('campaign', firstTouch.campaign)
  if (firstTouch.term) params.set('term', firstTouch.term)
  if (firstTouch.content) params.set('content', firstTouch.content)
  return params.toString()
}

export function parseFirstTouch(raw: string | null | undefined): FirstTouch | null {
  if (!raw) return null

  // The cookie is written percent-encoded, so the stored value is one encoding
  // layer above the query string we serialized. Decoding is a no-op on a value
  // that was not encoded, and a malformed escape means somebody hand-wrote the
  // cookie — read it literally rather than dropping it.
  let decoded = raw
  try {
    decoded = decodeURIComponent(raw)
  } catch {
    decoded = raw
  }

  const params = new URLSearchParams(decoded)
  const source = keepUnderCap(params.get('source'))
  if (!source) return null

  // A cookie missing its medium was not written by us; `referral` is the
  // neutral reading of "arrived from somewhere named".
  return withOptionals(
    source,
    keepUnderCap(params.get('medium')) ?? 'referral',
    keepUnderCap(params.get('campaign')),
    keepUnderCap(params.get('term')),
    keepUnderCap(params.get('content')),
  )
}

/** Pull the first touch out of a `document.cookie`-style header. */
export function readFirstTouchCookie(cookieHeader: string): FirstTouch | null {
  for (const part of cookieHeader.split(';')) {
    const separator = part.indexOf('=')
    if (separator < 0) continue
    if (part.slice(0, separator).trim() !== FIRST_TOUCH_COOKIE) continue
    return parseFirstTouch(part.slice(separator + 1).trim())
  }
  return null
}

/**
 * The hacklab URL a join control should point at, tagged with where the person
 * came from.
 *
 * `control` names the button that was pressed, and is only used when the
 * inbound link did not carry a `utm_content` of its own — which story, which
 * poster, which newsletter slot is a more valuable thing to know than which of
 * three buttons on one page got the click.
 */
export function buildJoinUrl(
  base: string,
  firstTouch: FirstTouch | null,
  control: string,
): string {
  let url: URL
  try {
    url = new URL(base)
  } catch {
    // The only way `base` is not the hacklab event page is a hand-set
    // NEXT_PUBLIC_APPLY_URL. A developer who mistypes it should still get the
    // link they asked for, untagged, rather than a page that throws while
    // rendering it.
    return base
  }

  url.searchParams.set('utm_source', firstTouch?.source ?? 'alienbazaar.com')
  url.searchParams.set('utm_medium', firstTouch?.medium ?? 'direct')
  url.searchParams.set('utm_campaign', firstTouch?.campaign ?? DEFAULT_CAMPAIGN)
  if (firstTouch?.term) url.searchParams.set('utm_term', firstTouch.term)
  url.searchParams.set('utm_content', firstTouch?.content ?? control)

  return url.toString()
}
