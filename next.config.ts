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
  },

  /**
   * Dev only. Next 16 refuses any `/_next/*` request whose Origin is not
   * localhost or a host listed here, which breaks the HMR socket and, on some
   * browsers, the client bundle itself when the dev server is opened over
   * Tailscale. Entries are hostnames, no scheme or port; `*` matches one
   * dotted segment, so `100.*.*.*` covers every address in Tailscale's CGNAT
   * range and `*.ts.net` covers MagicDNS names. Ignored by `next build`.
   */
  allowedDevOrigins: ['100.*.*.*', '*.ts.net', '10.0.14.3'],
}

export default nextConfig
