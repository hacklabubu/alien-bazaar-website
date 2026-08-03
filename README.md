# Hardware Hackathon Warsaw 2026

Dedicated landing page for **Hardware Hackathon Warsaw 2026** — 12–13 September
2026, at the Hacker House powered by Hacklab and Epikor.

Two days, four tracks, and a lab of robots, drones and printers that teams book
in slots for the whole weekend. Applications are handled on
[hacklab.so](https://hacklab.so/hackathons/hardware-hackathon-warsaw-2026); this
repo is only the poster.

```
landing_page/     Next.js app — the landing page
```

## Running it

```bash
cd landing_page
pnpm install
pnpm dev            # http://localhost:3000
```

`pnpm build && pnpm start` for a production build. The page is fully static —
there is no database and no API.

To point "Apply now" at a local hacklab instance instead of production:

```bash
NEXT_PUBLIC_APPLY_URL=http://localhost:3000/hackathons/hardware-hackathon-warsaw-2026 pnpm dev
```

## How it is put together

```
landing_page/
├── app/
│   ├── layout.tsx      Orbitron + JetBrains Mono + Terminess
│   ├── page.tsx        renders the lander
│   └── globals.css     reset only — the page owns its own palette
├── components/
│   ├── lander.tsx      the page
│   ├── lander.css      scoped to .hw26
│   ├── intro.tsx       2.5s intro sequence
│   └── intro.css       scoped to .hw26-intro
├── lib/event.ts        the event: dates, venue, capacity
└── public/             photos and sponsor marks
```

Everything the page states about the event comes from `lib/event.ts`, so the
dates and venue are stated once. On hacklab.so the same component reads that
object from the database instead; the shape is identical so it moves back
without edits.

All CSS is namespaced under `.hw26` / `.hw26-intro` and the palette is declared
locally, so the page renders identically regardless of the visitor's light or
dark preference. A poster does not flip to light mode.

### Design

Neoindustrial — machine-shop signage read through a phosphor terminal. The
vocabulary is real industrial marking: stencil plate numbers, part
designations, registration crosshairs, hazard rules, a drawing title block for
a footer.

Colour is used as signal, not decoration:

| | |
|---|---|
| **Phosphor Mint** `#82F5C6` | the single accent — interactive, active, alive |
| **Matrix Green** `#00FF41` | one place only: the UFO's beam |
| **Burn Red** `#FC3500` | only the three hard gates — teams lock, tracks lock, submissions due. If it is red, a clock is running out. |

Type is Orbitron for display and JetBrains Mono for everything else, plus four
[Geist Pixel](https://vercel.com/font) cuts with one job each: Circle for
numerals that count, Grid for title-block cells, Square for the stamped plate
number, Line for the intro's readout.

The intro runs 2.5s in three acts — handshake, arming, lock. Press `1` or `R`
to replay it, `Esc` or click to skip. It mounts client-side only, so the page
is fully readable without JavaScript, and it is skipped entirely under
`prefers-reduced-motion`.

## Credits

Photography from [Pexels](https://www.pexels.com) under the Pexels License.

Sponsor marks are the trademarks of their respective owners, reproduced
unmodified for sponsorship identification.
