import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { NOT_FOUND_MARKDOWN, markdownFor } from './lib/markdown'

/**
 * Markdown content negotiation, per acceptmarkdown.com.
 *
 * One URL, two representations. A browser sends `Accept: text/html` and gets
 * the poster; an agent sends `Accept: text/markdown` and gets the same facts
 * as text, without the 85 KB of markup, webfonts and photography that the
 * poster needs and an agent does not. Same address either way, which is the
 * point — an agent that has a link to this site does not need to know about a
 * parallel set of `.md` URLs, and a link shared out of an agent still opens as
 * a page for the person it is sent to.
 *
 * Four things make it correct rather than merely working:
 *
 * - **q-values decide.** `text/markdown,text/html;q=0.8` asks for markdown and
 *   gets it; a browser's `text/html,…,*∕*;q=0.8` asks for HTML and gets that,
 *   because the explicit `text/html` outranks the wildcard the markdown type
 *   has to match through. Comparing presence rather than weight would hand
 *   markdown to every browser on the strength of its `*∕*`.
 *
 * - **`Vary: Accept` on both.** Without it a shared cache that stored one
 *   representation will serve it to everyone asking for the other — the agent
 *   gets HTML, or worse, the browser gets a page of markdown. Next already
 *   sets `Vary` for its own router headers, so this appends rather than
 *   replaces; dropping `rsc` and `next-router-state-tree` would poison client
 *   navigation to fix caching.
 *
 * - **406 when neither is acceptable.** A client that asks for only
 *   `application/json` is told plainly that this address has nothing in that
 *   type, instead of being handed HTML it said it could not read. The test is
 *   deliberately narrow: anything with a wildcard, or any `text/*`, is a
 *   client that can take one of the two, so browsers and crawlers never see
 *   this.
 *
 * - **Only paths that have markdown.** `markdownFor` returns null for anything
 *   else and the request falls through to HTML. Negotiating over a
 *   representation that does not exist would mean inventing one.
 */

/** One `Accept` entry, reduced to the part that decides the outcome. */
type Range = { type: string; q: number }

/**
 * Parse an `Accept` header into media ranges with their weights. Parameters
 * other than `q` are skipped: they matter for types like `text/plain;format=
 * flowed`, and neither representation here has a parameterised form to select.
 */
function parseAccept(header: string): Range[] {
  const out: Range[] = []
  for (const part of header.split(',')) {
    const [raw, ...params] = part.split(';')
    const type = raw.trim().toLowerCase()
    if (!type) continue
    let q = 1
    for (const p of params) {
      const [k, v] = p.split('=')
      if (k?.trim().toLowerCase() === 'q') {
        const n = Number.parseFloat(v ?? '')
        // A malformed q is not a zero — RFC 9110 treats an unparseable
        // parameter as absent, and absent means 1.
        if (Number.isFinite(n)) q = Math.min(Math.max(n, 0), 1)
      }
    }
    out.push({ type, q })
  }
  return out
}

/**
 * How a client asked for one concrete type: the most specific range that
 * matches it, and that range's weight. `text/markdown` is rank 3, `text/*` is
 * 2, `*∕*` is 1, and 0 means the client never covered this type at all.
 *
 * Specificity is kept alongside the weight rather than collapsed into it,
 * because the comparison needs both. `Accept: *∕*` — what curl, and a good
 * many crawlers, send by default — covers markdown and HTML at the same
 * weight through the same wildcard, and a client that expressed no preference
 * between them must get the page, not the markdown. Comparing weights alone
 * cannot see the difference between that and `Accept: text/markdown`.
 */
function offerFor(ranges: Range[], type: string): { rank: number; q: number } {
  const [group] = type.split('/')
  let best = { rank: 0, q: 0 }
  for (const r of ranges) {
    const rank =
      r.type === type ? 3 : r.type === `${group}/*` ? 2 : r.type === '*/*' ? 1 : 0
    if (rank > best.rank) best = { rank, q: r.q }
  }
  return best
}

/**
 * Whether the client asked for markdown in preference to HTML. HTML is the
 * default representation, so markdown has to actually win: either it was named
 * more specifically, or it was named just as specifically and weighted higher.
 * A tie goes to the page.
 */
function prefersMarkdown(
  md: { rank: number; q: number },
  html: { rank: number; q: number }
): boolean {
  if (md.q === 0) return false
  if (md.rank > html.rank) return true
  if (md.rank < html.rank) return false
  return md.q > html.q
}

export function proxy(request: NextRequest) {
  const accept = request.headers.get('accept')
  const { pathname } = request.nextUrl

  // No Accept header at all is not a preference — RFC 9110 says treat it as
  // accepting everything, which for this site means the page.
  if (!accept) return withVary(NextResponse.next())

  const ranges = parseAccept(accept)
  const md = offerFor(ranges, 'text/markdown')
  const html = offerFor(ranges, 'text/html')

  if (prefersMarkdown(md, html)) {
    const body = markdownFor(pathname)
    // The eight paths in lib/markdown are every page this site has, so a miss
    // here is not "no markdown for this page" — it is a page that does not
    // exist, and the honest answer is a 404 whose body says where to go
    // instead. Falling through to HTML would hand the agent a rendered 404 to
    // parse; falling through to a 200 would be worse still.
    return new NextResponse(body ?? NOT_FOUND_MARKDOWN, {
      status: body ? 200 : 404,
      headers: {
        'content-type': 'text/markdown; charset=utf-8',
        vary: 'Accept, Accept-Encoding',
        'cache-control': 'public, max-age=0, must-revalidate',
        // The HTML form of the same address, so an agent that wants to hand
        // a human the page it just read has the canonical link to give.
        link: `<${request.nextUrl.origin}${pathname}>; rel="canonical"`,
      },
    })
  }

  // Neither representation is acceptable to this client, and it did not leave
  // itself a wildcard to fall back on.
  if (md.q === 0 && html.q === 0) {
    return new NextResponse(
      `406 Not Acceptable\n\nThis URL can be served as text/html or text/markdown.\nAsk for one of those.\n`,
      {
        status: 406,
        headers: {
          'content-type': 'text/plain; charset=utf-8',
          vary: 'Accept, Accept-Encoding',
        },
      }
    )
  }

  return withVary(NextResponse.next())
}

/**
 * Append `Accept` to whatever `Vary` the response already carries. Next sets
 * its own router values on `Vary` further down the stack, so this reads the
 * current value and adds to it rather than assuming it is empty.
 */
function withVary(response: NextResponse) {
  const existing = response.headers.get('vary')
  const parts = existing
    ? existing
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : []
  if (!parts.some((p) => p.toLowerCase() === 'accept')) parts.push('Accept')
  response.headers.set('vary', parts.join(', '))
  return response
}

/**
 * Pages only. `_next` is the build output, `api` negotiates nothing, and the
 * final group excludes anything with a file extension — the OG image, the
 * favicon, robots.txt, sitemap.xml, llms.txt — all of which have exactly one
 * representation and would only be slowed down by passing through here.
 */
export const config = {
  matcher: ['/((?!_next/|api/|.*\\.[^/]+$).*)'],
}
