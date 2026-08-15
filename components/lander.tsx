"use client";

import {
  GeistPixelCircle,
  GeistPixelGrid,
  GeistPixelLine,
  GeistPixelSquare,
} from "geist/font/pixel";
import Image from "next/image";
import Link from "next/link";
import {
  type CSSProperties,
  type ReactNode,
  type RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import "./lander.css";
// The load sequence is intentionally disabled for now. intro.tsx and
// intro.css are untouched and still build — uncomment this line and the
// <HardwareIntro /> render at the top of the tree to bring it back.
// import { HardwareIntro } from './intro'
import { JOIN_URL, type HardwareEvent } from "../lib/event";

/**
 * Alien Bazaar — Warsaw 2026. The event's own landing page.
 *
 * Neoindustrial: machine-shop signage read through a phosphor terminal.
 * Structure carries meaning rather than decorating it — the rig panels carry
 * a unit count because the booking sheet is finite and that number is the
 * whole constraint, and the mint accent marks both the interactive and the
 * gates that can cost you something.
 *
 * The page is dark. A light palette still exists in lander.css, keyed off
 * data-theme on <html>, but nothing on the page sets that attribute any
 * more — the toggle that did has been removed.
 *
 * Facts come from the event row, so the page cannot drift from
 * `/hackathons/<slug>`. Copy that is not in the database lives here.
 */

/**
 * The ribbon under the hero. Four facts, not nine: when, how many teams, how
 * much hardware, where — the questions a reader has before they have decided
 * to read anything else, answered in the width of one band.
 *
 * The accent goes on the city, and the team count is stated plainly. It was
 * the other way round until recently.
 *
 * Elsewhere on the page mint marks what is interactive or counted, which is
 * what put it on the cap here to begin with. Across four facts read at a
 * glance that turned out to be the wrong one to light: the count is the fact
 * a reader argues with, but the city is the fact that ends the argument —
 * whoever cannot be in Warsaw that weekend is finished reading whatever the
 * cap says. So the band spends its one accent on the word that decides, and
 * the count comes up white at the weight of everything around it: still
 * lifted out of the silver the other labels are set in, no longer shouting.
 *
 * The unit count is untouched by any of this. It is the same figure seen from
 * the other side — one machine per team — so it is a fact about the floor
 * rather than a second cap, and it has never needed marking.
 *
 * `snow` names the ink the way `mint` named it before, and covers the whole
 * label rather than a run inside it. The render gives it a `b` because that
 * tag was already the hook for "this label is set differently"; the weight it
 * would otherwise arrive with is turned off in the CSS, exactly the way `i`'s
 * slant is.
 *
 * `emphasize` is the trailing run of a label, a field rather than a flag so
 * it can hold the substring itself and the render does not have to know where
 * the word ends. The address is one label because a street and a city split
 * across two facts would read as two places, but the street is where you go
 * once you have already decided and the city is what decides it, so the two
 * halves are not carrying the same weight and they are not set as though they
 * were.
 */
const TICKER = [
  { label: "25.09.–27.09.2026." },
  { label: "20 TEAMS", snow: true },
  { label: "20 HARDWARE UNITS" },
  { label: "HACKER BLOC, WARSAW", emphasize: "WARSAW" },
];

/**
 * How many times the four facts are laid end to end inside one marquee
 * track. The loop translates each track by exactly its own width, so it is
 * only seamless while a single track is at least as wide as the viewport —
 * with four short labels that is not true on a desktop, and the band would
 * show a hole every cycle. Four runs clear any ordinary monitor; the
 * `min-width` on the track in the stylesheet is what covers the rest.
 */
const TICKER_RUNS = 4;

const CONTACT_EMAIL = "tymofiigusak@epikor.eu";
const SUPPORT_EMAIL = "sos@hacklab.so";

function contactHref(subject: string) {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

/**
 * The floor, by what the machine is.
 *
 * The closed/open split is gone and so are the two mint labels that carried
 * it. A team choosing hardware is not choosing a set of terms, it is choosing
 * between an arm, a drone, something that goes underwater, something that
 * walks and a headset — so the groups are the categories themselves, six of
 * them, each titled in the medium heading cut (`.hw26-cat`) rather than in a
 * 10px eyebrow. One `h2` still; the group titles are the `h3`s under it and
 * the entry names step down to `h4`.
 *
 * The order runs by how the machine moves: wheels, then air, then water, then
 * legs — robodogs beside the humanoids because those are the two groups that
 * walk, and a quadruped filed under "other" was the leftovers bin holding a
 * machine the reader is specifically looking for. Headsets stay last, because
 * they are the one group here that is not a machine on the floor at all.
 *
 * That group is titled by the object and not by the technology, which is the
 * shape every other title here already has — "Robot arms", "Drones". Called
 * "VR" it was naming a technique, and half of what is in it is not that: a
 * Quest is a VR headset and a HoloLens is a mixed-reality one, and a reader
 * who came for the HoloLens would be looking for it under a heading that
 * excludes it. "Headsets" is what both of them are.
 *
 * One line per entry, and for two of them one short caption under it. Not the
 * blurb that came off this section earlier — that was a paragraph per cell at
 * a third of the sheet, which turns an inventory into twelve essays. `note`
 * is a single clause saying the one thing the name cannot, and it is rendered
 * only where there is one.
 *
 * `units` is the count as the organizers write it — `2x`, `6x`, `?` — so the
 * display figure stays a short glyph run in every cell rather than a sum, and
 * the reader is never asked whether `02` means two or the second of
 * something. It is optional, and an entry the organizers have named without
 * naming a number simply goes without: the corner stays empty. `?` is not the
 * spelling for that — it is the placeholder's glyph, it comes with the muted
 * panel and it says the *entry* is unsettled, which is the opposite of what a
 * named machine with an open count is saying.
 *
 * It is also not in the corner. `units` names the field, but on an
 * `unannounced` cell what that field holds is not a figure about the machine,
 * it is the only picture the cell has — so the stylesheet takes the `?` out
 * of the numeral's corner slot and lays it across the panel as ground, on the
 * plate's rules and with the plate's hover. A real count stays in the corner
 * wherever there is one.
 *
 * The per-entry status tag is gone with the split it described. "Ready to
 * use" against "Custom design by you" was the closed/open distinction said a
 * second time, and under these headings it would be saying it about groups
 * that no longer divide that way. The one status still worth printing is that
 * something is not settled yet, which is what `tba` is.
 *
 * `photo` is the plate behind the panel, and the rule is now the machine
 * rather than the group: a cell carries the picture of *its own* machine, and
 * the cells whose machine has not been settled yet carry none. Twelve of
 * fourteen have one. This replaces the old rule that plates went on a whole
 * group or on none of it, which existed because the house had seven stock
 * photographs and dressing robo fish in a picture of a workshop bench was
 * worse than leaving the cell flat. There is a stylized render per machine
 * now, so the stand-in problem is gone and with it the reason to ration
 * plates by group. What is left is the honest reading: a plate means we can
 * show you this one.
 *
 * They are ground for type at 16% opacity in greyscale, so they are `alt=''`.
 *
 * `tba` is the marker: this exists but is not announced. `unannounced` is the
 * stronger case — the entry *is* the placeholder, so it takes `?` where a
 * count goes and the muted panel. Every cell that carries one now carries
 * both: the headsets used to be the standing example of the weaker case, a
 * cell flagged TBA that kept a real count and a live panel because only the
 * details were pending, and they are two named, photographed, counted
 * machines now. The fields stay separate because they say different things —
 * `tba` prints the line, `unannounced` mutes the cell — and the day another
 * machine is on the floor with its model still open, the weaker case is
 * already spelled out rather than having to be reinvented.
 *
 * No `unannounced` cell carries a plate any more. Both of them used to, on the
 * argument that the machine was picked and only the count and the name were
 * open — but the renders they carried were of a generic cobot and a generic
 * humanoid, which is the stand-in problem this section threw out once already,
 * dressed as a decision. A placeholder that shows a picture is claiming a
 * machine; these two are claiming a category. They are flat now, and on the
 * floor the rule reads without an exception: a plate means we can show you
 * this one. The dimmed-plate rules stay in the stylesheet for the day a
 * placeholder has a real render behind it.
 *
 * The add-ons' Components cell is the exception, and it is deliberate: it is
 * named TBA, it carries a photograph, and it sets neither flag. What the
 * picture shows is a shelf of parts, not a machine — so it is not standing in
 * for anything, and the claim the rule guards against is not being made. A
 * generic cobot render says *this* is the arm; a stock shot of the components
 * wall says there are components, which is true today and is the one thing
 * about that cell that is settled. See the note on ADDON_GROUPS.
 */
type Rig = {
  name: string;
  units?: string;
  note?: string;
  photo?: string;
  tba?: boolean;
  dropShadow?: boolean;
  unannounced?: boolean;
  /**
   * Throws the plate out of focus. One cell sets it: the Components card,
   * whose picture is a stock shot of a shelf rather than a render of the
   * machine the cell names — because the cell does not name a machine.
   *
   * The plate treatment everywhere else is tuned for a photograph you are
   * meant to half-read: the shape under the type is the thing being shown,
   * and it stays sharp. Here there is nothing to read. A legible photograph
   * of some components would invite the reader to work out *which*
   * components, which is exactly the question the card's name declines to
   * answer, so the picture is taken down to texture and left there.
   *
   * A field on the item rather than a second flag on the group, and it does
   * not compose with `unannounced`: that one already has a picture, the `?`,
   * and it owns the same slot.
   */
  blurPhoto?: boolean;
  /**
   * The partner whose parts a cell is built out of, as a mark and the sentence
   * that mark stands for. The two "Build your own" slots set it and nothing
   * else does, which is the rule rather than the coincidence: a cell that
   * names a machine is showing you a machine, and a cell that asks a team to
   * build one has to say what they are building it out of. Arms come from MAB
   * Robotics, drones from SPRTK.
   *
   * A field and not a flag, so the second one cost a file and a line of copy
   * and no new mechanism.
   *
   * Both halves are required together, which is why it is one object and not
   * two optional fields: a mark with no sentence is an unattributable logo on
   * a card, and a sentence with no mark is not what this is for. The
   * stylesheet's placement note is on `.hw26-rig-credit`.
   */
  credit?: { src: string; label: string };
};

const RIG_GROUPS: { label: string; items: Rig[] }[] = [
  {
    label: "Drones",
    items: [
      {
        name: "Tbot",
        units: "2x",
        photo: "/hardware/tbot.jpg",
        dropShadow: true,
      },
      { name: "FPV", units: "1x", photo: "/hardware/drone-fpv.png" },
      {
        name: "Build your own",
        units: "1x",
        note: "We provide components and tools, you design and assemble it",
        photo: "/hardware/drone-byo.png",
        // The white cut of SPRTK's mark rather than the green one the wall
        // carries. On the wall the mark is a tile and its own colour is part
        // of what identifies it; here it is a credit in the corner of a panel
        // whose only two inks are snow and mint, and a green lockup would be
        // the one thing on the sheet asserting a third.
        credit: {
          src: "/sponsors/sprtk-white.png",
          label: "Parts supplied by SPRTK",
        },
      },
    ],
  },
  {
    label: "Robot arms",
    items: [
      {
        name: "AgileX Piper",
        units: "2x",
        photo: "/hardware/robo-arm-new.png",
      },
      {
        name: "Robot arms on platform",
        units: "2x",
        photo: "/hardware/robo-arm-big.png",
      },
      {
        name: "Manipulators",
        units: "2x",
        photo: "/hardware/robo-arm.png",
      },
      {
        name: "Build your own",
        units: "2x",
        note: "Robo arms on a wheeled platform. We provide components and tools, you design and assemble it.",
        photo: "/hardware/robo-arm-byo.png",
        // The one credited cell on the floor. The parts a team builds this
        // arm out of are MAB Robotics', so their mark is on it — the same
        // lockup the partner wall carries, at a fraction of the height.
        credit: {
          src: "/sponsors/mab.png",
          label: "Parts supplied by MAB Robotics",
        },
      },
      {
        name: "TBA",
        units: "?",
        tba: true,
        unannounced: true,
      },
    ],
  },
  {
    label: "Underwater drones",
    items: [
      { name: "Robo fish", units: "3x", photo: "/hardware/robo-fish.png" },
      {
        name: "Underwater drone",
        units: "1x",
        photo: "/hardware/underwater-drone.png",
      },
    ],
  },
  {
    label: "Robodogs",
    items: [
      // Non-breaking hyphen: the cell's measure puts the line break exactly
      // on it, and "ROBODOG W01-" over "TEK" reads as a hyphenated word
      // rather than as the machine's name. Wrapped before the model number
      // instead, it comes out as two whole tokens.
      {
        name: "W01‑TEK",
        units: "1x",
        photo: "/hardware/robodog-w01-tek.jpeg",
      },
      {
        name: "Unitree Go2",
        units: "1x",
        photo: "/hardware/robodog-unitree-go2.jpeg",
      },
    ],
  },
  {
    label: "Quadruped robots",
    items: [
      {
        name: "RealAnt",
        units: "1x",
        photo: "/hardware/realant.png",
      },
    ],
  },
  {
    label: "Humanoids",
    items: [
      {
        name: "TBA",
        units: "?",
        tba: true,
        unannounced: true,
      },
    ],
  },
  {
    label: "Headsets",
    items: [
      { name: "Meta Quest", units: "1x", photo: "/hardware/vr-meta.jpeg" },
      {
        name: "Microsoft HoloLens",
        units: "1x",
        photo: "/hardware/vr-holo-lens.jpeg",
      },
    ],
  },
];

/**
 * The add-ons: what is on the floor besides a machine to book.
 *
 * Its own section rather than a seventh category, because these are not
 * something a team books one of — the print farm and the parts room are
 * there for everybody, so nothing here carries a count.
 *
 * It used to be two cells and no headings, on the argument that two cells do
 * not need dividing. They no longer are two: printers and parts are being
 * itemised the way the floor above is, and one flat grid with a print bed
 * next to a reel of cable and no line between them is a bin, not an
 * inventory. So the same structure as the categories — the group titles are
 * `.hw26-cat` `h3`s, the entry names step down to `h4` — which is also the
 * reading that was always true: these are two facilities, not two objects.
 *
 * The printers are named machines now, one cell each, and there is no longer
 * a "Print farm" cell in front of them. That cell was the facility standing in
 * for its contents while its contents were three invented labels — "FDM
 * printers", "Resin printer", "Large format" were the same made-up shelf
 * problem `Components` is described as having below, and the farm was the only
 * true thing in the group. With five real machines under the heading the farm
 * *is* the five of them, and a further cell naming the collection they are the
 * collection of reads as the heading said twice. What it was carrying that is
 * not in a machine's name — the print deadline — was already off it and up in
 * `intro` before this, which is why nothing had to be moved to drop it.
 *
 * The Carvera is a CNC and not a printer, and it is under this heading anyway
 * because that is where the organizers put it. "3D Printers" is the name of a
 * room here rather than a taxonomy, and a reader looking for the machine that
 * cuts will find it filed with the machines that make.
 *
 * None of the five takes a `units`. A count here would be answering a question
 * nobody is asking: these are not machines a team books one of, they are the
 * farm's beds, and "1x" beside a printer would invite exactly the booking the
 * section says is not on offer.
 *
 * Components is one cell. It was two — a "Parts room" card holding the
 * caption and a placeholder card beside it — and between them they were
 * saying one thing twice over: there is a shelf, and what will be on it is
 * not announced. Merged, that is a single card, named TBA for the half that
 * is open, with the caption under it and a photograph of the shelf behind it.
 * It also clears the last cell that echoed its own heading, which is the
 * naming the print farm's cell was dropped for: "Parts room" under
 * "Components" reads as the heading said twice rather than as an entry.
 *
 * That card is dressed like an announced one — full plate, live panel,
 * caption in the note slot — because it sets neither `tba` nor `unannounced`.
 * The flags would mute the panel and lay a giant "?" across it as ground, in
 * the exact slot the plate occupies, and the two would be arguing over the
 * same square: here the photograph *is* the picture. Why that is allowed to
 * carry one when the placeholders upstairs are not is on the `Rig` type, and
 * so is the one thing the plate does not keep, which is focus.
 *
 * `intro` is the other half of that promotion, and it is a *group* field
 * rather than a card one because of what the sentence it holds is doing. The
 * print deadline is not a fact about any one printer — it is the standing
 * instruction for the whole subsection, true of the Formlabs and the H2D
 * alike, and hung off the first card it read as a caption on that one card.
 * (The Carvera is the one machine in the group nobody sends a file to for
 * printing, and the sentence still belongs to the group: it is addressed to
 * the reader about the room, not to a bed about its queue.)
 * Under the heading it is what it is: how you use this group. It is also the
 * only place that sentence now lives, which is the load-bearing part: the
 * cell it used to sit on is gone. Components keeps both halves and keeps them
 * apart: the intro says what is coming, and "use them to extend your
 * hardware" stays down on the card, because it is about the shelf rather than
 * about the subsection. Only `ADDON_GROUPS` carries the field:
 * the categories above render from their own block, none of the six wants an
 * intro line, and a field nobody sets is a field that reads as an oversight.
 *
 * The rest are the machines and the shelves, listed the way the floor lists
 * a manipulator: what it is, and nothing that is not settled. Which is why
 * Components is one cell and not four: `Sensors`, `Motors and drivers` and
 * `Cables and connectors` were invented to fill a row, and three made-up
 * shelf labels are a claim about what is in the room. One card that shows the
 * room and does not name its contents is the honest version of that row —
 * there is more coming, and it is not announced.
 */
const ADDON_GROUPS: { label: string; intro?: string; items: Rig[] }[] = [
  {
    label: "3D Printers",
    intro:
      "Send us your files after 18.09., select a printer and we'll print the items for you before you arrive.",
    items: [
      { name: "Bambu Lab A1", photo: "/hardware/bambulab-a1.jpeg" },
      { name: "Bambu Lab P1S", photo: "/hardware/bambulab-p1s.jpeg" },
      { name: "Bambu Lab H2D", photo: "/hardware/bambulab-h2d.jpeg" },
      { name: "Formlabs", photo: "/hardware/formlabs.jpeg" },
      { name: "Makera Carvera", photo: "/hardware/makera-carvera.jpeg" },
    ],
  },
  {
    label: "Extra components",
    intro:
      "During the hackathon, you will be able to unlock and pick up additional hardware. More information is coming soon.",
    items: [
      {
        name: "TBA",
        photo: "/hardware/components.jpeg",
        blurPhoto: true,
        note: "Use them to extend your hardware",
      },
    ],
  },
];

/**
 * The timeline: six stops, from today to the pitch.
 *
 * The shape of the run in one line. A reader who has just seen what they can
 * book wants to know when they have to have booked it by, and gets that here
 * without reading a table.
 *
 * It used to stop at the doors opening, which was the wrong end to stop at: a
 * line that runs out the moment the event starts answers "when do I have to be
 * ready" and leaves "and then what" to the reader. The last stop is what the
 * three days are for — the submission and the pitch — and putting it on the
 * line makes the whole run one shape with a beginning and an end rather than a
 * countdown that stops at the beginning.
 *
 * Every stop is now a date. There used to be an undated one — "TBA, secret
 * event" — sitting between the two registration dates, on the argument that
 * an unannounced beat belongs inside the stretch the reader is being asked to
 * act in rather than ahead of it. It is gone, and what it took with it is the
 * one thing on the line that was not a commitment: a stop that names neither
 * a date nor a thing is a gap in a sequence whose whole content is the order
 * and the intervals. Stops that all say when are a schedule; a schedule plus a
 * question mark is a schedule with a rumour in it.
 *
 * Its decrypt effect went with it. `SecretLine` and `.hw26-tl-secret` were
 * built for that one line and had no second caller, and `useScramble` — the
 * one thing the live page still imported out of the switched-off intro — has
 * no caller here at all now.
 *
 * Every date is written the same way, and "25 SEP" is the last one to come
 * into line: it was "25.09." while it was the one stop the hero clock pointed
 * at, which made it look like a figure quoted from somewhere else. The ticker
 * still writes the full dotted range because that is the event's dates as a
 * fact; on the line, a stop is a label and the labels match.
 *
 * `live` is the mint flag, and three stops carry it. NOW, because it is the
 * one thing on the line you can act on this second. Then the two hard edges of
 * the event itself: the 25th, which is the moment the hero clock is counting
 * to, and the 27th, which is the hour the work has to be finished and shown.
 * The hero counts to the first of those and not the second, so "what the clock
 * points at" is not the rule and never quite was — the rule is that the accent
 * goes on what a reader has to do something about. Three of these six are
 * dates you have to be somewhere or have something ready by; the other three
 * are dates when something happens to you, and they are silver.
 */
const TIMELINE: {
  when: string;
  what: string;
  live?: boolean;
  cta?: boolean;
}[] = [
  {
    when: "NOW",
    what: "Join the platform, meet builders, and start putting a team together.",
    live: true,
    cta: true,
  },
  {
    when: "1 SEP",
    what: "Registration opens, and the full hardware list is published — subcategories, dimensions, documentation.",
  },
  { when: "15 SEP", what: "Team creation and applications deadline" },
  { when: "18 SEP", what: "We announce selected teams" },
  { when: "25 SEP", what: "The hackathon begins", live: true },
  {
    when: "27 SEP",
    what: "Submission deadline and pitch day in front of investors",
    live: true,
  },
];

/**
 * The brackets beside the line, each one a stretch of time rather than a
 * moment: what the reader is doing between two stops. Written as the stop
 * numbers they span, which since the rewrite is not a shorthand for a
 * position — it *is* the position.
 *
 * They used to be percentages of the band, which only worked while every stop
 * occupied an identical column. The list and the bracket strip are now two
 * subgrids of one grid, so a bracket is placed by naming the rows it spans
 * and lands on its ticks whatever height the stops come out at. Nothing is
 * measured, in script or in CSS, and adding a stop moves the brackets by
 * changing these two numbers and nothing else — as does taking one out, which
 * is what happened when the undated stop went and is why the first three read
 * 1–3, 3–4 and 4–5 rather than 1–4, 4–5 and 5–6. The stretches they name did
 * not change; the stops under them are one position earlier.
 *
 * `from` is the stop the stretch starts at and `to` is the stop it ends at,
 * both inclusive of the tick: the first bracket runs from today to the
 * booking deadline, the second covers selection, the third is the print queue
 * between the announcement and the doors, and the fourth is the hackathon
 * itself, from the doors to the pitch.
 *
 * That fourth one is new and it overturns an argument this comment used to
 * make. The reasoning was that a bracket names a wait — what a reader is
 * doing between two dates while nothing on the line is happening — and that
 * the weekend is the opposite of a wait, so the last stretch was deliberately
 * left bare. What that produced on the page was a strip of annotation that
 * simply stopped two stops before the line did, and the gap read as an
 * omission rather than as a statement: the one stretch a reader is actually
 * coming for was the one stretch with nothing written over it. A bracket is
 * better understood as naming a stretch than as naming a wait, and under that
 * reading the weekend has the best claim of the four. Four brackets over six
 * stops, and the strip now runs the whole length of the line.
 */
const TIMELINE_SPANS = [
  { from: 1, to: 3, label: "Chat, create teams, book hardware" },
  { from: 3, to: 4, label: "Selection process" },
  { from: 4, to: 5, label: "We print your requested objects" },
  { from: 5, to: 6, label: "Build, build, build" },
];

/**
 * The two organizers, as marks and nothing else. Each carried a line saying
 * what it does; both are gone — this row is co-branding, and the two names
 * are what it is for. Nothing on the wall carries a line any more, so the
 * treatment here is no longer the exception it once was.
 *
 * `href` is read by the cell rather than by the mark inside it: the whole
 * tile is the link. See the sponsor wall in the tree below.
 */
const ORGANIZERS: {
  name: string;
  src: string;
  href: string;
  mark?: string;
}[] = [
  {
    name: "Epikor",
    // The full horizontal lockup as they publish it — mark plus wordmark,
    // already white, used unmodified. It replaces the bare glyph this cell
    // carried before, which was their site's inline mark recoloured by hand
    // and had no wordmark on it at all.
    //
    // A lockup is not the same object as a glyph, so it cannot keep the
    // glyph's height: see the sizing note in the stylesheet.
    src: "/sponsors/epikor.svg",
    href: "https://epikor.eu",
    mark: "hw26-org-logo--epikor",
  },
  {
    name: "Hacklab",
    // White mark, drawn for the dark plate the organizer cells keep in
    // both themes.
    src: "/sponsors/hacklab.png",
    href: "https://hacklab.so",
  },
];

/**
 * A cell on the partner wall.
 *
 * `src` is required, and that is deliberate rather than incidental. There was a
 * typographic fallback here for a partner that published no artwork of any
 * kind; it has been removed once before, restored when W01-TEK needed it, and
 * removed again now that W01-TEK has a real file. Every name on this wall has
 * one. Making the field required is what stops the branch coming back on a
 * hunch: a partner with no mark will not typecheck, which is the moment to
 * decide what to do about it rather than silently printing their name in
 * Orbitron.
 *
 * `href` *is* optional, and for the opposite reason to `src`. A partner with no
 * mark is a hole in the wall; a partner with no site is an ordinary fact about
 * a partner, and the only alternatives to admitting it are guessing a URL or
 * leaving the tile out. The tile is then a div rather than an anchor — same
 * plate, same mark, no hover bloom and nothing to press — see `SponsorTile`.
 * A dead link on a partner wall is worse than a tile that does not offer one.
 * No tile is in that state today: MCHTR was the last one, and the faculty has
 * since given an address. The optional field and its branch stay, because the
 * next partner to arrive without a site is a fact about them rather than a
 * decision this file gets to make.
 *
 * `mark` names a per-logo sizing class. These are marks at wildly different
 * aspect ratios — a 5.3:1 wordmark and a stacked helmet lockup do not read as
 * the same size at the same height — so optical balance is a decision per file,
 * taken in CSS and pointed at from here. `lockup` is the same idea one box out:
 * it dresses the icon-plus-word stack described under `wordmark`, which is
 * tuned to the word in it and cannot be one figure for every partner.
 */
type Partner = {
  name: string;
  href?: string;
  src: string;
  mark?: string;
  lockup?: string;
  wordmark?: string;
};

/**
 * The two Ecosystem Partners that are not dealt.
 *
 * They were a tier once: these two on a plate twice the linear size of the
 * other three, on the argument that five equal cells would be the wall making
 * a claim about rank nobody authorised. Two sizes turned out to be the louder
 * claim — the organizers publish all five under one heading, and the
 * stylesheet was carrying a paragraph of arithmetic pulling the small row's
 * edges onto the large row's so the two would read as one block anyway. They
 * are one row of five at one size now.
 *
 * The array survives the row that mapped over it, because the two are still
 * the two things the row cannot shuffle: `ecosystem` is dealt again every
 * visit and these two are pinned to the front of it, so they have to be
 * referable by name rather than by position in a shuffled list. See the
 * Ecosystem Partners row in the markup.
 *
 * Every mark is the partner's own file — NVIDIA's straight off their brand
 * page, the rest normalised for the dark plate these cells keep in both
 * themes: white or full-colour ink on transparent, except EuroTech, whose
 * mark is only published on its own deep blue and comes as that plate.
 *
 * Every cell is a centred mark and nothing else. NVIDIA's used to carry a
 * sentence saying what it supplies, and it was the only one — which meant the
 * wall stated one partner's contribution and left the other four's to be
 * guessed at, and put a paragraph of body copy in one tile of a row of logos.
 * With it gone the wall makes no claim about who gave what, and all five cells
 * are the same object at the same weight.
 */
const LEAD_SPONSORS: Partner[] = [
  {
    name: "NVIDIA",
    src: "/sponsors/nvidia.svg",
    href: "https://www.nvidia.com",
    // Their two-colour mark is the stacked lockup, so matching a horizontal
    // wordmark's height would leave it reading half the size.
    mark: "hw26-mark--stacked",
  },
  {
    name: "ESRA — European Student Robotics Association",
    src: "/sponsors/esra.png",
    href: "https://www.studentrobotics.eu/",
    mark: "hw26-mark--esra",
  },
];

/**
 * The shuffled part of the ecosystem row: three partners behind the two pinned
 * names above.
 *
 * Five cells stay equal on desktop; the responsive layouts let the last cell
 * close the one leftover track.
 *
 * Each mark is re-sized rather than scaled: a cell at half the width is not
 * the same cell smaller, and the two plates in particular carry ink across
 * their whole box.
 */
const SMALL_SPONSORS: Partner[] = [
  {
    name: "Eurotech Federation",
    src: "/sponsors/eurotech.png",
    href: "https://www.eurotech-federation.com/",
    // Cropped to the lockup on its own deep blue, not a cut-out mark: every
    // pixel of it is ink, so it reads far heavier per unit of height than the
    // transparent marks beside it and is sized down to compensate.
    mark: "hw26-mark--eurotech",
  },
  {
    name: "Oxbridge Frontier Intelligence",
    src: "/sponsors/ofi.png",
    href: "https://www.oxbridgefrontier.com/",
    mark: "hw26-mark--ofi",
  },
  {
    name: "Hackathon Hub",
    src: "/sponsors/hackathonhub.png",
    href: "https://hackathonhub.eu/",
  },
];

/**
 * The fixed half of the end plate's title block. The cells that depend on the
 * event row are rendered beside these so both halves stay one grid.
 */
const TITLE_BLOCK = [
  { k: "Project", v: "AB—WAW—26" },
  { k: "Sheet", v: "07 / 07" },
  { k: "Rev", v: "03" },
  { k: "Status", v: "Issued", tone: "mint" },
  { k: "Theme", v: "Home automation" },
  { k: "Venue", v: "Hacker Bloc" },
  { k: "Coord", v: "52.2297°N 21.0122°E" },
  { k: "Duration", v: "48 WORK H" },
];

/**
 * The hardware partners — the outfits putting machines and parts on the floor.
 * Smaller tiles than the leads, same treatment otherwise: the mark, nothing
 * else, and the whole tile is the link.
 */
const HARDWARE_PARTNERS: Partner[] = [
  {
    name: "Lute",
    src: "/sponsors/lute.svg",
    href: "https://www.lute.one/",
    mark: "hw26-mark--lute",
  },
  {
    name: "SPRTK",
    src: "/sponsors/sprtk.png",
    href: "https://sprtk.com/",
    mark: "hw26-mark--sprtk",
  },
  {
    name: "BMF — Brave Mind Fighters",
    src: "/sponsors/bmf.png",
    href: "https://bravemindfighters.com/",
    // A helmet stacked over its wordmark: nearly square, so it needs well
    // over the row's height to read at the row's size.
    mark: "hw26-mark--bmf",
  },
  {
    name: "W01-TEK",
    src: "/sponsors/w01tek.png",
    href: "https://machinekind.ai/",
    // A bare wordmark at 5.3:1 in its own face — no symbol beside it, so all
    // of its height is cap height and it grows fast per pixel. The widest
    // thing in this row, and held down accordingly.
    mark: "hw26-mark--w01tek",
  },
  {
    name: "SkyMav",
    src: "/sponsors/skymav.png",
    href: "https://skymav.pl/",
  },
  {
    name: "GHOST",
    src: "/sponsors/ghost-icon.png",
    href: "https://ghostpai.github.io/",
    // Their official icon, untouched: white line art on the red plate they
    // publish it on, square. It is not a lockup on its own — no name in it —
    // so the name is set beneath it in their own face rather than cut into a
    // second bitmap, which is what `wordmark` below is for.
    mark: "hw26-mark--ghost",
    wordmark: "GHOST",
  },
  {
    name: "MAB Robotics",
    src: "/sponsors/mab.png",
    href: "https://www.mabrobotics.pl/",
    // The full lockup rather than the bare monogram it used to be: a heavy
    // three-letter mark with "robotics" tucked under its right shoulder, and
    // 3:1 overall. Wide marks grow fast per pixel of height, so this one now
    // runs under the row's base rather than over it.
    mark: "hw26-mark--mab",
  },
  {
    name: "Politechnika Wrocławska",
    // The one mark on this wall that arrives finished: the university's crest
    // over its own name, both baked into a single portrait file — so unlike
    // GHOST and MCHTR below it needs no live wordmark under it, and unlike
    // them it is not square. Two thirds of its height is crest and the last
    // third is two lines of small type, which is what the sizing note in the
    // stylesheet is about: at the row's base height that type would be
    // illegible, so this runs taller than anything else here.
    src: "/sponsors/pwr.png",
    href: "https://pwr.edu.pl/",
    mark: "hw26-mark--pwr",
  },
  {
    // The faculty's full name is the accessible name and the tooltip; the
    // tile shows "MCHTR", because a small tile that has to carry five Polish
    // words sets them at caption size and stops being a mark on a wall. The
    // long form is not lost — it is what a screen reader reads and what a
    // pointer surfaces.
    name: "MCHTR — Wydział Mechatroniki Politechnika Warszawska",
    // White line art on transparent, keyed off the black-on-white source they
    // publish, and square. Like GHOST's, the file is a symbol with no name in
    // it, so the word is set live underneath rather than cut into a bitmap.
    src: "/sponsors/mchtr.png",
    href: "https://www.mchtr.pw.edu.pl/",
    mark: "hw26-mark--mchtr",
    lockup: "hw26-sponsor-lockup--mchtr",
    wordmark: "MCHTR",
  },
];

/**
 * The media partners. Their own heading rather than a sixth hardware tile:
 * what they put on the floor is coverage, and a group of one that says so is
 * worth more than a name filed under a heading that does not describe it.
 *
 * The mark is a white lockup on the channel's own orange plate — that is how
 * it is published, and there is no transparent cut of it. It gets no frame
 * around that rectangle; it is sized down instead, which is the note in the
 * stylesheet.
 */
const MEDIA_PARTNERS: Partner[] = [
  {
    name: "Przygody Przedsiębiorców",
    src: "/sponsors/przygody.png",
    href: "https://youtube.com/@przygodyprzedsiebiorcow",
    mark: "hw26-mark--przygody",
  },
];

const PRIZE_PARTNERS: Partner[] = [
  {
    name: "ChronoTap",
    src: "/sponsors/chronotap.png",
    href: "https://chronotap.co",
    mark: "hw26-mark--chronotap",
  },
];

/**
 * The sponsors proper — money rather than machines or coverage, which is why
 * this is not the hardware wall with one more tile on it.
 *
 * That argument now has teeth: these render at the lead cell, the same plate
 * the top Ecosystem Partners get, so the tier is stated in the size of the
 * cell and not only in the heading above it. Filed under the same head as the
 * hardware wall and drawn at three times its tile, the distinction survives
 * someone reading the page rather than its subheads.
 */
const SPONSORS: Partner[] = [
  {
    name: "prelint",
    src: "/sponsors/prelint.svg",
    href: "https://prelint.com/",
    mark: "hw26-mark--prelint",
  },
];

/**
 * The questions, in the order they are asked rather than in any order the page
 * would prefer. Cost and start time open the list because they are the two
 * facts a reader checks before deciding whether the rest of the page is for
 * them, and both answer in a line; then what they may book, where they will
 * sleep, what they may bring, who pays for the journey — and the last is the
 * escape hatch for everything not on the list.
 *
 * The start time is written out here as well as being counted down to in the
 * hero, and the two are the same figure: `EVENT.startsAt` in `lib/event.ts` is
 * 08:00 on the 25th. A reader who wants the hour rather than the remaining
 * hours should not have to subtract one from the other.
 *
 * The answers are the organisers' own words and are left alone. Everything
 * else on this page is written copy and reads like it; an FAQ answer is a fact
 * being stated, and rewriting "Unfortunately, no." into the page's voice would
 * make it longer and less useful and would risk changing what it says. The
 * only markup in any of them is the address in the last one, which is a real
 * link because a mail address that cannot be pressed is a string to copy out
 * by hand.
 *
 * `a` is a node rather than a string for that one entry alone. It is cheaper
 * than the alternatives — a second optional field for the link, or a parser
 * over the copy — and it keeps the answers readable as answers.
 */
const FAQ: { q: string; a: ReactNode }[] = [
  {
    q: "Is participation in the hackathon free?",
    a: "Yes.",
  },
  {
    q: "What time is it starting?",
    a: "25.09.2026. at 08:00.",
  },
  {
    q: "Can I book more than one hardware unit?",
    a: "You can only book one main hardware unit (robot arm, drone, underwater drone, robodog, humanoid or VR headset). At the event you will be able to unlock extras: cables, Raspberry PIs, camera modules and more.",
  },
  {
    q: "Can I sleep at the hackathon?",
    a: "Yes, but we won't provide beds or sleeping rooms. You can bring your own sleeping bag or sleeping pad.",
  },
  {
    q: "Can I bring my own hardware, tools, laptops?",
    a: "Yes, bring the equipment you need. You can bring your laptop, mouse, screen, hardware and tools. Just be reasonable: it has to fit on your spot on your desk and it shouldn't bother others.",
  },
  {
    q: "Will you pay for my trip?",
    a: "We will not reimburse travel costs nor accommodation.",
  },
  {
    q: "Will there be free Wi-Fi?",
    a: "Yes, there is free 1Gbps Wi-Fi for all participants. Don't expect the highest speeds when 100 people start downloading Docker images!",
  },
  {
    q: "Can I take my final project home?",
    a: "No. Everything created during the hackathon stays here.",
  },
  {
    q: "I have a different question, how can I contact you?",
    a: (
      <>
        Contact us at{" "}
        <a className="hw26-link" href="mailto:sos@hacklab.so">
          sos@hacklab.so
        </a>
      </>
    ),
  },
];

/**
 * Fisher–Yates, on a copy.
 *
 * Not `sort(() => Math.random() - 0.5)`, which is the one-liner everyone
 * reaches for and is not a shuffle. A comparator is a promise that the ordering
 * it describes is consistent, and a random one breaks that promise — the engine
 * is then free to visit whatever subset of the pairs its algorithm happens to
 * need, so the permutations come out at wildly unequal probabilities and a tile
 * that started near the front tends to finish there. A wall that quietly favours
 * the incumbent order is the exact thing this feature exists to stop doing.
 * Fisher–Yates draws each remaining slot uniformly and is no longer to write.
 *
 * The copy is not politeness either. Every array handed to this is a module
 * constant that outlives the render, so mutating one would permanently reorder
 * the source everything else on the page reads from, and the second visit to
 * the section would be shuffling an already-shuffled list.
 */
function shuffled<T>(items: readonly T[]): readonly T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * `useLayoutEffect` in the browser, `useEffect` where there is no browser.
 *
 * React warns that layout effects do nothing during server rendering, which is
 * true and harmless here — but the warning is real noise on every server
 * render, so the choice is made once at module scope rather than per call. It
 * cannot go stale: nothing grows a `window` halfway through a process.
 */
const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * A partner row in a different order on every visit.
 *
 * The order cannot be decided during render. This page is statically generated,
 * so the HTML every visitor gets is one build's output — genuinely per-visit
 * randomness can only be produced in the browser, and a value produced in the
 * browser during the first render is a value the server could not have written.
 * That is the same trap the countdown is arranged around, and for the same
 * reason it takes the same shape: the canonical order is what the server sends
 * and what the first client render produces, and the real answer arrives one
 * effect later, once the two have already agreed.
 *
 * A *layout* effect specifically, which is the whole reason this is not three
 * lines of `useEffect`. A plain effect runs after the browser has painted, so
 * the reader would see the canonical row and then watch it deal itself out
 * again; a layout effect runs between the commit and the paint, so the only
 * order ever put on a screen is the shuffled one.
 *
 * `items` is a module constant at every call site, so its identity never
 * changes and the effect runs once per mount rather than once per render.
 */
function useShuffled<T>(items: readonly T[]): readonly T[] {
  const [order, setOrder] = useState(items);

  useIsoLayoutEffect(() => {
    setOrder(shuffled(items));
  }, [items]);

  return order;
}

function useReveal() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nodes = root.current?.querySelectorAll(".hw26-reveal");
    if (!nodes?.length) return;

    // No IntersectionObserver (or reduced motion) must never leave the page
    // blank — everything starts hidden, so the fallback is to show it all.
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      for (const n of nodes) n.setAttribute("data-shown", "true");
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-shown", "true");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );
    for (const n of nodes) io.observe(n);
    return () => io.disconnect();
  }, []);

  return root;
}

