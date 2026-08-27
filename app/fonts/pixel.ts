import localFont from 'next/font/local'

/**
 * The four Geist Pixel cuts this site sets type in, redeclared here instead of
 * imported from `geist/font/pixel`.
 *
 * The package exports five faces from one module, and a module is evaluated
 * whole: importing `GeistPixelCircle` runs all five `localFont()` calls, each
 * of which registers a `<link rel="preload" as="font">`. So the homepage was
 * fetching 130 KB of pixel fonts at High priority before it could finish the
 * hero — including GeistPixel-Triangle, which nothing on this site has ever
 * used. On a simulated 4G connection those preloads sit directly in front of
 * the LCP image, which is the one request that decides how fast the page feels.
 *
 * Redeclared, each face carries its own answer to "is this needed in the first
 * screen":
 *
 * - Circle is, and stays preloaded. It sets the hero countdown — the four
 *   numbers under the wordmark — so letting it swap in late would flip the
 *   most-looked-at element on the page from Orbitron to pixel a beat after
 *   the visitor arrives.
 *
 * - Grid, Line and Square are not. Every rule that asks for them is below the
 *   fold: the rig numbers in the hardware catalogue, the prize indices, the
 *   timeline stamps, the sponsor plates, the spec table.
 *
 *   Dropping their preload was not enough on its own. Discovered from the
 *   stylesheet instead of the document, they became the longest critical chain
 *   on the page — document, then CSS, then font, three round trips — and a
 *   font the browser believes it must have to draw text is fetched at the
 *   highest priority there is, so they went to the front of the queue ahead of
 *   the hero. `display: optional` is what actually settles it: the browser
 *   gives them one short block period, uses Orbitron if they are not back in
 *   time, and fetches them out of band. On any ordinary connection they arrive
 *   and are used; on a bad first visit those marks are set in Orbitron for
 *   that visit and the hero is a second faster, which is the right way round
 *   for decorative type nobody has scrolled to yet.
 *
 * - Triangle is not declared at all, because nothing references it.
 *
 * The `fallback` list and `adjustFontFallback: false` are copied from the
 * package's own declarations so the metrics and the fallback chain are
 * unchanged — this is the same type on a different schedule, not a
 * substitution. It is repeated in full four times because `next/font` reads
 * these options statically at build time: a shared `const`, or a template
 * literal in `src`, is not a value it can see, and the build fails on it.
 *
 * The four files sit next to this one rather than being read out of the geist
 * package: `next/font/local` will not resolve a `src` that crosses into
 * node_modules, and under pnpm that path is a symlink into the store besides.
 * They live beside TerminessNerdFont-Regular.woff2, which this directory
 * already vendors the same way. `geist` stays a dependency — it is what these
 * are cut from.
 *
 * They are not byte-identical to the package's: each is subset from 420
 * mapped characters to 216, keeping Latin-1 and the punctuation, arrows and
 * currency marks in U+2010–U+205E. The faces ship a charset this page has no
 * use for, and it was costing 102 KB to send it — the subsets are 41 KB. Two
 * consequences worth knowing before touching them: recopying a file from
 * node_modules silently undoes the saving, and a character outside the subset
 * renders in the Orbitron fallback instead. Rebuild them with `pyftsubset
 * --flavor=woff2 --with-zopfli --unicodes=U+0020-007E,U+00A0-00FF,
 * U+2010-2027,U+2030-205E,U+20AC,U+2122,U+2190-2193,U+2212`.
 */

export const GeistPixelCircle = localFont({
  src: './geist-pixel/GeistPixel-Circle.woff2',
  variable: '--font-geist-pixel-circle',
  weight: '500',
  display: 'swap',
  preload: true,
  fallback: [
    'Geist Mono',
    'ui-monospace',
    'SFMono-Regular',
    'Roboto Mono',
    'Menlo',
    'Monaco',
    'Liberation Mono',
    'DejaVu Sans Mono',
    'Courier New',
    'monospace',
  ],
  adjustFontFallback: false,
})

export const GeistPixelGrid = localFont({
  src: './geist-pixel/GeistPixel-Grid.woff2',
  variable: '--font-geist-pixel-grid',
  weight: '500',
  display: 'optional',
  preload: false,
  fallback: [
    'Geist Mono',
    'ui-monospace',
    'SFMono-Regular',
    'Roboto Mono',
    'Menlo',
    'Monaco',
    'Liberation Mono',
    'DejaVu Sans Mono',
    'Courier New',
    'monospace',
  ],
  adjustFontFallback: false,
})

export const GeistPixelLine = localFont({
  src: './geist-pixel/GeistPixel-Line.woff2',
  variable: '--font-geist-pixel-line',
  weight: '500',
  display: 'optional',
  preload: false,
  fallback: [
    'Geist Mono',
    'ui-monospace',
    'SFMono-Regular',
    'Roboto Mono',
    'Menlo',
    'Monaco',
    'Liberation Mono',
    'DejaVu Sans Mono',
    'Courier New',
    'monospace',
  ],
  adjustFontFallback: false,
})

export const GeistPixelSquare = localFont({
  src: './geist-pixel/GeistPixel-Square.woff2',
  variable: '--font-geist-pixel-square',
  weight: '500',
  display: 'optional',
  preload: false,
  fallback: [
    'Geist Mono',
    'ui-monospace',
    'SFMono-Regular',
    'Roboto Mono',
    'Menlo',
    'Monaco',
    'Liberation Mono',
    'DejaVu Sans Mono',
    'Courier New',
    'monospace',
  ],
  adjustFontFallback: false,
})
