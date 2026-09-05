# Alien Bazaar — Warsaw 2026

Dedicated landing page for **Alien Bazaar — Warsaw 2026** — 25–27 September
2026, at Hacker Bloc powered by Epikor and Hacklab, Warsaw, Poland.

Three days of home automation. Every team books one machine, teams wire their
machines into each other, and what gets pitched to investors after 48 work
hours is the combined system. Room for 100, teams of up to four. Applications
are handled on
[hacklab.so](https://hacklab.so/hackathons/ab26); this repo
is only the poster.

The Next.js app is the repository root — there is no wrapper directory.

## Running it

pnpm is the package manager for this project. It is pinned in `package.json`
via `packageManager`, and `pnpm-lock.yaml` is the only lockfile — `npm install`
here is a mistake, and `package-lock.json` is gitignored so it cannot come back
by accident.

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

`pnpm build && pnpm start` for a production build. The page is fully static —
there is no database and no API.

`lib/event.ts` exports `JOIN_URL`, which can be aimed at a local hacklab
instance with `NEXT_PUBLIC_APPLY_URL`:

```bash
NEXT_PUBLIC_APPLY_URL=http://localhost:3000/hackathons/ab26 pnpm dev
```

The override replaces the destination outright, so it reaches every join
control on the site — the hero, the timeline stop, the closer and the menu
overlay's "Apply now".

### Source attribution

Applications happen on hacklab.so, so without help the hop off this site erases
where the person came from: hacklab sees a referrer of alienbazaar.com and
nothing else, and every signup looks the same. `proxy.ts` closes that gap. On
the first page request it works out a first touch — from `utm_*` params if the
link carried any, otherwise from the `Referer` header, mapped to a canonical
name (`instagram.com` and `l.instagram.com` both become `ig`, any `google.*`
becomes `google`) — and stores it in an `ab_ft` cookie for thirty days. It runs
on the server so the cookie exists before the first paint, which matters because
somebody arriving from a story can press "Register now" before the bundle has
finished loading. A direct visit deliberately stores nothing, so a person who
types the address today and returns through an Instagram story next week is
still credited to Instagram.

Every join control then appends `utm_*` to its hacklab URL, reading that cookie
after mount. `utm_source` and `utm_medium` are the remembered origin, or
`alienbazaar.com` / `direct` when there is none; `utm_campaign` is the inbound
link's own campaign or `ab26`; `utm_content` is the inbound link's content tag
or, failing that, which button was pressed (`menu`, `hero`, `closer`). hacklab's
middleware records those on its own first-touch cookie and attaches them to the
signup event, so signups can be broken down by original source, and
`utm_campaign=ab26` groups everything this site routed. The rewrite lands on the
anchor's `href` rather than in a click handler, so copying the link or opening
it in a new tab carries the tag too.

A tagged inbound link is forwarded verbatim — explicit params always beat the
referrer, because somebody chose them:

```
https://alienbazaar.com/?utm_source=poster&utm_medium=qr
```

## How it is put together

```
├── app/
│   ├── layout.tsx      Chakra Petch + JetBrains Mono + Poppins
│   ├── page.tsx        renders the lander
│   ├── globals.css     reset only — the page owns its own palette
│   ├── team/           the team page
│   ├── sponsor/        sponsorship packages
│   └── partners/       partners page
├── components/
│   ├── lander.tsx      the page
│   ├── lander.css      scoped to .hw26
│   ├── join-link.tsx   the join controls, tagged with the first touch
│   ├── team.tsx        the team page
│   ├── sponsor.tsx     the sponsor page
│   ├── sponsor.css
│   ├── partners.tsx    the partners page
│   ├── cursor.tsx      the DOM cursor
│   ├── cursor.css
│   ├── intro.tsx       load sequence, currently disabled
│   └── intro.css
├── lib/
│   ├── event.ts        the event: dates, venue, capacity
│   ├── attribution.ts  first touch in, utm_* out
│   └── packages.ts     sponsorship tiers
├── proxy.ts            stamps the ab_ft cookie on the landing request
└── public/             photos and sponsor marks
```

Everything the page states about the event comes from `lib/event.ts`, so the
dates and venue are stated once. On hacklab.so the same component reads that
object from the database instead; the shape is identical so it moves back
without edits.

All CSS is namespaced under `.hw26` / `.hw26-intro` and the palette is declared
locally. `app/layout.tsx` stamps `data-theme='dark'` on `<html>` and nothing on
the page changes it, so the page renders dark regardless of the visitor's light
or dark preference — the `html[data-theme='light']` palette in `lander.css` is
still there, but dormant. A poster does not flip to light mode.

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

Type is Chakra Petch for display and JetBrains Mono for everything else, plus four
[Geist Pixel](https://vercel.com/font) cuts with one job each: Circle for
numerals that count, Grid for title-block cells, Square for the stamped plate
number, Line for the intro's readout.

The 2.5s intro sequence — handshake, arming, lock — is still in the repo but
switched off: the `HardwareIntro` import at the top of `components/lander.tsx`
is commented out. Uncomment it, and the `<HardwareIntro />` render at the top
of the tree, to bring it back.

## Credits

Photography from [Pexels](https://www.pexels.com) under the Pexels License.

Sponsor marks are the trademarks of their respective owners, reproduced
unmodified for sponsorship identification.