/**
 * The inventory cell's hover, given to readers who have no pointer to hover
 * with.
 *
 * Every cell in the two `.hw26-rigs` grids opens under the pointer — the plate
 * comes up to near full colour, the count goes mint, the outline goes with it.
 * On a phone none of that had ever been on a screen: `:hover` is a state a
 * finger cannot enter, so the entire treatment was desktop-only decoration and
 * the touch reader got the resting plate for the length of the section. This
 * gives them the same thing along the axis they do have — the cell nearest the
 * middle of the screen wears it, and scrolling moves it down the grid.
 *
 * `(hover: none)` is the whole gate, and it is deliberately not paired with a
 * width. The question is not how wide the window is, it is whether the reader
 * can produce a hover at all, and the two answers come apart in both
 * directions: a tablet at 1200px cannot hover and would be left with the dead
 * state this exists to fix, while a mouse at 380px can, and would get a second
 * cell lighting up under its own. Asking the browser the actual question gets
 * both right. It is also the same query the stylesheet would use, so there is
 * one definition of "no pointer here" rather than a width in script and a
 * capability in CSS. Nothing else on the page is touched: where a real hover
 * exists this hook never arms, never listens, and never writes a class.
 *
 * Which cell is nearest is settled on rects, once per frame, over only the
 * cells that are on screen. The observer is not doing the choosing — it cannot,
 * "closest to the centre" is not a threshold — it is deciding what is worth
 * measuring. That matters mostly for the rest of the page: away from the two
 * grids the intersecting set is empty, so a scroll wakes the frame, finds
 * nothing to measure, clears the class and goes back to sleep without touching
 * layout. Scroll is coalesced onto one `requestAnimationFrame` the way the
 * timeline's pin does it — the handler only ever wakes the loop, and the loop
 * reads the newest position itself, so a phone firing scroll faster than it
 * paints cannot queue up work.
 *
 * Ties go to DOM order, because `<` keeps the first cell that reached the best
 * distance. Two cells exactly equidistant is a real position on a one-column
 * phone grid — the gap between two squares centred on the fold — and without a
 * rule the class would flip between them on sub-pixel scroll noise.
 *
 * The TBA placeholders take part like everything else. They are cells in the
 * same grid with a plate and a hover of their own (a smaller one, deliberately
 * — see `.hw26-rig--tba` in the stylesheet), and skipping them would leave a
 * hole in the middle of the sweep where the light goes out for one square.
 * Their muted figures are in the CSS, so what they do here is exactly what
 * they do under a pointer.
 */
