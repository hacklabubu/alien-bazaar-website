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
}

export default nextConfig
