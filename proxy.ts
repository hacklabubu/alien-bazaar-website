import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import {
  FIRST_TOUCH_COOKIE,
  FIRST_TOUCH_MAX_AGE,
  deriveFirstTouch,
  serializeFirstTouch,
} from './lib/attribution'

/**
 * Stamp the first-touch cookie before anything renders.
 *
 * This has to happen on the server, not in the page. Somebody who taps through
 * from an Instagram story reads the hero and can press "Register now" while the
 * bundle is still downloading, and a first touch recorded after hydration would
 * miss exactly those people — the fastest and most motivated ones. The cookie
 * has to exist before the first paint, so it is written on the response to the
 * landing request itself.
 *
 * First touch means first: once the cookie is set it is left alone for the full
 * thirty days, so a person who arrives from a poster and comes back a week
 * later through a search is still credited to the poster. `lib/attribution.ts`
 * explains why a direct visit declines to claim the slot at all.
 */
export function proxy(request: NextRequest) {
  if (request.cookies.has(FIRST_TOUCH_COOKIE)) return NextResponse.next()

  const firstTouch = deriveFirstTouch(
    request.nextUrl.searchParams,
    request.headers.get('referer'),
    request.nextUrl.host,
  )
  if (!firstTouch) return NextResponse.next()

  const response = NextResponse.next()
  response.cookies.set(FIRST_TOUCH_COOKIE, serializeFirstTouch(firstTouch), {
    path: '/',
    maxAge: FIRST_TOUCH_MAX_AGE,
    sameSite: 'lax',
    // The join controls read this out of `document.cookie` in the browser, so
    // it cannot be httpOnly. Nothing in it is a secret — it is the name of a
    // social network the visitor already knows they came from.
    httpOnly: false,
    secure: request.nextUrl.protocol === 'https:',
  })

  return response
}

export const config = {
  // Page requests only. The API route sets no first touch, `_next` is the
  // bundle, and any path with a dot in it is a file — an icon, a font, a photo
  // out of `public/` — none of which a person can arrive on and read.
  matcher: ['/((?!api/|_next/|.*\\.).*)'],
}