function useRigFocus(root: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const rootEl = root.current;
    if (!rootEl) return;
    if (typeof IntersectionObserver === "undefined") return;

    // In DOM order, which is what makes the tie-break below stable. Both grids
    // — the categories and the add-ons — wear the same cell and behave the
    // same, so this is one flat list rather than a list per section.
    const cells = Array.from(
      rootEl.querySelectorAll<HTMLElement>(".hw26-rig--compact"),
    );
    if (!cells.length) return;

    const touch = window.matchMedia("(hover: none)");

    let frame = 0;
    let armed = false;
    let lit: HTMLElement | null = null;
    const onscreen = new Set<HTMLElement>();

    // One writer for the class, so exactly one cell can carry it and an
    // unchanged pick does not touch the DOM at all.
    const light = (next: HTMLElement | null) => {
      if (next === lit) return;
      lit?.classList.remove("hw26-rig--active");
      next?.classList.add("hw26-rig--active");
      lit = next;
    };

    const pick = () => {
      frame = 0;
      const middle = window.innerHeight / 2;
      let best: HTMLElement | null = null;
      let bestGap = Number.POSITIVE_INFINITY;
      for (const cell of cells) {
        if (!onscreen.has(cell)) continue;
        const rect = cell.getBoundingClientRect();
        const gap = Math.abs(rect.top + rect.height / 2 - middle);
        // Strictly closer, so a tie leaves the earlier cell holding it.
        if (gap < bestGap) {
          bestGap = gap;
          best = cell;
        }
      }
      light(best);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(pick);
    };

    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) onscreen.add(entry.target as HTMLElement);
        else onscreen.delete(entry.target as HTMLElement);
      }
      schedule();
    });

    const arm = () => {
      if (armed) return;
      armed = true;
      for (const cell of cells) io.observe(cell);
      window.addEventListener("scroll", schedule, { passive: true });
      window.addEventListener("resize", schedule);
      schedule();
    };

    // Everything the armed state put anywhere comes back off here, the class
    // included: a cell left lit after the reader has plugged in a mouse or
    // turned the tablet into a desktop-width window is a cell stuck in a state
    // nothing can now leave.
    const disarm = () => {
      if (!armed) return;
      armed = false;
      io.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      onscreen.clear();
      light(null);
    };

    const sync = () => {
      if (touch.matches) arm();
      else disarm();
    };

    sync();
    touch.addEventListener("change", sync);

    return () => {
      touch.removeEventListener("change", sync);
      disarm();
    };
  }, [root]);
}

/**
 * Marks the hero as idle whenever it is off screen, so the CRT flicker can be
 * stopped instead of animating a header nobody is looking at.
 *
 * The flicker on the wordmark and on the alien mark is declared `infinite`,
 * which is the right declaration — a tube does not settle — but it is a promise
 * the page keeps long after the hero has left the screen. Scrolled down to the
 * FAQ, a phone is still being asked for frames on two elements a thousand
 * pixels above the viewport. The animation itself is composited and cheap; what
 * is not free is never being allowed to stop.
 *
 * All this does is write one class. The pause lives in the stylesheet as
 * `animation-play-state: paused`, which holds the frame the element is on and
 * carries on from there — so a hero scrolled back to does not restart its
 * flicker from the top of the keyframes, it simply starts moving again. See the
 * phone budget block at the end of lander.css, where that rule is, and why it
 * is gated to phones even though the observer here is not.
 *
 * It observes unconditionally, on every device, with no media query of its own.
 * Watching a single element with an IntersectionObserver at the default
 * threshold costs approximately nothing — the callback fires twice per pass of
 * the hero, not per scroll event — and a class that is only maintained on some
 * devices is a class no stylesheet can safely read. Whether anything is done
 * with the state is the stylesheet's decision, which is the same division of
 * labour `useRigFocus` makes: script settles which element is in which state,
 * CSS decides what a state looks like.
 *
 * `root: null` is the viewport, and the default threshold means "any part of it
 * visible" — the hero is idle only once its last pixel has gone. That is the
 * conservative end of the choice on purpose: pausing a flicker that is still
 * half on screen would be visible, and there is nothing to be won by pausing a
 * fraction of a second earlier.
 *
 * The class is written only when it changes, for the same reason `useRigFocus`
 * routes every write through one `light()` — an observer callback that touches
 * `classList` on every entry is a style invalidation the browser has to take
 * seriously whether or not anything actually differs.
 */
function useHeroIdle(hero: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = hero.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") return;

    let idle = false;

    const mark = (next: boolean) => {
      if (next === idle) return;
      el.classList.toggle("hw26-hero--idle", next);
      idle = next;
    };

    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) mark(!entry.isIntersecting);
    });

    io.observe(el);

    // The class goes back off with the observer. A hero left marked idle by a
    // teardown is a hero whose flicker nothing will ever start again.
    return () => {
      io.disconnect();
      mark(false);
    };
  }, [hero]);
}

