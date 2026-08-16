import { NextResponse } from 'next/server'

import {
  claimInquiryRequest,
  completeInquiryRequest,
  releaseInquiryRequest,
} from '../../../lib/inquiry-dedupe'
import { checkInquiryRateLimit } from '../../../lib/inquiry-rate-limit'

type Inquiry = {
  category?: unknown
  companyFax?: unknown
  email?: unknown
  kind?: unknown
  message?: unknown
  name?: unknown
  openedAt?: unknown
  organization?: unknown
  requestId?: unknown
  website?: unknown
}

const MAX_BODY_BYTES = 12_000
const MIN_FORM_AGE_MS = 1_200
const MAX_FORM_AGE_MS = 2 * 60 * 60 * 1_000
const IP_RATE = { limit: 5, windowMs: 10 * 60 * 1_000 }
const EMAIL_RATE = { limit: 2, windowMs: 60 * 60 * 1_000 }

const LIMITS = {
  category: 80,
  email: 160,
  message: 2_000,
  name: 100,
  organization: 160,
  requestId: 100,
  website: 300,
} as const

const CATEGORIES = {
  partner: new Set([
    'Ecosystem partner',
    'Hardware partner',
    'Media partner',
    'Prize partner',
  ]),
  sponsor: new Set(['Gold — $5,000', 'Diamond — $10,000', 'Uranium — $20,000']),
} as const

function field(value: unknown) {
  return typeof value === 'string'
    ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim()
    : ''
}

function clientIdentifier(request: Request) {
  const headers = request.headers
  const ip =
    headers.get('x-real-ip') ??
    headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return ip || `unknown:${headers.get('user-agent') ?? 'no-user-agent'}`
}

function sameOrigin(request: Request) {
  const origin = request.headers.get('origin')
  const host =
    request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  const fetchSite = request.headers.get('sec-fetch-site')

  if (fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'same-site') {
    return false
  }
  if (!origin || !host) return true

  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

function rateLimitResponse(retryAfter: number) {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      headers: { 'retry-after': String(retryAfter) },
      status: 429,
    },
  )
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (!request.headers.get('content-type')?.startsWith('application/json')) {
    return NextResponse.json({ error: 'Unsupported content type' }, { status: 415 })
  }

  const contentLength = Number(request.headers.get('content-length') ?? 0)
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Request is too large' }, { status: 413 })
  }

  const ipLimit = await checkInquiryRateLimit(
    `ip:${clientIdentifier(request)}`,
    IP_RATE.limit,
    IP_RATE.windowMs,
  )
  if (!ipLimit.allowed) return rateLimitResponse(ipLimit.retryAfter)

  let body: Inquiry
  try {
    const raw = await request.text()
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Request is too large' }, { status: 413 })
    }
    body = JSON.parse(raw) as Inquiry
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  // Honeypot submissions get a normal success response but never reach Telegram.
  if (field(body.companyFax)) return NextResponse.json({ ok: true })

  const kind = body.kind === 'partner' || body.kind === 'sponsor' ? body.kind : ''
  const category = field(body.category)
  const email = field(body.email).toLowerCase()
  const message = field(body.message)
  const name = field(body.name)
  const organization = field(body.organization)
  const requestId = field(body.requestId)
  const websiteInput = field(body.website)
  let website = websiteInput
  const openedAt = typeof body.openedAt === 'number' ? body.openedAt : 0
  const formAge = Date.now() - openedAt

  const fieldsWithinLimits =
    category.length <= LIMITS.category &&
    email.length <= LIMITS.email &&
    message.length <= LIMITS.message &&
    name.length <= LIMITS.name &&
    organization.length <= LIMITS.organization &&
    requestId.length <= LIMITS.requestId &&
    websiteInput.length <= LIMITS.website

  let websiteIsValid = true
  if (websiteInput) {
    try {
      const parsed = new URL(
        /^https?:\/\//i.test(websiteInput)
          ? websiteInput
          : `https://${websiteInput}`,
      )
      websiteIsValid =
        (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
        Boolean(parsed.hostname)
      if (websiteIsValid) website = parsed.toString()
    } catch {
      websiteIsValid = false
    }
  }

  if (
    !kind ||
    !CATEGORIES[kind].has(category) ||
    !name ||
    !organization ||
    !/^[a-zA-Z0-9-]{16,100}$/.test(requestId) ||
    !message ||
    !fieldsWithinLimits ||
    !websiteIsValid ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    formAge < MIN_FORM_AGE_MS ||
    formAge > MAX_FORM_AGE_MS
  ) {
    return NextResponse.json(
      { error: 'Please complete all fields correctly' },
      { status: 400 },
    )
  }

  const requestState = claimInquiryRequest(requestId)
  if (requestState === 'sent') {
    return NextResponse.json({ deduplicated: true, ok: true })
  }
  if (requestState === 'pending') {
    return NextResponse.json(
      { error: 'This request is already being processed' },
      { status: 409 },
    )
  }

  const emailLimit = await checkInquiryRateLimit(
    `email:${email}`,
    EMAIL_RATE.limit,
    EMAIL_RATE.windowMs,
  )
  if (!emailLimit.allowed) {
    releaseInquiryRequest(requestId)
    return rateLimitResponse(emailLimit.retryAfter)
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    releaseInquiryRequest(requestId)
    console.error('Telegram inquiry delivery is not configured')
    return NextResponse.json(
      { error: 'Inquiry delivery is unavailable' },
      { status: 503 },
    )
  }

  const telegramText = [
    `NEW ${kind.toUpperCase()} REQUEST`,
    '',
    `Category: ${category.replace(/\s*—\s*/g, ' - ')}`,
    `Name: ${name}`,
    `Email: ${email}`,
    `Organization: ${organization}`,
    `Website: ${website || 'Not provided'}`,
    '',
    'Message:',
    message,
  ].join('\n')

  try {
    const telegram = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        body: JSON.stringify({ chat_id: chatId, text: telegramText }),
        cache: 'no-store',
        headers: { 'content-type': 'application/json' },
        method: 'POST',
        signal: AbortSignal.timeout(10_000),
      },
    )

    const telegramResult = (await telegram.json().catch(() => null)) as
      | { ok?: boolean }
      | null

    if (!telegram.ok || !telegramResult?.ok) {
      releaseInquiryRequest(requestId)
      console.error('Telegram inquiry delivery failed', telegram.status)
      return NextResponse.json({ error: 'Delivery failed' }, { status: 502 })
    }
  } catch {
    releaseInquiryRequest(requestId)
    console.error('Telegram inquiry delivery failed')
    return NextResponse.json({ error: 'Delivery failed' }, { status: 502 })
  }

  completeInquiryRequest(requestId)

  return NextResponse.json(
    { ok: true },
    {
      headers: {
        'x-ratelimit-limit': String(IP_RATE.limit),
        'x-ratelimit-remaining': String(ipLimit.remaining),
        'x-ratelimit-reset': String(ipLimit.retryAfter),
      },
    },
  )
}
