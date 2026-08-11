import type { NextConfig } from 'next'

/**
 * Next 16 only generates the quality levels named here, and silently falls
 * back to 75 for anything else. 75 is the default every photo on the page
 * uses; 90 is for the hero plate alone, which is a dark grainy studio shot
 * whose falloff bands visibly at the default.
 */
const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90],
  },
}

export default nextConfig