/**
 * The timeline's desktop pin: vertical page scroll spent travelling the line
 * sideways.
 *
 * The whole mechanism is one number. `overflow` is how much wider the track is
 * than the box it sits in, and it is handed to the stylesheet as `--tl-pin`,
 * where it becomes the section's surplus height over one screen. So a full
 * sweep of the pin is a full sweep of the line by construction — there is no
 * second constant to keep in step, and adding a stop lengthens both at once.
 *
 * Progress comes off the section's own `getBoundingClientRect().top` rather
 * than from a scroll position: `top` is 0 the moment the frame sticks and
 * `-(height - viewport)` the moment it lets go, which is exactly the range the
 * translate needs, and it stays correct if anything above the section changes
 * height. Scroll events are coalesced onto one animation frame, so a trackpad
 * firing faster than the display cannot queue up work.
 *
 * What the track does with that progress is damped rather than bolted to it.
 * Nailed 1:1 the line was a second scrollbar — it started at full speed on the
 * pixel the frame stuck, stopped dead on the pixel it released, and every jitter
 * in a trackpad gesture was on the screen at full amplitude. Two things fix
 * that and they do different jobs: a curve softens the two ends of the sweep,
 * and a per-frame chase softens the input. Both are written out where they are
 * defined below, along with the pair of guarantees they are not allowed to
 * cost — that the line is at exactly 0 when the pin takes hold and at exactly
 * full travel when it lets go, and that it comes to a stop rather than creeping
 * after the reader has.
 *
 * None of that is what a reader means when they say the timeline stops them
 * dead, though: what stops is their own vertical scroll, on one pixel, and
 * starts again on one pixel at the far end. A frame cannot be stuck gradually,
 * but it can be *translated* — and a translation over scroll is a speed. So
 * the page's apparent vertical speed is written by hand across a runway
 * centred on each of the two boundaries, going from 1:1 to a standstill on the
 * way in and back on the way out. Half of each runway falls outside the pin,
 * which is what keeps the offset small and the timeline centred through the
 * middle. See `glide` and `lift` below; every runway ends on exactly 0, so
 * nothing is left hanging off its box.
 *
 * Three cases refuse the pin outright, and they all take the same branch:
 * below the breakpoint the layout is vertical and has nothing to travel;
 * under reduced motion, hijacking the scroll is precisely the thing being
 * asked for less of; and if the track already fits there is nothing to
 * travel *to*, so the section keeps its ordinary height and the reader is
 * not made to scroll past a screen of nothing. In all three the attribute is
 * never set, and the stylesheet's standing state — a scrollport the reader
 * can push — is what is left. With no script at all, none of this runs and
 * that same standing state is what ships.
 */
function useTimelinePin() {
  const section = useRef<HTMLElement>(null);
  const port = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sectionEl = section.current;
    const portEl = port.current;
    const trackEl = track.current;
    if (!sectionEl || !portEl || !trackEl) return;

    const wide = window.matchMedia("(min-width: 900px)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    // The frame the stylesheet sticks. Looked up rather than handed a ref of
    // its own so the markup does not have to know the driver moves it.
    const pinEl = portEl.closest<HTMLElement>(".hw26-tl-pin");

    let overflow = 0;
    let frame = 0;
    let last = 0;
    // Where the track actually is, against where the scroll says it should be.
    // Two numbers rather than one because the whole of the smoothing is the
    // gap between them.
    let at = 0;
    // The scroll distance each vertical hand-off is given — half of it before
    // the boundary and half after — and the frame offset last written, so an
    // unchanged offset is not rewritten.
    let runway = 0;
    let lifted = 0;

    const unpin = () => {
      overflow = 0;
      runway = 0;
      at = 0;
      lifted = 0;
      sectionEl.removeAttribute("data-pinned");
      sectionEl.style.removeProperty("--tl-pin");
      // Cleared rather than left stale, and that is load-bearing: the rule that
      // reads it is keyed on the width, not on `data-pinned`, so a leftover
      // lead-in would indent the track by half a screen in exactly the states
      // this branch is for — reduced motion and a screen wide enough to hold
      // all five stops — where nothing drives the track back off it again.
      trackEl.style.removeProperty("--tl-lead-start");
      trackEl.style.transform = "";
      if (pinEl) pinEl.style.transform = "";
    };

    const paint = (x: number) => {
      trackEl.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
    };

    // The frame's own vertical offset, which is the whole of the hand-off.
    const raise = (y: number) => {
      if (!pinEl || y === lifted) return;
      lifted = y;
      pinEl.style.transform = y ? `translate3d(0, ${y.toFixed(2)}px, 0)` : "";
    };

    // The shape of the sweep: an ease-in-out on progress, defined by its *rate*
    // rather than by a curve picked for its formula.
    //
    // The problem it solves is the handoff, not the middle. Linear, the reader
    // is scrolling the page down at some speed, the section reaches the top,
    // and in one frame all of that speed becomes sideways travel — then at the
    // far end the line stops dead and the page resumes. Two hard cuts between
    // two kinds of motion, and both read as the page catching on something.
    //
    // So the rate ramps from a standstill over the first `RAMP` of the pin,
    // runs flat through the middle, and ramps back to a standstill over the
    // last `RAMP` — the ramps being smoothstep, so the *acceleration* is
    // continuous too and the ramp itself does not start with a jolt. `shape` is
    // that rate integrated, which is why it is a quartic rather than the usual
    // cubic.
    //
    // Straight smoothstep across the whole range is the textbook answer here
    // and was tried first. It ramps for the entire sweep, so the middle has to
    // run at 1.5× to make the distance back up and the line visibly outruns the
    // scrollbar there. Confining the ramps to a fifth of the range each buys the
    // same standstill at both ends for a middle at 1.28×, which does not read as
    // a sprint.
    //
    // Both ends are exact by construction, which is the constraint that
    // outranks the feel: `ramp(0)` is 0, so `shape(0)` is 0, and `shape(1)` is
    // written as `1 − v·a·ramp(0)`, so it is exactly 1 — not a curve that
    // approaches 1 and leaves the last stop a few pixels offscreen forever.
    const RAMP = 0.22;

    // The integral of smoothstep over [0, 1], normalised to reach 1/2 — which
    // is the area under a rate that starts at 0 and ends at 1.
    const ramp = (u: number) => u * u * u - (u * u * u * u) / 2;

    const shape = (t: number) => {
      const v = 1 / (1 - RAMP); // flat-middle rate, set so the whole sweep is 1
      if (t <= RAMP) return v * RAMP * ramp(t / RAMP);
      if (t >= 1 - RAMP) return 1 - v * RAMP * ramp((1 - t) / RAMP);
      return v * (t - RAMP / 2);
    };

    // ---- the vertical hand-off ----
    //
    // Everything above shapes the *sideways* travel. None of it touches the
    // thing the reader actually complains about, which is their own scroll:
    // one pixel before the frame sticks the page is moving up at 1:1, one
    // pixel after it is not moving at all, and at the far end it goes back to
    // 1:1 just as abruptly. Two discontinuities in the page's vertical speed,
    // and no amount of easing on the track can hide them because the track is
    // not the thing that stopped.
    //
    // A stuck box cannot be made to stick gradually — `position: sticky` is a
    // predicate, not a dial. But the frame can be *translated*, and a
    // translation over scroll is a speed. So the page's apparent vertical
    // speed is ours to write, on both sides of the boundary, and what it is
    // written as is a single smoothstep: `runway` pixels of scroll over which
    // the page goes from 1:1 to a standstill, and another over which it comes
    // back.
    //
    // The one decision that matters is *where that runway sits*. Putting it
    // wholly inside the pin — the obvious reading of "ease the pin" — is what
    // a first pass did, and it does not scale. All the deceleration happens
    // while the frame is stuck, so every pixel of it comes out of the frame's
    // own slack: a runway of R costs R/2 of drift, the drift is where the
    // content sits for the whole middle of the pin, and the frame only has
    // ~240px of room above its contents at 1440×900. That caps the runway at
    // about 380px however it is written, and leaves the timeline parked hard
    // against the top of the screen when it gets there.
    //
    // Centring the runway on the boundary instead costs almost nothing. Half
    // of it is spent *before* the frame sticks, where the frame is still free
    // and the translate only has to slow it down rather than carry all of it;
    // half after, where the translate hands the remainder back. The frame is
    // stuck for the fast half of neither curve, so the peak offset collapses
    // from R/2 to `ramp(1/2)` = 3/32 of R — a thirteenth of what it was — and
    // the offset is exactly 0 through the whole middle of the pin, so the
    // timeline sits dead centre while the line sweeps instead of parked high.
    // That is what buys a runway four times longer out of *less* drift than
    // before.
    //
    // The bookkeeping, with `s` measured from the pixel the frame sticks and
    // `u` running 0 → 1 across a runway centred on that pixel:
    //
    //   apparent speed   −(1 − smoothstep(u))   entering, both halves
    //   frame offset     +runway · ramp(u)      u < 1/2, frame still free
    //                    +runway · (1/2 − glide(u))   u ≥ 1/2, frame stuck
    //
    // `glide` is the integral of `1 − smoothstep`, so `glide(0) = 0`,
    // `glide′(0) = 1` (the runway starts at exactly the speed the page already
    // had), `glide′(1) = 0` (it arrives at a standstill rather than being cut
    // off at one) and `glide(1) = 1/2`. That last figure is the invariant the
    // whole thing rests on: half a runway is exactly the distance a page
    // decelerating from 1:1 covers, which is why the offset lands on exactly 0
    // at the far end of each runway and exactly 0 through the hold — three
    // anchors, none of them approached, all of them assigned. `ramp` is
    // `u − glide(u)`, which is the same integral read from the other side, and
    // is the identity that makes the two halves meet without a seam at 3/32.
    const glide = (u: number) => u - ramp(u);

    // The peak offset, as a share of the runway: `ramp(1/2)`, exactly 3/32.
    const PEAK = 3 / 32;

    // `s` is how far the scroll has run into the section: 0 when the frame
    // sticks, `travel` when it lets go. One runway is centred on each of those
    // two pixels; everywhere else — including the whole middle of the pin —
    // there is no offset at all.
    const lift = (s: number, travel: number) => {
      if (runway <= 0) return 0;
      const half = runway / 2;

      // Coming in. Below −half the page has not been touched yet; above
      // +half the frame is stuck and square in its box.
      if (s < half) {
        if (s <= -half) return 0;
        const u = (s + half) / runway;
        return s < 0 ? runway * ramp(u) : runway * (0.5 - glide(u));
      }

      // Going out: the same curve, mirrored, centred on the release.
      const u = (s - travel + half) / runway;
      if (u <= 0 || u >= 1) return 0;
      return s < travel ? -runway * ramp(u) : runway * (u - 0.5 - ramp(u));
    };

    // ---- the approach ----
    //
    // The sweep does not wait for the pin. `progress` used to be defined only
    // on the pinned window, `s` in `[0, travel]`, which meant the line sat
    // dead still through the whole of the section's climb up the screen and
    // then began the instant the frame locked. Nothing about that is a
    // *jump* — `shape` starts from a standstill, so the first pixel of the pin
    // is as gentle as it can be — but it is a coincidence the reader can see:
    // one motion stops, in the same frame another starts, and the two events
    // are the same event. The line reads as something the pin switched on.
    //
    // So the domain is widened in front of the pin. `lead` is how far above
    // the viewport's top edge the section's own top edge can be and still be
    // sweeping — scroll the reader was doing anyway, in ordinary page space,
    // spent on the same curve. Nothing is added to the section's height for
    // it: `--tl-pin` still buys exactly the pinned window, and `travel` is
    // still read out of layout the same way. What changed is only how much of
    // the sweep is left to spend inside it.
    //
    // Not a piece bolted in front of the old one. `shape` is untouched and is
    // still the whole of the curve — it is handed a `t` measured over
    // `lead + travel` instead of over `travel`, so there is no seam at
    // `rect.top === 0` to make continuous: the value and every derivative
    // cross that point as smoothly as they cross any other, because it is not
    // a point the curve knows about. `lift`, `runway` and the vertical
    // hand-off are given `s` and `travel` exactly as before and do not move.
    //
    // Two ceilings on `lead`:
    //
    //   half the pin — so the pin still has most of the sweep left to do. At
    //                  this cap a third of the *scroll* and, through `shape`,
    //                  28.6% of the *travel* is spent before the frame locks,
    //                  which is enough that the line is plainly already
    //                  running and not so much that arriving at the pin is an
    //                  anticlimax. Both figures are ratios and neither moves
    //                  with the layout: `lead/span` is 0.5/1.5 whenever this
    //                  is the cap that binds, whatever the pin measures. It is
    //                  the one that binds at every desktop window of ordinary
    //                  height; see the note under the guard for where it stops
    //                  being.
    //   a screen     — the guard. "About when the section comes into view"
    //                  means `rect.top === innerHeight`, and starting earlier
    //                  than that is starting on a section the reader cannot
    //                  see. It bites on a sweep longer than two screens, which
    //                  the pin now is on a short window: 1497px of pin at
    //                  1440 wide wants a 748px lead and a 700px-tall window
    //                  gives it 700. That is a recent change and it is the
    //                  lead-in that caused it — starting the line on the
    //                  centre of the screen rather than a third of the way
    //                  across added ~240px to the track's width, and the pin
    //                  is measured from that width. Nothing about the feel
    //                  turns on it: at the crossover the two ceilings are
    //                  within a few per cent of each other, and past it the
    //                  guard is doing exactly what it was written to do.
    //
    // What "a longer ease-in" buys, in figures, at 1440×900 (travel 1497):
    // `lead` is 748px, the sweep runs over 2245px of scroll instead of 1497,
    // and `shape`'s ramp-in — the quartic, rate and acceleration both zero at
    // its start — now occupies 494px of that instead of 329. All 494 of them
    // fall before the pin, and the frame does not lock for another 254. Over
    // the first 100px of the approach the track moves about 3px; over the
    // first 200, about 22. It is deliberately beneath notice at the start and
    // plainly running by the time the frame takes hold.
    //
    // Those pixel figures are the layout's, not the curve's, and they moved
    // when the lead-in did — a longer track is a longer sweep over a longer
    // scroll, so the same fraction of it buys more scroll and less travel per
    // pixel. Everything the curve is judged on is unchanged: the ramp is
    // still `RAMP` of the sweep, still entirely inside the approach, and the
    // 28.6% above is still 28.6%.
    const LEAD_SHARE = 0.5;

    // Where the scroll says the track and the frame should be, in pixels.
    const wanted = () => {
      const rect = sectionEl.getBoundingClientRect();
      // The section is one screen plus the overflow, so this is the overflow
      // again — read from layout rather than assumed, since `100svh` and
      // `innerHeight` can disagree while a mobile toolbar is retracting.
      const travel = rect.height - window.innerHeight;
      const s = -rect.top;
      const lead = Math.min(window.innerHeight, travel * LEAD_SHARE);
      // The sweep's whole domain: the approach in front of the pin and the
      // pin itself. `s + lead` is 0 where the approach begins and `span` where
      // the frame lets go, so `shape(1)` — which is exactly 1 by construction
      // — still lands the track on exactly `-overflow` at the release.
      const span = travel + lead;
      const progress =
        span <= 0 ? 0 : Math.min(1, Math.max(0, (s + lead) / span));
      return { x: -(shape(progress) * overflow), y: lift(s, travel) };
    };

    // The chase. Each frame closes a fixed *share* of the remaining distance,
    // which is an exponential approach: quick while the gap is wide, gentle as
    // it closes, and never overshooting. `SETTLE` is that share per 60Hz frame
    // and is raised to `dt / 16.667` so a 120Hz display closes the same gap in
    // the same milliseconds rather than twice as fast; `dt` is capped because a
    // backgrounded tab hands back a gap of seconds and the track should return
    // to where the scroll left it, not ease there from wherever it was.
    //
    // An exponential approach never actually arrives, which on a scrollbar at
    // rest is a track still creeping a hundredth of a pixel a frame forever —
    // and, worse, a last stop left forever short of the clamp. `EPSILON` is the
    // distance at which it stops pretending: inside a quarter pixel the
    // remainder is assigned rather than approached, the frame loop is not
    // renewed, and the position is exactly what `wanted()` returned. That is
    // what makes 0 at the start and full travel at the end exact figures.
    const SETTLE = 0.2;
    const EPSILON = 0.25;

    const draw = (now: number) => {
      frame = 0;
      if (!overflow) return;
      const dt = Math.min(50, Math.max(1, now - last));
      last = now;

      const { x: target, y } = wanted();
      // The frame's offset is assigned, never chased. It is a pure function of
      // the scroll position, so it is exactly 0 on both the pixel the pin takes
      // hold and the pixel the runway ends — and chasing it would put lag into
      // the one motion whose entire job is to match the reader's gesture.
      raise(y);
      const gap = target - at;
      if (Math.abs(gap) <= EPSILON) {
        // Settled: land on the target exactly and let the loop die.
        at = target;
        paint(at);
        return;
      }
      at += gap * (1 - (1 - SETTLE) ** (dt / 16.667));
      paint(at);
      frame = requestAnimationFrame(draw);
    };

    // Scroll only ever wakes the loop; it never paints. If a frame is already
    // pending the chase is running and will read the newest scroll position
    // itself, which is why one handle is enough for both jobs.
    const schedule = () => {
      if (!frame) {
        last = performance.now();
        frame = requestAnimationFrame(draw);
      }
    };

    const measure = () => {
      if (!wide.matches || still.matches) return unpin();

      // Where the line starts. Untouched, the track's first tick sits on the
      // scrollport's left edge — a hand's width from the edge of the screen —
      // so the first pixel of the pin immediately takes "NOW" off toward it,
      // and the stop the section opens on is the one stop the reader never
      // gets to see cross the screen. Leading the track in by the distance
      // from the port's edge to the middle of the viewport starts it there
      // instead, and gives the first stop a whole half-screen to cross before
      // it leaves.
      //
      // The middle rather than a third, which is where this started. A third
      // was argued for on the grounds that the half-screen to its right is
      // spent on empty track — true, and it is the wrong thing to be counting.
      // What the reader is being shown at `progress = 0` is one stop and the
      // word NOW, and a stop that opens at a third has already used two thirds
      // of its run before the sweep has moved a pixel. Opening on the centre
      // line is what makes "NOW" read as the present rather than as something
      // already on its way out, and the empty half is not empty for long: it
      // is the runway the first stop is about to travel, and it is filled by
      // the second stop arriving behind it.
      //
      // Padding rather than a starting translate, because padding is a
      // *layout* figure and the translate is not: it lands in `scrollWidth`,
      // which is where `overflow` below comes from, so the pin lengthens by
      // exactly the lead and every other number in this hook stays as written.
      // A point that sat at track-relative `x` now sits at `lead + x`, and at
      // the far end the translate is `-(overflow + lead)`, so it lands on
      // `x - overflow` — where it landed before. The end of the sweep is
      // untouched; only the start moved, and the scroll got longer to pay for
      // it. The rate is untouched too: the sideways distance and the vertical
      // distance both grow by `lead`, and `shape` is defined on the ratio.
      //
      // Whether there is a pin at all is still judged on the track's own
      // width, with the lead-in taken back off first: on a screen wide enough
      // to hold all five stops there is nothing to sweep, and a lead-in would
      // otherwise manufacture a pin whose only content is itself.
      //
      // `scrollWidth` and `clientWidth` are layout figures and are not moved by
      // the transform already on the track, so the measurement does not have to
      // undo its own effect first.
      trackEl.style.removeProperty("--tl-lead-start");
      if (trackEl.scrollWidth <= portEl.clientWidth) return unpin();

      // Clamped at 0 for a port whose left edge is already past the middle of
      // the screen the line is meant to start on. Read from layout rather than
      // derived, so whatever the box model does with padding on a `max-content`
      // box is measured and not assumed.
      const lead = Math.max(
        0,
        Math.round(window.innerWidth / 2 - portEl.getBoundingClientRect().left),
      );
      trackEl.style.setProperty("--tl-lead-start", `${lead}px`);

      const next = Math.max(
        0,
        Math.round(trackEl.scrollWidth - portEl.clientWidth),
      );
      if (!next) return unpin();
      overflow = next;
      sectionEl.style.setProperty("--tl-pin", `${next}px`);
      sectionEl.setAttribute("data-pinned", "true");

      // How long each hand-off runway gets, held down by three ceilings, all
      // three re-derived for a runway that straddles its boundary rather than
      // sitting inside the pin.
      //
      // Collision. Only the *inner* half of each runway is inside the pin, at
      // `[0, runway/2]` and `[travel − runway/2, travel]`, so they meet at
      // `runway = travel` — twice the room the wholly-inside version had. The
      // 0.95 is what keeps a hold in the middle rather than a point; even at
      // exactly 1 the two curves would meet at 0 offset and 0 speed and join
      // cleanly, so this is margin, not a load-bearing limit.
      //
      // Approach. The outer half runs *before* the frame sticks, so it must
      // fit in the screen the section is climbing: at `runway = innerHeight`
      // the page starts slowing when the section's top edge is halfway up the
      // viewport, which is as early as this should ever begin.
      //
      // Slack. The peak offset is `PEAK` of the runway, not half of it, and it
      // is symmetric — the frame dips that far *down* on the way in and that
      // far *up* on the way out — so the ceiling is the smaller of the two
      // equal gaps around the centred content, with a tenth held back so the
      // heading never runs up against the edge of the frame. At 3/32 this
      // works out at nearly ten runways per unit of slack, and it stops being
      // the binding constraint at every desktop size the page sees, which is
      // the whole point of moving the runway.
      const inner = pinEl?.firstElementChild;
      const room = inner
        ? Math.max(
            0,
            (pinEl!.clientHeight - inner.getBoundingClientRect().height) / 2,
          )
        : 0;
      runway = pinEl
        ? Math.round(
            Math.min(next * 0.95, window.innerHeight, (room * 0.9) / PEAK),
          )
        : 0;

      // A cut, not a chase. Measuring happens on mount, on resize and when the
      // track reflows — none of which is motion the reader performed, and all
      // of which would otherwise slide the line from a position that is no
      // longer where anything is.
      const now = wanted();
      at = now.x;
      raise(now.y);
      paint(at);
    };

    measure();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    wide.addEventListener("change", measure);
    still.addEventListener("change", measure);

    // The listener covers the viewport changing; the observer covers the track
    // changing under it — a web font landing, or the copy reflowing — which
    // resizes nothing else and would otherwise leave the pin travelling the
    // wrong distance for the rest of the session.
    const ro =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(measure);
    ro?.observe(portEl);
    ro?.observe(trackEl);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      wide.removeEventListener("change", measure);
      still.removeEventListener("change", measure);
      ro?.disconnect();
      unpin();
    };
  }, []);

  return { section, port, track };
}

