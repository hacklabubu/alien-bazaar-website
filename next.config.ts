import type { NextConfig } from 'next'

/**
 * Next 16 only generates the quality levels named here, and silently falls
 * back to 75 for anything else. 75 is the default the rest of the page's
 * photography uses; 90 is for the dark studio work — the two hero plates and
 * the inventory renders — whose falloff to near-black bands visibly at the
 * default.
 */
const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90],
    /**
     * AVIF first, WebP behind it. Next ships WebP alone by default, and the
     * hero is the page's whole first impression: the two plates are the
     * largest thing on the critical path, and AVIF carries this kind of dark,
     * smooth studio photography at a fraction of WebP's bytes for the same
     * quality-90 source. A browser that does not send `image/avif` in its
     * Accept header still gets the WebP, so nothing regresses — the cost is
     * on the build, which now encodes each size twice.
     */
    formats: ['image/avif', 'image/webp'],
  },

  /**
   * `Vary: Accept` on every page, because every page has two representations —
   * see proxy.ts. Without it a shared cache that stored the HTML will hand it
   * to an agent that asked for markdown, or hand a browser a page of markdown,
   * depending only on which request arrived first.
   *
   * Getting it onto the response is harder than it should be, and the shape of
   * this rule is the reason. Next writes its own `Vary` for the App Router —
   * the four `rsc` negotiation headers plus `Accept-Encoding` — and it writes
   * it *last*, replacing anything set before it. A `Vary` set on
   * `NextResponse.next()` in the proxy does not survive; nor does a bare
   * `Vary: Accept` here. Other headers from both layers do survive, so this is
   * specific to `Vary`.
   *
   * So the value below is Next's own list with `Accept` added to the end,
   * rather than `Accept` alone. Whichever of the two writes last, the response
   * carries a `Vary` that is correct for both purposes: the router headers
   * keep client-side navigation caching working, and `Accept` keeps a shared
   * cache from crossing the two representations. Vercel's routing layer
   * applies this in front of the static response, which is the layer that has
   * the final say in production.
   *
   * If a Next upgrade changes that internal list, this value needs to change
   * with it — check `Vary` on a page response after upgrading.
   *
   * The matcher skips `_next` for the same reason the proxy's does: a `Vary`
   * on an immutable, content-hashed build asset only splits its cache entry.
   */
  async headers() {
    return [
      {
        source: '/:path((?!_next/).*)',
        headers: [
          {
            key: 'Vary',
            value:
              'rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch, Accept-Encoding, Accept',
          },
        ],
      },
    ]
  },
}

export default nextConfig