/**
 * One small tile on the sponsor wall — hardware partners, media partners and
 * sponsors all wear it, which is why it is a component rather than three
 * copies of the same map body.
 *
 * The whole tile is the link, and `aria-label` names the organisation so the
 * accessible name is not the alt text of the mark inside it. Marks are served
 * as-authored: running a partner's logo through the image optimizer would
 * re-encode it, which their brand terms do not allow.
 *
 * There is no `src`-less branch any more — see the note on `Partner` for why
 * that is a decision and not an oversight. There *is* an `href`-less one, for
 * the opposite reason given in the same note: that tile is a div, so a reader
 * is never handed a target that goes nowhere, and it drops out of the tab
 * order because there is nothing on it to activate.
 *
 * `wordmark` is for the partners whose published mark is a bare icon with
 * no name in it: the word is set live under the icon instead, in the partner's
 * own face, so the pair reads as the lockup the others ship as a single file.
 * It is `aria-hidden`, and the `img` loses its alt text in the same branch —
 * the anchor's `aria-label` already names the organisation, and two more
 * copies of "GHOST" inside it would be two more chances for a reader to say
 * it. The alt is empty rather than absent, which is how you say "this image
 * adds nothing the name has not already said".
 *
 * That trade only works while there is an anchor holding the name. On the
 * link-less tile the `alt` is the only place the organisation is named — the
 * visible word is `aria-hidden` and a bare `aria-label` on a div is a label on
 * nothing — so the mark keeps its alt there and the `title` gives a pointer
 * the same string.
 */
function SponsorTile({ partner }: { partner: Partner }) {
  const named = Boolean(partner.href) && Boolean(partner.wordmark);

  const logo = (
    <img
      alt={named ? "" : partner.name}
      className={`hw26-sponsor-logo${partner.mark ? ` ${partner.mark}` : ""}`}
      src={partner.src}
    />
  );

  const inside = partner.wordmark ? (
    <span
      className={`hw26-sponsor-lockup${partner.lockup ? ` ${partner.lockup}` : ""}`}
    >
      {logo}
      <span aria-hidden="true" className="hw26-sponsor-wordmark">
        {partner.wordmark}
      </span>
    </span>
  ) : (
    logo
  );

  if (!partner.href) {
    return (
      <div className="hw26-sponsor hw26-sponsor--static" title={partner.name}>
        {inside}
      </div>
    );
  }

  return (
    <a
      aria-label={partner.name}
      className="hw26-sponsor"
      href={partner.href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {inside}
    </a>
  );
}

function LeadPartnerTile({ partner }: { partner: Partner }) {
  return (
    <a
      aria-label={partner.name}
      className="hw26-sponsor-lead"
      href={partner.href}
      rel="noopener noreferrer"
      target="_blank"
    >
      <img alt={partner.name} className={partner.mark} src={partner.src} />
    </a>
  );
}

function PartnerSubhead({
  action,
  reveal = false,
  title,
}: {
  action?: "partner" | "sponsor";
  reveal?: boolean;
  title: string;
}) {
  return (
    <div
      className={`hw26-partner-subhead${reveal ? " hw26-reveal" : ""}`}
    >
      <h3 className="hw26-cat hw26-partner-cat">
        <span aria-hidden="true" className="hw26-cat-mark">
          ///
        </span>{" "}
        {title}
      </h3>
      {action ? (
        <a
          className="hw26-sponsor-cta"
          href={
            action === "sponsor"
              ? "/sponsor"
              : "/partner"
          }
        >
          Become a {action} →
        </a>
      ) : null}
    </div>
  );
}

function PartnerTierSubhead({
  reveal = false,
  title,
}: {
  reveal?: boolean;
  title: string;
}) {
  return (
    <div className={`hw26-subhead${reveal ? " hw26-reveal" : ""}`}>
      <span className="hw26-label hw26-label--mint">{title}</span>
      <span aria-hidden="true" className="hw26-poweredby-rule" />
    </div>
  );
}

/** The complete partner wall, reused by the dedicated Partners page. */
export function PartnerDirectory() {
  const ecosystem = useShuffled(SMALL_SPONSORS);
  const hardware = useShuffled(HARDWARE_PARTNERS);

  return (
    <section className="hw26-section">
      <div aria-hidden="true" className="hw26-grid" />
      <div className="hw26-inner">
        <div className="hw26-head">
          <h2>Partners &amp; Organizers</h2>
        </div>

        <PartnerSubhead action="sponsor" title="Sponsors" />
        <div className="hw26-sponsors-lead hw26-sponsors-lead--one">
          {SPONSORS.map((partner) => (
            <LeadPartnerTile key={partner.name} partner={partner} />
          ))}
        </div>

        <div className="hw26-partner-family">
          <PartnerSubhead action="partner" title="Partners" />

          <PartnerTierSubhead title="Ecosystem Partners" />
          <div className="hw26-sponsors-lead hw26-sponsors-lead--eco">
            {[LEAD_SPONSORS[0], LEAD_SPONSORS[1], ...ecosystem].map(
              (partner) => (
                <LeadPartnerTile key={partner.name} partner={partner} />
              ),
            )}
          </div>

          <PartnerTierSubhead title="Hardware Partners" />
          <div className="hw26-sponsors-rest">
            {hardware.map((partner) => (
              <SponsorTile key={partner.name} partner={partner} />
            ))}
          </div>

          <PartnerTierSubhead title="Media Partners" />
          <div className="hw26-sponsors-lead hw26-sponsors-lead--one">
            {MEDIA_PARTNERS.map((partner) => (
              <LeadPartnerTile key={partner.name} partner={partner} />
            ))}
          </div>

          <PartnerTierSubhead title="Prize Partners" />
          <div className="hw26-sponsors-lead hw26-sponsors-lead--one">
            {PRIZE_PARTNERS.map((partner) => (
              <LeadPartnerTile key={partner.name} partner={partner} />
            ))}
          </div>
        </div>

        <PartnerSubhead title="Organizers" />
        <div className="hw26-sponsors-lead">
          {ORGANIZERS.map((organizer) => (
            <a
              aria-label={organizer.name}
              className="hw26-sponsor-lead"
              href={organizer.href}
              key={organizer.name}
              rel="noopener noreferrer"
              target="_blank"
            >
              <img
                alt={organizer.name}
                className={`hw26-org-logo${organizer.mark ? ` ${organizer.mark}` : ""}`}
                src={organizer.src}
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * The FAQ, as one plate with nine rows in it.
 *
 * One open at a time. A multi-open accordion is the right call when the panels
 * are things a reader compares against each other — two specs side by side —
 * and these are not: they are nine unrelated answers, and a reader who has
 * opened four of them has a page that scrolls like an article and no longer
 * shows the list of questions the section exists to present. Single-open keeps
 * the whole list on screen at every step, which is the thing an FAQ is for,
 * and it is what the pattern does by default everywhere else. Closing the open
 * row by pressing it again is kept — a section with no way back to "all shut"
 * is a section that grows by one answer and never shrinks.
 *
 * State is the open index or null, not a flag per row, because "at most one"
 * is then a fact about the shape of the state rather than a rule some future
 * handler has to remember to enforce.
 *
 * The control is a real `button` inside the heading: it is what the platform
 * gives focus, keyboard activation on both Enter and Space, and a role that
 * says "this does something" — none of which a `div` with a click handler has,
 * and all of which would otherwise have to be rebuilt by hand and got right.
 * `aria-expanded` is the state, `aria-controls` names the panel it opens, and
 * the panel points back at its button so a reader who lands inside an answer
 * is told which question it answers.
 *
 * The panel is never removed from the tree and never carries `hidden` —
 * it is collapsed in the stylesheet by a grid row going 0fr → 1fr, which is
 * the one way to animate to a height nobody has measured. What keeps a
 * collapsed answer out of the reading order and its link out of the tab order
 * is `visibility: hidden` on the same rule; see the note there.
 */
function Faq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="hw26-faq hw26-reveal">
      {/* The fill, one edge-width inside the outline and in the same chamfered
          shape — the panel technique from the inventory cells, with the fill
          on a real element rather than on a pseudo one because this one has
          the rows in it and they have to be clipped by it. */}
      <div className="hw26-faq-list">
        {FAQ.map((item, i) => {
          const isOpen = open === i;
          const panelId = `hw26-faq-panel-${i}`;
          const labelId = `hw26-faq-q-${i}`;

          return (
            <div
              className={`hw26-faq-row${isOpen ? " hw26-faq-row--open" : ""}`}
              key={item.q}
            >
              <h3 className="hw26-faq-heading">
                <button
                  aria-controls={panelId}
                  aria-expanded={isOpen}
                  className="hw26-faq-trigger"
                  id={labelId}
                  onClick={() => setOpen(isOpen ? null : i)}
                  type="button"
                >
                  <span className="hw26-faq-q">{item.q}</span>
                  {/* Two hairlines crossed. The upright one turns flat as the
                      row opens, so the mark goes from plus to minus by
                      travelling rather than by being swapped. */}
                  <span aria-hidden="true" className="hw26-faq-sign" />
                </button>
              </h3>

              <div
                aria-labelledby={labelId}
                className="hw26-faq-panel"
                id={panelId}
                role="region"
              >
                <div className="hw26-faq-panel-in">
                  <p className="hw26-faq-a">{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * One cell on the floor, used by both the categories and the add-ons.
 *
 * Shared because the two sections are the same object twice — a chamfered
 * panel with a count, a name and sometimes a caption — and since the add-ons
 * took group titles of their own, they are the same object at the same depth
 * too: a group title is the `h3` in both sections and the entry name is the
 * `h4` under it. The `headingLevel` prop that carried that difference is gone
 * with the difference; a level nobody varies is a level the markup can state.
 *
 * `order` is only the stagger. Cells fade in a row at a time and 90ms apart,
 * which is the same figure the about cells use.
 *
 * It is handed over as a custom property rather than as `transitionDelay`,
 * and the difference is not cosmetic: an inline longhand applies to every
 * transition the element has, so while this was `transitionDelay` the cell's
 * own hover — the mint ring — inherited the stagger and a cell four along in
 * its row lit up 270ms after the pointer reached it. `--reveal-delay` is
 * spent by name, in the two places `.hw26-reveal` spends it, and nothing else
 * on the cell is delayed by where it happens to sit in a row.
 */
function RigCell({ item, order }: { item: Rig; order: number }) {
  return (
    <div
      className={`hw26-rig-shell${item.dropShadow ? " hw26-rig-shell--accent" : ""}`}
    >
      <article
        className={`hw26-rig hw26-rig--compact${item.unannounced ? " hw26-rig--tba" : ""}${item.blurPhoto ? " hw26-rig--blur" : ""}${item.dropShadow ? " hw26-rig--accent" : ""} hw26-reveal`}
        style={{ "--reveal-delay": `${order * 90}ms` } as CSSProperties}
      >
      {/* Ground, not a product shot — see the note on RIG_GROUPS. Empty
          `alt` because a render that is 16% of a greyscale backdrop is
          texture rather than something anyone is being shown; the name below
          it is what identifies the machine. */}
      {item.photo ? (
        <div className="hw26-rig-photo">
          <Image
            alt=""
            fill
            sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 33vw"
            src={item.photo}
          />
        </div>
      ) : null}

      {/* The display figure is what there is: six manipulators, three robo
          fish, two of the big arms.

          On a placeholder the same element holds a "?" instead, in the same
          cut — and the stylesheet moves it out of the corner and blows it up
          into the cell's ground, because on a cell with no plate and no
          number the glyph is the picture rather than a figure in the margin.
          Either way it is a shape standing in for a number rather than a
          number, so `unannounced` takes it out of the accessibility tree and
          the marker below carries the meaning instead. */}
      {item.units ? (
        <div aria-hidden={item.unannounced} className="hw26-rig-no">
          {item.units}
        </div>
      ) : null}

      {/* The supplier's mark, in the corner opposite the count — see the
          placement note on `.hw26-rig-credit`. A real `alt` rather than an
          empty one: unlike the plate behind the copy, this is not texture,
          it is the only place on the page that says where these parts come
          from, and a reader who cannot see the lockup would otherwise get a
          cell that is silently missing a fact the sighted one has. */}
      {item.credit ? (
        <img
          alt={item.credit.label}
          className="hw26-rig-credit"
          src={item.credit.src}
        />
      ) : null}

      {/* The only status left, and on every cell that carries it the cell is
          a placeholder outright — the line is the whole of its content. It is
          written off `tba` rather than off `unannounced` because the two are
          not the same claim: this one says nothing here is settled yet, and
          it would still be the right line on a named machine whose model is
          open. See the note on RIG_GROUPS. */}
      {item.tba ? (
        <span className="hw26-label hw26-rig-units">To be announced</span>
      ) : null}

      <h4 className="hw26-rig-name">{item.name}</h4>

        {item.note ? <p className="hw26-rig-note">{item.note}</p> : null}
      </article>
    </div>
  );
}

/**
 * The units of the hero countdown, largest first. Kept as data so the markup
 * is one loop and the placeholder and the live readout cannot drift out of
 * step with each other.
 */
const COUNTDOWN_UNITS = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hrs" },
  { key: "minutes", label: "Min" },
  { key: "seconds", label: "Sec" },
] as const;

/**
 * Whole days/hours/minutes/seconds left until `target`, clamped at zero: once
 * the doors open the panel should read all zeros rather than start counting
 * up in negatives, which is what a bare subtraction would do the moment the
 * event starts.
 */
function untilParts(target: Date, now: number) {
  const total = Math.max(0, Math.floor((target.getTime() - now) / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor(total / 3600) % 24,
    minutes: Math.floor(total / 60) % 60,
    seconds: total % 60,
  };
}

/** Two digits minimum, so the numerals never reflow as they tick down. */
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The countdown to the first morning.
 *
 * A clock is the one thing on this page that is guaranteed to render
 * differently on the server than in the browser — same trap as the ICU month
 * names below, but unavoidable rather than a formatting choice. So the server
 * renders a fixed placeholder and `now` stays null until the first effect
 * runs; the initial client render matches the HTML exactly, and the real
 * figures arrive one frame later.
 *
 * The interval is cleared on unmount, which also covers the theme toggle
 * remounting the tree in development.
 */
function Countdown({ target }: { target: Date }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const parts = now === null ? null : untilParts(target, now);

  return (
    <div className="hw26-count">
      {COUNTDOWN_UNITS.map((unit) => (
        <div className="hw26-count-cell" key={unit.key}>
          {/* Dashes, not zeros, for the pre-hydration frame: a zero would
              claim the event had already started for the split second before
              the clock takes over. En dashes rather than the em dashes this
              used to be — an em dash is a full em, so the pair was half
              again as wide as two digits and the panel visibly snapped
              narrower the moment the clock took over. */}
          <span className="hw26-count-n">
            {parts ? pad(parts[unit.key]) : "––"}
          </span>
          <span className="hw26-label hw26-count-u">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * The alphabet the rain is drawn from. Digits, capitals with I, O and Q left
 * out, and a handful of operators — the ambiguous letters go because at 13px a
 * column of them reads as a word half-forming, and the point of the field is
 * that it is output rather than language.
 */
const RAIN_GLYPHS = "0123456789ABCDEFGHJKLMNPRSTUVWXYZ+-=/\\|<>#·×";

type RainColumn = {
  x: number;
  head: number; // row index of the leading glyph, fractional
  speed: number; // rows per second
  tail: number; // rows of fading trail behind the head
  cells: string[]; // glyph per row index, so a character stays put as the trail passes over it
};

/**
 * The end plate, as its own component because a second page renders it.
 *
 * A pure extraction and nothing else: the markup below is the footer the
 * lander carried inline, moved rather than rewritten, so the two pages cannot
 * drift into two footers. It stays in this file because everything it reads
 * is here — `TITLE_BLOCK` above it, the `hw26-endplate` block in lander.css —
 * and a footer in a file of its own would be one import chasing another for
 * no gain.
 *
 * Three of the cells come off the event row rather than out of `TITLE_BLOCK`:
 * seats, team max and the location are facts about this hackathon and not
 * about the drawing, which is why the block is a const and these are props.
 */
export function Endplate({ hackathon }: { hackathon: HardwareEvent }) {
  return (
    <footer className="hw26-endplate">
      <div aria-hidden="true" className="hw26-endplate-hazard" />
      <p aria-hidden="true" className="hw26-endplate-bleed">
        2026
      </p>

      <div className="hw26-endplate-body">
        <div className="hw26-endplate-top">
          <p className="hw26-endplate-mark">
            Alien Bazaar
            <br />
            <em>Warsaw 26</em>
          </p>
          {/* The stamp used to read "Registration open", which stopped
              being true the moment registration got an opening date of its
              own: for now it is not open, it is announced. Both dates on
              the stamp rather than one, because the window is the fact. */}
          <div className="hw26-stamp">
            Registration
            <span>01 SEP — 15 SEP 2026</span>
          </div>
        </div>

        <dl className="hw26-titleblock">
          {TITLE_BLOCK.map((cell) => (
            <div
              className={`hw26-tb${cell.tone ? ` hw26-tb--${cell.tone}` : ""}`}
              key={cell.k}
            >
              <dt>{cell.k}</dt>
              <dd>{cell.v}</dd>
            </div>
          ))}
          <div className="hw26-tb hw26-tb--gate">
            <dt>Applications close</dt>
            <dd>15 SEP 2026</dd>
          </div>
          <div className="hw26-tb">
            <dt>Seats</dt>
            <dd>{hackathon.capacity ?? "—"}</dd>
          </div>
          <div className="hw26-tb">
            <dt>Team max</dt>
            <dd>{hackathon.maxTeamSize}</dd>
          </div>
        </dl>
      </div>

      <div className="hw26-endplate-foot">
        <span className="hw26-label">
          {hackathon.location ?? "Warsaw, Poland"}
        </span>
        <a
          className="hw26-support-link"
          href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Alien Bazaar support")}`}
        >
          <span>Support</span> {SUPPORT_EMAIL}
        </a>
        <div aria-hidden="true" className="hw26-ticks">
          {Array.from({ length: 24 }, (_, i) => (
            <i key={`tick-${i}`} />
          ))}
        </div>
        <span className="hw26-label">Epikor × Hacklab · AB—WAW—26</span>
      </div>
    </footer>
  );
}

function SiteMenu() {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstLink.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        requestAnimationFrame(() => trigger.current?.focus());
        return;
      }

      if (event.key !== "Tab") return;
      const overlay = document.getElementById("hw26-site-menu");
      const focusable = Array.from(
        overlay?.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled])",
        ) ?? [],
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <button
        aria-controls="hw26-site-menu"
        aria-expanded={open}
        aria-label={open ? "Close navigation" : "Open navigation"}
        className={`hw26-menu-trigger${open ? " hw26-menu-trigger--open" : ""}`}
        onClick={() => setOpen((value) => !value)}
        ref={trigger}
        type="button"
      >
        <span />
        <span />
        <span />
      </button>

      {open ? (
        <div
          aria-label="Site navigation"
          aria-modal="true"
          className="hw26-menu-overlay"
          id="hw26-site-menu"
          role="dialog"
        >
          <div aria-hidden="true" className="hw26-menu-grid" />
          <div className="hw26-menu-shell">
            <div className="hw26-menu-main">
              <nav className="hw26-menu-links">
                <Link href="/#home" onClick={close} ref={firstLink}>
                  <span>01</span> Home
                </Link>
                <Link href="/#hardware" onClick={close}>
                  <span>02</span> Hardware
                </Link>
                <Link href="/#timeline" onClick={close}>
                  <span>03</span> Timeline
                </Link>
                <Link href="/#faq" onClick={close}>
                  <span>04</span> FAQ
                </Link>
                <Link href="/partners" onClick={close}>
                  <span>05</span> Partners
                </Link>
                <Link href="/team" onClick={close}>
                  <span>06</span> Team
                </Link>
              </nav>
            </div>

            <div className="hw26-menu-actions">
              <a
                className="hw26-menu-action hw26-menu-action--primary"
                href={JOIN_URL}
              >
                Apply now <span aria-hidden="true">→</span>
              </a>
              <a
                className="hw26-menu-action"
                href="/sponsor"
              >
                Become a sponsor <span aria-hidden="true">→</span>
              </a>
              <a
                className="hw26-menu-action"
                href="/partner"
              >
                Become a partner <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

/**
 * Digital rain behind the brief.
 *
 * Hand-rolled on a canvas rather than taken as a dependency: the whole of it is
 * a list of columns, a head position and a trail length, and the two decisions
 * that matter here are exactly the ones a library would have made for me.
 *
 * The first is that the canvas stays genuinely transparent. The textbook
 * version of this effect clears each frame by filling the whole canvas with
 * translucent black, which is what gives the trails their fade for nothing —
 * but it also lays a near-black slab across everything behind it, and behind
 * this canvas is the page's own field, which has to keep showing through. So
 * the frame is cleared outright and the fade is computed per glyph instead:
 * alpha falls off as the square of the distance from the head, which is under
 * a percent by the far end of the trail, so a trail ends rather than stops.
 *
 * The second is the direction of travel. A column that runs off the bottom
 * re-enters from above the top edge rather than wrapping in place, and the
 * stylesheet fades the canvas out downward. Between them the rain reads as
 * spilling from behind the ticker and dying before it reaches the copy, rather
 * than as a texture the section happens to be sitting on — see `.hw26-rain`.
 *
 * Nothing here runs during render, and nothing random is read during render:
 * the canvas is empty markup on the server and stays empty until an effect
 * touches it, so there is no hydration mismatch to arrange around.
 */
function BriefRain() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [reduced, setReduced] = useState(false);

  // Read in an effect rather than at first render for the usual reason — the
  // server has no media queries — and kept live, because the setting can be
  // changed while the page is open and this is precisely the kind of thing
  // somebody turns it off for.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let timer = 0;
    let cols: RainColumn[] = [];
    let rows = 0;
    let colW = 26;
    let rowH = 19;
    let fontSize = 13;
    let frameMs = 1000 / 20;
    let cssW = 0;
    let cssH = 0;
    let family = "monospace";
    let last = 0;
    let cancelled = false;
    let narrow = false;

    const pick = () => RAIN_GLYPHS[(Math.random() * RAIN_GLYPHS.length) | 0];

    // `seeded` is for the very first field only: the columns are scattered down
    // the section so the rain is already falling when it is first looked at,
    // instead of the whole thing marching in from the top in one wave. Every
    // respawn after that comes back in from above the top edge, which is what
    // makes a column read as falling out from behind the ribbon rather than
    // popping into existence at the point it left.
    //
    // The gap it re-enters through is deliberately short — barely more than
    // the tail itself, so a column is out of sight for about as long as one
    // takes to fall past. A longer random one parked a third of the columns
    // above the top edge at any moment and the field went patchy, which reads
    // as broken rather than as sparse. Sparseness is the column pitch's job;
    // this only has to hide the seam.
    const respawn = (c: RainColumn, seeded: boolean) => {
      c.speed = narrow ? 4 + Math.random() * 4 : 5 + Math.random() * 6;
      c.tail = narrow
        ? 9 + ((Math.random() * 7) | 0)
        : 14 + ((Math.random() * 11) | 0);
      c.cells.length = 0;
      c.head = seeded
        ? Math.random() * rows
        : -c.tail - Math.random() * rows * 0.05;
    };

    const measure = () => {
      const rect = el.getBoundingClientRect();
      cssW = rect.width;
      cssH = rect.height;
      if (cssW < 1 || cssH < 1) return;

      // Phones get fewer, slower, shorter columns and half the frame rate: the
      // section is a third of the width and the whole effect is background, so
      // there is nothing to be gained by spending a battery on it.
      narrow = window.innerWidth < 640;
      fontSize = narrow ? 11 : 13;
      colW = 26;
      rowH = narrow ? 17 : 19;
      frameMs = narrow ? 1000 / 12 : 1000 / 20;
      rows = Math.ceil(cssH / rowH);

      // Capped at 2 — a third of a device pixel per CSS pixel buys nothing at
      // this weight and costs the whole bitmap again.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      el.width = Math.round(cssW * dpr);
      el.height = Math.round(cssH * dpr);
      // setTransform rather than scale: this runs again on every resize, and
      // scale multiplies into whatever is already there, so the second call
      // would draw at dpr² and every one after that would be worse.
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // A 2d context cannot read a CSS custom property, so the page's mono
      // stack is inherited onto the canvas element and read back off it here
      // already resolved to real family names.
      family = getComputedStyle(el).fontFamily || "monospace";

      // Laid out centred rather than flush left: the remainder of the division
      // is split between the two edges, so the field is symmetrical about the
      // section instead of leaving a column-wide gutter down the right.
      const n = Math.max(1, Math.floor(cssW / colW));
      const edge = (cssW - n * colW) / 2;
      cols = [];
      for (let i = 0; i < n; i++) {
        const c: RainColumn = {
          x: edge + i * colW,
          head: 0,
          speed: 0,
          tail: 0,
          cells: [],
        };
        respawn(c, true);
        cols.push(c);
      }
    };

    // Glyphs are chosen per row and kept, not chosen per frame. Rerolling every
    // frame turns the trail into static; holding the character means the trail
    // is a light passing down a column of fixed text, which is the thing being
    // imitated.
    const glyphAt = (c: RainColumn, row: number) => (c.cells[row] ??= pick());

    const draw = () => {
      ctx.clearRect(0, 0, cssW, cssH);
      ctx.font = fontSize + "px " + family;
      ctx.textBaseline = "top";

      for (const c of cols) {
        for (let i = 0; i < c.tail; i++) {
          const row = Math.floor(c.head) - i;
          if (row < 0 || row > rows) continue;
          if (i === 0) {
            // The leading glyph, mint lifted towards white so the head of a
            // column reads as brighter rather than merely as more opaque.
            ctx.fillStyle = "rgba(205,255,235,0.24)";
          } else {
            const f = 1 - i / c.tail;
            // Linear, not curved — and at this strength there is no longer the
            // room to be anything else. On a near-black ground anything under
            // about four percent alpha is off the screen entirely, and the
            // trail now opens at thirteen: the ceiling sits in the floor's
            // neighbourhood, three or four steps above it, with the last rows
            // going under. That is the intent rather than a shortfall — the
            // rain is meant to sit right at the edge of noticeable. But it is
            // also why the ramp cannot go back to being curved: a curve spends
            // most of its length in the bottom of its range, where mint washes
            // out to grey long before it fades out, and there is no range left
            // to spend that way. Linear holds the hue nearly the whole way down
            // and only reaches the floor at the very end, which is the entire
            // point of colouring it mint. 130,245,198 is --hw-mint, #82f5c6.
            ctx.fillStyle = "rgba(130,245,198," + (0.13 * f).toFixed(3) + ")";
          }
          ctx.fillText(glyphAt(c, row), c.x, row * rowH);
        }
      }
    };

    const step = (dt: number) => {
      for (const c of cols) {
        c.head += c.speed * dt;
        if (c.head - c.tail > rows) respawn(c, false);
        // One character somewhere in the live trail flips per frame or so.
        // Without it the columns are rigid strings sliding past; with it the
        // field keeps twitching even where nothing is moving into view.
        if (Math.random() < 0.25) {
          const r = Math.floor(c.head) - ((Math.random() * c.tail) | 0);
          if (r >= 0) c.cells[r] = pick();
        }
      }
    };

    // The loop runs at 20fps on a desktop and 12 on a phone — the low rate is
    // the effect rather than a concession, since a terminal repainting is what
    // this is meant to be — and the throttle is a timer wrapped around the
    // frame request rather than a check inside it. An early return would still
    // wake the device for every one of the display's 60 or 120 frames a second
    // and discard four fifths of them; a setTimeout only asks for the frames it
    // means to draw. requestAnimationFrame stays in the chain for the one thing
    // a bare interval cannot do: a backgrounded tab stops on its own.
    //
    // `dt` is clamped because the two are not the same thing — coming back to
    // the tab after a minute, an unclamped delta would teleport every column
    // several screens down in one step.
    const frame = (t: number) => {
      raf = 0;
      const dt = last ? Math.min((t - last) / 1000, 0.2) : 1 / 30;
      last = t;
      step(dt);
      draw();
      timer = window.setTimeout(tick, frameMs);
    };

    const tick = () => {
      timer = 0;
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (raf || timer) return;
      last = 0;
      tick();
    };

    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      if (timer) clearTimeout(timer);
      raf = 0;
      timer = 0;
    };

    // Reduced motion keeps the field and drops the motion: one static frame,
    // no observer, no loop at all. Redrawn once when the webfont lands, since
    // the only frame there is would otherwise be stuck in the fallback face.
    if (reduced) {
      measure();
      draw();
      document.fonts?.ready.then(() => {
        if (!cancelled) draw();
      });
      return () => {
        cancelled = true;
      };
    }

    measure();

    // Its own observer rather than the page's reveal one. That one is a
    // one-shot — it marks an element shown and unobserves it — and this has to
    // keep firing in both directions for the life of the section, because the
    // whole value of it is that nothing is being computed while the rain is off
    // screen. The margin starts it just before the section arrives, so the
    // field is already falling by the time it is looked at rather than filling
    // in from an empty canvas.
    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver === "undefined") {
      start();
    } else {
      io = new IntersectionObserver(
        (entries) => {
          const entry = entries[entries.length - 1];
          if (!entry) return;
          if (entry.isIntersecting) start();
          else stop();
        },
        { rootMargin: "150px 0px" },
      );
      io.observe(el);
    }

    // Re-measure on resize: the bitmap has a fixed pixel size and the element
    // does not, so the two have to be brought back into step or the field
    // stretches. This cannot feed back into itself — setting `width` and
    // `height` changes the bitmap, not the CSS box the observer is watching.
    let ro: ResizeObserver | null = null;
    const onResize = () => {
      measure();
      draw();
    };
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(onResize);
      ro.observe(el);
    } else {
      window.addEventListener("resize", onResize);
    }

    return () => {
      cancelled = true;
      stop();
      if (io) io.disconnect();
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", onResize);
    };
  }, [reduced]);

  return <canvas aria-hidden className="hw26-rain" ref={canvas} />;
}

export function Lander({ hackathon }: { hackathon: HardwareEvent }) {
  const root = useReveal();
  const timeline = useTimelinePin();
  // Hung off the page root the reveal observer already holds, rather than a
  // ref of its own on the same element — the cells are two sections apart and
  // the only thing this needs is a node that contains both.
  useRigFocus(root);

  // The hero's own ref, held so the flicker can be parked once the header has
  // scrolled off. Its own element rather than the page root, because "is the
  // hero on screen" is the entire question. See `useHeroIdle`.
  const hero = useRef<HTMLElement>(null);
  useHeroIdle(hero);

  // Two of the partner rows are dealt again on every visit, so no name owns the
  // first plate. Only these two: the sponsor row and the media row hold one
  // name each, the organizers are a fixed pair of hosts, and the two lead
  // Ecosystem cells are a tier of their own where position is the tier — those
  // four stay exactly as written. See `useShuffled` for why the order arrives
  // after the first render rather than during it.
  const ecosystem = useShuffled(SMALL_SPONSORS);
  const hardware = useShuffled(HARDWARE_PARTNERS);

  return (
    /*
     * The four Geist Pixel cuts are attached here as CSS variables rather than
     * as classes on individual elements, so the scoped stylesheet can reach
     * them and the intro overlay inherits them too. Each cut has one job on
     * this page — see the type section of the stylesheet. Triangle is
     * deliberately unused.
     */
    <div
      className={`hw26 ${GeistPixelCircle.variable} ${GeistPixelGrid.variable} ${GeistPixelSquare.variable} ${GeistPixelLine.variable}`}
      ref={root}
    >
      <SiteMenu />
      {/* The load sequence is disabled for now — see the commented import at
          the top of this file. Restoring it is those two lines and nothing
          else; intro.tsx and intro.css are unchanged.

          <HardwareIntro /> */}

      {/* ---------------- HERO ---------------- */}
      <header className="hw26-hero" id="home" ref={hero}>
        {/* The page's only navigation, in the corner of the art rather than
            in a bar above it: this is a two-page site and a chrome bar for
            one link would be a navigation system pretending there is
            somewhere else to go. Absolutely positioned so the hero's
            composition is untouched — the stage, the title and the countdown
            all sit exactly where they did — and inset by the gutter every
            other section pads from, so it lines up with the sheet below even
            though it is floating over a photograph.

            `z-index: 4` in the stylesheet, which is one above the hero's
            topmost layer. The stage stacks bg 0, title 1, cutout 2, tittle 3;
            a control that the cutout can paint over is a control the reader
            cannot press.

            Ghost rather than the filled mint the hero's own button wears.
            That treatment is the page's primary action and there is one of
            it; this is a nav link, and the outline says so while keeping the
            chamfer every button here shares. `.hw26-apply--ghost` had no call
            site before this — it was written for exactly this kind of
            secondary control and never used. */}
        {/* Hidden for now — re-enable by uncommenting.
        <Link className='hw26-apply hw26-apply--ghost hw26-apply--nav' href='/team'>
          Team
        </Link>
        */}

        {/* Three layers on one stage, back to front: the lit room, the name,
            then a cutout of the same frame that puts the people back in
            front of it. The stage is what holds the two plates in register —
            see the hero block in lander.css.

            Both plates are `priority`: between them they are the LCP on
            every visit, and the composite is wrong rather than merely
            unfinished if the cutout arrives late. Quality 90 rather than the
            default 75 because the room falls off to black and 75 bands that
            gradient visibly. They stay PNG at source — the cutout needs its
            alpha, and `next/image` serves AVIF and WebP derivatives anyway,
            so the lossless source costs the visitor nothing.

            `alt` is empty on both: they are two halves of one picture, the
            name in it is the h1 between them, and describing either would
            announce the event twice.

            `sizes` is the same string on both layers and it is not `100vw`,
            because the stage is not the viewport. It is `max(100%, calc(100svh
            * var(--hero-ar)))` at a 1920/1074 aspect — cover geometry, so on a
            portrait phone it is far wider than the screen it is shown on. On a
            390x844 phone the stage measures ~1509 CSS px across, i.e. ~4526
            device px at DPR 3, while `100vw` told the browser to ask for 390 and
            it was served the 1200 candidate. The art was being upscaled about
            3.8x on every phone.

            650px is a deliberate under-ask rather than the true figure. 650 x
            DPR 3 = 1950, which lands on Next's 2048 candidate: about 1.7x the
            linear resolution of today's 1200, and the pair grows 233 KB -> 422
            KB (bg 80->152, fg 152->269), +189 KB. Asking for what the geometry
            strictly implies would land on 3840 instead, and that is several
            times the decode, the memory and the LCP for sharpness a phone
            cannot show — this is the hero, so those are the frames that decide
            what the page feels like. Desktop keeps `100vw`, which is correct
            there: at 1440x900 DPR2 it already resolves to the 3840 candidate. */}
        <div className="hw26-hero-stage">
          <Image
            alt=""
            className="hw26-hero-layer hw26-hero-layer--bg"
            fill
            priority
            quality={90}
            sizes="(max-width: 700px) 650px, 100vw"
            src="/hero/ab-hero-bg.png"
          />

          {/* The document's only h1, and now real text rather than a hidden
              duplicate of pixels — it is set on the page, selectable, and
              indexable. The two words are separate elements because each
              carries its own `data-text` for the glitch copies, so the
              string is repeated per line by necessity; the space between
              them is explicit so the accessible name is not "AlienBazaar".
              Whitespace-only text is never a flex item, so it costs no
              layout. */}
          <h1 className="hw26-hero-title">
            <span className="hw26-title-word hw26-glitch" data-text="Alien">
              Alien
            </span>{" "}
            <span className="hw26-title-word hw26-glitch" data-text="Bazaar">
              Bazaar
            </span>
          </h1>

          <Image
            alt=""
            className="hw26-hero-layer hw26-hero-layer--fg"
            fill
            priority
            quality={90}
            sizes="(max-width: 700px) 650px, 100vw"
            src="/hero/ab-hero-fg.png"
          />

          {/* The mark, worn as the tittle of ALIEN's I. Last in the stage and
              the only thing above the cutout — it belongs to the wordmark,
              not to the room, so nothing in the photograph crosses it. `alt`
              is empty because it is the same name the h1 above already
              carries, drawn rather than spelled. */}
          {/* Wrapped, and the wrapper is not decoration. The mark wears the
              tube's scanline and grille mask, and a mask clips and modulates
              everything the element paints — including the phosphor bloom
              around it, which came out as a rectangle of striped haze the
              size of the image box. So the span carries the placement and the
              optics and the image inside it carries the mask, which is the
              same split the wordmark makes between the h1 and the two words.
              See the two blocks in the stylesheet. */}
          <span className="hw26-hero-tittle">
            <Image
              alt=""
              className="hw26-hero-tittle-img"
              height={379}
              priority
              quality={90}
              src="/hero/ab-logo.png"
              width={274}
            />
          </span>
        </div>

        <div className="hw26-hero-panel">
          {/* The line above the clock says what is being counted towards.
              The when and the where moved to the ribbon directly below the
              fold, which left this line free to make the claim instead —
              the countdown reads as a countdown either way, and a number
              with a claim attached is worth more than a number with a date
              the reader is about to see again. */}
          <p className="hw26-label hw26-hero-when">
            The boldest hardware hackathon in Europe starts in:
          </p>

          {/* Straight off the event row. The page had a constant of its own
              here while the dates were being decided and the two sources
              disagreed; now that the event is 25–27 September there is one
              source again, and the clock cannot drift from the schedule
              below it. */}
          <Countdown target={hackathon.startsAt} />

          {/* Applications are open, so the control is a link again. Same tab:
              the reader is being handed off to the form, not sent to read
              something on the side. */}
          <a className='hw26-apply' href={JOIN_URL}>
            Join
          </a>
        </div>
      </header>

      {/* ---------------- TICKER ---------------- */}
      <div className="hw26-ticker">
        {/* Two tracks so the loop has something to follow it in, and several
            runs of the facts inside each so a track is never narrower than
            the screen — see TICKER_RUNS. Everything after the very first run
            is the same four labels again, so only that one is left in the
            accessibility tree; the rest is texture. */}
        {[0, 1].map((copy) => (
          <div className="hw26-ticker-track" key={copy}>
            {Array.from({ length: TICKER_RUNS }, (_, run) => (
              <span
                aria-hidden={copy > 0 || run > 0}
                className="hw26-ticker-run"
                key={run}
              >
                {TICKER.map((item) => (
                  <span key={item.label}>
                    {/* Three ways a label can be set, and a label takes one:
                        the white `b` for the whole of the team count, the
                        mint `i` for the tail of the address, plain silver for
                        the rest. See TICKER. */}
                    {item.snow ? (
                      <b>{item.label}</b>
                    ) : item.emphasize ? (
                      <>
                        {item.label.slice(
                          0,
                          item.label.length - item.emphasize.length,
                        )}
                        <i>{item.emphasize}</i>
                      </>
                    ) : (
                      item.label
                    )}
                    <span style={{ opacity: 0.4 }}>{" ///"}</span>
                  </span>
                ))}
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* ---------------- THE BRIEF ---------------- */}
      <section className="hw26-section hw26-section--rain hw26-section--centred">
        <BriefRain />
        <div className="hw26-inner">
          <div className="hw26-head hw26-reveal">
            <h2>What is Alien Bazaar?</h2>
          </div>

          {/* Two lines and a sheet, which is a split by *kind* rather than by
              length. The paragraph before this one carried the whole event —
              venue, team count, hardware, duration, theme — inside one run of
              prose, and every fact in it was a fact a reader was scanning for
              rather than reading: they arrived here to find out how many
              teams and how many days, and had to parse a sentence to get a
              number out of it. Prose is the wrong container for a figure.

              So the sentence keeps only what a sentence is better at — what
              this is, where it happens, and what it is about, which is the
              one thing here nobody can look up in a column — and everything
              countable or namable goes into the block under it, where a
              figure is a figure and a reader takes it at a glance.

              Nothing was dropped in the move. Twenty teams, twenty units,
              three days, the house, the tools and the theme are all still
              stated; the venue and the components and the team count are
              still named here as well as in the sections that go into them,
              because this is the one place a reader should not have to
              assemble the event out of four other sections.

              The measure is finally doing the job it was set for. 64ch was
              chosen for the one passage on the page that is genuinely read
              rather than scanned, and for a while it was holding four lines;
              two is what that measure is actually for. */}
          <div className="hw26-brief hw26-reveal">
            {/* Two lines at this measure, which is 108 characters and not
                128: `64ch` is resolved against `.hw26-brief`'s own inherited
                16px and the sentence is set at 17.28, so the column holds
                about 59 of the characters it is actually setting. It opens
                without naming the event because the head above it just asked
                the question. */}
            <p>
              A hardware hackathon at the Hacker Bloc, a 3-storey hacker house
              in Warsaw. 20 teams, one machine each, locked in for three days.
              The theme is home automation: lighting, cleaning, security, a
              robot that brings beer or any interesting problem you find. Show
              us your most creative solution.
            </p>
          </div>

          {/* The facts, as a sheet rather than a sentence — see the note
              above, and `.hw26-facts` in the stylesheet for why the band and
              the list are two different shapes rather than one. */}
          <div className="hw26-facts hw26-reveal">
            <dl className="hw26-stats">
              <div className="hw26-stat">
                <dt>Best teams in Europe</dt>
                <dd>5</dd>
              </div>
              <div className="hw26-stat">
                <dt>Hardware units</dt>
                <dd>20+</dd>
              </div>
              <div className="hw26-stat">
                <dt>Days</dt>
                <dd>3</dd>
              </div>
            </dl>

            <span className="hw26-label hw26-spec-eyebrow">The setup</span>

            <dl className="hw26-spec">
              <div className="hw26-spec-row">
                <dt>Venue</dt>
                <dd>Hacker Bloc — Kosiarzy 21B, Warsaw</dd>
              </div>
              <div className="hw26-spec-row">
                <dt>Time</dt>
                <dd>25.09.–27.09.2026.</dd>
              </div>
              {/* The two names as two links, because they are two houses and a
                  single link round "Epikor and Hacklab" would be one door onto
                  either. Underlined and left the silver the rest of the value
                  is set in — see `.hw26-spec-link`, and the note there on why
                  the page's mint inline link is the wrong object for a
                  two-word value in a list of one-line facts.

                  The addresses come off `ORGANIZERS` rather than being typed
                  again: the tiles at the foot of the page are the same two
                  links, and two copies of a URL is one of them going stale
                  unnoticed.

                  New tab, matching the partner wall. The wall's argument holds
                  here more strongly if anything: this is a line inside a list
                  of facts about the event, and a reader checking who is behind
                  it is not leaving. The FAQ's `.hw26-link` stays in place
                  because it is a `mailto:` and opens a mail client, not a
                  page. */}
              <div className="hw26-spec-row">
                <dt>Organized by</dt>
                <dd>
                  <a
                    className="hw26-spec-link"
                    href={ORGANIZERS[0].href}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Epikor
                  </a>{" "}
                  and{" "}
                  <a
                    className="hw26-spec-link"
                    href={ORGANIZERS[1].href}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Hacklab
                  </a>
                </dd>
              </div>
              {/* The last row is centred rather than split, which is the one
                  break in the pattern and is doing a job: the theme is not a
                  spec of the event, it is what the event is for, and a
                  left/right row would file it beside the printers. */}
              <div className="hw26-spec-row">
                <dt>Theme</dt>
                <dd>Home automation</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* ---------------- THE INVENTORY ---------------- */}
      {/* One `section` holding two inventories, which is a layout fact rather
          than an editorial one: the categories and the add-ons keep an `h2`
          each and read as two lists, and the element around them is single
          because the graph paper has to be.

          The grid is drawn from its container's top-left corner at a fixed
          88px pitch and faded by an ellipse measured against that same box.
          Two sections means two of everything: a tiling origin that only
          lines up if the first section's height happens to land on a multiple
          of 88, and a second fade centred on the second box — a seam and two
          ruled rectangles stacked, rather than one sheet. Nothing about the
          copy wanted these apart; only the `</section>` did.

          The categories are groups *inside* one head — they are one
          inventory, and giving each its own display title would read as six
          unrelated sections. What divides them is the medium heading
          (`.hw26-cat`), which is the level this page did not have until this
          section needed it: too big to be lost between the panels, nowhere
          near the section title. That same level is what divides the add-ons
          below, which is the other half of why one section works.

          The grid itself is the graph paper this page is drawn on, and it
          goes on the two places that are literally sheets of parts: this
          inventory and the partner wall at the bottom. Skipping everything
          between them is what keeps it texture — behind every section it
          stops being noticed, and a page that is uniformly ruled is a page
          with no ruled sections in it. */}
      <section className="hw26-section" id="hardware">
        <div aria-hidden="true" className="hw26-grid hw26-grid--tall" />

        {/* ---------------- HARDWARE CATEGORIES ---------------- */}
        <div className="hw26-inner">
          <div className="hw26-head hw26-reveal">
            <h2>Hardware categories</h2>
          </div>

          {/* The one rule that governs everything under this title, said
              before the sheet rather than after it. It is the same object the
              add-on groups' `intro` is, one level up: a line that belongs to
              the whole list under a heading and not to any cell in it. Set at
              the brief's size, because it is the brief's kind of sentence —
              prose about the event, not a caption on a panel. */}
          <p className="hw26-head-intro hw26-reveal">
            Each team can reserve 1 hardware unit
          </p>

          {RIG_GROUPS.map((group) => (
            <div className="hw26-rig-group" key={group.label}>
              {/* The mark before the name is punctuation and not a word — see
                  the note on `.hw26-cat-mark`. Hidden from the tree for the
                  same reason the timeline's ordinals are: a reader on a screen
                  reader is given the group's name, and "slash slash slash
                  Robot arms" is the decoration read out as if it were part of
                  it. */}
              <h3 className="hw26-cat hw26-reveal">
                <span aria-hidden="true" className="hw26-cat-mark">
                  ///
                </span>{" "}
                {group.label}
              </h3>

              <div className="hw26-rigs">
                {group.items.map((item, i) => (
                  <RigCell item={item} key={`${item.name}-${i}`} order={i} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ---------------- ADD-ONS ---------------- */}
        {/* Directly under the categories because it answers the question the
            last cell leaves open: you have picked a machine, and these are the
            two things in the house that are not one. Those two are group
            headings rather than cells — the print farm and the parts room have
            an inventory each, and the medium level (`.hw26-cat`) is what says
            that the cells below are two lists and not one drawer. Same heading
            cut and, now literally, the same sheet of graph paper as the
            categories above, which is what makes this read as the last page of
            that drawing rather than as a different kind of object.

            A second `.hw26-inner` under the same `section` and not a section of
            its own — see the note above. `--stacked` is the air the vanished
            boundary was carrying: two sections meeting put two `padding-block`s
            between the last card and this head, and padding does not collapse,
            so the modifier owes the pair back. */}
        <div className="hw26-inner hw26-inner--stacked">
          <div className="hw26-head hw26-reveal">
            <h2>Add-ons</h2>
          </div>

          {ADDON_GROUPS.map((group) => (
            <div className="hw26-rig-group" key={group.label}>
              {/* Same mark as the categories above, for the same reason they
                  share the heading level: these are the same object. */}
              <h3 className="hw26-cat hw26-reveal">
                <span aria-hidden="true" className="hw26-cat-mark">
                  ///
                </span>{" "}
                {group.label}
              </h3>

              {/* The group's own line, under its title and above its cells —
                  see the note on ADDON_GROUPS for why the print deadline is
                  a fact about the subsection rather than about the first
                  card in it. Both groups set one, and the field stays
                  optional for the group that arrives without a condition on
                  it rather than because either of these is that group. */}
              {group.intro ? (
                <p className="hw26-cat-intro hw26-reveal">{group.intro}</p>
              ) : null}

              <div className="hw26-rigs">
                {group.items.map((item, i) => (
                  <RigCell item={item} key={item.name} order={i} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- TIMELINE ---------------- */}
      {/* Sits directly under the inventory because that is what raises the
          question it answers: you have just been told there is one machine
          per team and a finite sheet, and the next thing worth knowing is by
          when. */}
      <section
        className="hw26-section hw26-tl-section"
        id="timeline"
        ref={timeline.section}
      >
        {/* The frame that sticks. It is an ordinary block until the driver in
            useTimelinePin decides otherwise, which is why a phone, a reader
            under reduced motion and a page with no script all get the plain
            section and none of the machinery. */}
        <div className="hw26-tl-pin">
          <div className="hw26-inner">
            <div className="hw26-head hw26-reveal">
              <h2>Timeline</h2>
            </div>

            {/* The scrollport, and the reason the fallbacks are honest: the
                track is wider than this box above the breakpoint, and when the
                pin is not running this is what the reader can push to reach the
                far end. It sits inside `.hw26-inner` so the line and the
                heading above it start on the same column at every width. */}
            <div className="hw26-tl-port" ref={timeline.port}>
              {/* One grid, two subgrids: the bracket strip and the stops share
                  a track, which is the whole reason a bracket can be placed by
                  naming the stops it spans instead of by measuring anything —
                  and the reason the same markup draws the line down the page on
                  a phone and across it on a desktop. The subgrid is taken on
                  rows in one and on columns in the other; nothing here changes.

                  `--tl-stops` is the stop count, handed to the stylesheet so
                  the parent grid and TIMELINE cannot disagree about how many
                  tracks there are. */}
              <div
                className="hw26-tl-track"
                ref={timeline.track}
                style={{ "--tl-stops": TIMELINE.length } as CSSProperties}
              >
                {/* The brackets. `aria-hidden` because each label is an
                    annotation on a shape — read out of the line it brackets it
                    is a fragment, and the stops themselves already carry the
                    whole sequence in order. */}
                <div aria-hidden="true" className="hw26-tl-braces">
                  {TIMELINE_SPANS.map((span) => (
                    <div
                      className="hw26-tl-brace"
                      key={span.label}
                      style={
                        {
                          "--tl-span-from": span.from,
                          "--tl-span-to": span.to,
                        } as CSSProperties
                      }
                    >
                      <span className="hw26-label hw26-tl-brace-label">
                        {span.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* An ordered list, because that is what this is: five things in
                    an order that matters, and the order is the content. */}
                <ol className="hw26-tl-items">
                  {TIMELINE.map((stop, i) => (
                    <li
                      className={`hw26-tl-item${stop.live ? " hw26-tl-item--live" : ""}`}
                      key={stop.when + stop.what}
                    >
                      {/* The ordinal, spelled out because the list is not
                          numbered on screen. Hidden from the tree because the
                          `ol` already announces the position, so the glyph
                          would be said twice. */}
                      <span
                        aria-hidden="true"
                        className="hw26-label hw26-tl-step"
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className='hw26-tl-when'>{stop.when}</span>
                      <div className='hw26-tl-body'>
                        <p className='hw26-tl-what'>{stop.what}</p>
                        {/* Same destination as the hero, reached from the
                            stop that names it. Keeps `.hw26-tl-cta` on top of
                            the shared chrome for the note-width sizing. */}
                        {stop.cta ? (
                          <a className='hw26-apply hw26-tl-cta' href={JOIN_URL}>
                            Join the chat
                          </a>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      {/* Last of the sections that answer a question the reader arrived with,
          and it sits here for that reason: everything above is the offer —
          the machines, the add-ons, the dates — and everything below is the
          people behind it and the way in. The leftovers a reader is still
          holding after the timeline are exactly what this list is. */}
      <section className="hw26-section" id="faq">
        <div className="hw26-inner">
          <div className="hw26-head hw26-reveal">
            <h2>FAQ</h2>
          </div>

          <Faq />
        </div>
      </section>

      {/* ---------------- ORGANIZERS & SPONSORS ---------------- */}
      <section className="hw26-section" id="organizers">
        <div aria-hidden="true" className="hw26-grid" />
        <div className="hw26-inner">
          <div className="hw26-head hw26-reveal">
            <h2>Partners &amp; Organizers</h2>
          </div>

          <PartnerSubhead action="sponsor" reveal title="Sponsors" />

          {/* The lead cell, not the wall's small tile: the tier is money, and
              the page says so in the size of the plate rather than in the
              heading alone. One entry still takes one lead slot — half the
              container — because a tile drawn across the whole sheet reads as
              a banner rather than as the first name under a heading that will
              take more. The container shrinks; see `--one` in the
              stylesheet. */}
          <div className="hw26-sponsors-lead hw26-sponsors-lead--one hw26-reveal">
            {SPONSORS.map((s) => (
              <a
                aria-label={s.name}
                className="hw26-sponsor-lead"
                href={s.href}
                key={s.name}
                rel="noopener noreferrer"
                target="_blank"
              >
                <img alt={s.name} className={s.mark} src={s.src} />
              </a>
            ))}
          </div>

          <div className="hw26-partner-family">
            <PartnerSubhead action="partner" reveal title="Partners" />

            <PartnerTierSubhead reveal title="Ecosystem Partners" />

          {/* One row of five, and it used to be two rows of two and three.
              The split was a tier: NVIDIA and ESRA took a plate twice the
              linear size of the partners below, and the stylesheet carried a
              paragraph of arithmetic making the small row's three columns land
              exactly on the large row's two so the two rows read as one block
              anyway. That is the tell. A layout that has to be engineered back
              into looking like one row is one row with a rank drawn through
              it, and the rank was the page's own invention — the organizers
              publish these partners under one heading. So: one grid, five tiles,
              one size, and the arithmetic goes with the thing it was
              reconciling.

              Same tile-as-link treatment as the organizers below. Marks are
              served as-authored — running a partner's logo through the image
              optimizer would re-encode it, which their brand terms do not
              allow.

              NVIDIA and ESRA are written out ahead of the map rather than
              folded into it, which is the whole of how they stay first and
              second: `ecosystem` is `useShuffled`, dealt again every visit, and
              anything inside it is somewhere different on the next load. These
              two are pinned and the three behind them reorder. Keys are the
              partner names, so React moves the existing nodes rather than
              rebuilding them — which matters because the reveal observer has
              already been handed these elements. */}
          <div className="hw26-sponsors-lead hw26-sponsors-lead--eco hw26-reveal">
            {[LEAD_SPONSORS[0], LEAD_SPONSORS[1], ...ecosystem].map((s) => (
              <a
                aria-label={s.name}
                className="hw26-sponsor-lead"
                href={s.href}
                key={s.name}
                rel="noopener noreferrer"
                target="_blank"
              >
                <img alt={s.name} className={s.mark} src={s.src} />
              </a>
            ))}
          </div>

            <PartnerTierSubhead reveal title="Hardware Partners" />

          {/* The wall's smaller tile, and the three rows that use it are the
              same grid with a different count in it. The tile itself is
              `SponsorTile` above.

              Dealt again per visit, and unlike the ecosystem row this one has a
              layout stake in how. Nine tiles divide cleanly into the wall's
              nine- and three-column layouts. On phones the final tile closes
              the one leftover track. Reordering the array instead of using CSS
              `order` also keeps visual and DOM order aligned.

              `key` is the partner name, which is unique here, so React reorders
              the existing DOM nodes rather than tearing them down and building
              new ones — and the reveal observer in `useReveal` is already
              holding these exact elements. */}
          <div className="hw26-sponsors-rest hw26-reveal">
            {hardware.map((p) => (
              <SponsorTile key={p.name} partner={p} />
            ))}
          </div>

            <PartnerTierSubhead reveal title="Media Partners" />

          <div className="hw26-sponsors-lead hw26-sponsors-lead--one hw26-reveal">
            {MEDIA_PARTNERS.map((p) => (
              <a
                aria-label={p.name}
                className="hw26-sponsor-lead"
                href={p.href}
                key={p.name}
                rel="noopener noreferrer"
                target="_blank"
              >
                <img alt={p.name} className={p.mark} src={p.src} />
              </a>
            ))}
          </div>

            <PartnerTierSubhead reveal title="Prize Partners" />

          <div className="hw26-sponsors-lead hw26-sponsors-lead--one hw26-reveal">
            {PRIZE_PARTNERS.map((p) => (
              <a
                aria-label={p.name}
                className="hw26-sponsor-lead"
                href={p.href}
                key={p.name}
                rel="noopener noreferrer"
                target="_blank"
              >
                <img alt={p.name} className={p.mark} src={p.src} />
              </a>
            ))}
          </div>
          </div>

          <PartnerSubhead reveal title="Organizers" />

          {/* The whole tile is the link, not the mark inside it. A logo in a
              cell that is otherwise inert gives the reader a target the size
              of the artwork and a hover state on the cell that promises more
              than it delivers; making the cell itself the anchor is one link
              per tile, no nested interactive content, and the hit area the
              hover was already implying.

              `aria-label` names the organisation, because the accessible name
              would otherwise be the alt text.

              `target='_blank'` on every tile on this wall, which is the one
              place on the page that opens anywhere else. It used to open in
              place on the argument that the page has one convention and a
              sponsor mark is not the one to break it — but the reader who
              clicks a mark here is checking who these people are, not leaving,
              and the cost of taking them out of a page they were half way down
              is losing the rest of it. Every other outbound control on the
              page still opens in place. `rel='noopener noreferrer'` comes with
              it and is not optional: an opened tab can otherwise reach back
              through `window.opener` and repoint the one it came from. */}
          <div className="hw26-sponsors-lead hw26-reveal">
            {ORGANIZERS.map((org) => (
              <a
                aria-label={org.name}
                className="hw26-sponsor-lead"
                href={org.href}
                key={org.name}
                rel="noopener noreferrer"
                target="_blank"
              >
                <img
                  alt={org.name}
                  className={`hw26-org-logo${org.mark ? ` ${org.mark}` : ""}`}
                  src={org.src}
                />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- CLOSER ---------------- */}
      <section className='hw26-section hw26-closer'>
        <div className='hw26-inner'>
          <h2 className='hw26-reveal'>Join Alien Bazaar</h2>
          <div className='hw26-reveal'>
            {/* The last thing on the page, so it gets the large cut of the
                same link the hero opens with. */}
            <a className='hw26-apply hw26-apply--lg' href={JOIN_URL}>
              Join now
            </a>
          </div>
        </div>
      </section>

      {/* ---------------- END PLATE ---------------- */}
      <Endplate hackathon={hackathon} />
    </div>
  );
}
