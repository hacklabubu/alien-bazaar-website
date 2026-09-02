import {
  GeistPixelCircle,
  GeistPixelGrid,
  GeistPixelLine,
  GeistPixelSquare,
} from 'geist/font/pixel'
import Link from 'next/link'

import { type HardwareEvent } from '../lib/event'
import { Endplate } from './lander'
import './lander.css'
import './agenda.css'

/**
 * The running order.
 *
 * A server component, like the team and partners pages: three lists and a
 * callout, no state and no effect, so it ships no JavaScript of its own. It
 * borrows the section frame literally — `.hw26-section`, `.hw26-inner`,
 * `.hw26-head` — so its title is the same object the landing page's titles
 * are, and owns only the row layout in `agenda.css`.
 */

/**
 * One line of the schedule.
 *
 * `time` is what the reader sees in the left column, `dateTime` the machine
 * value behind it. The two entries with no clock on them — the full build day
 * and the platform launch — carry a `time` and no `dateTime`, which is what
 * keeps the `<time>` element off a slot that is not a time.
 */
type Entry = {
  time: string
  dateTime?: string
  title: string
  body: string
}

type Day = {
  label: string
  date: string
  entries: Entry[]
}

const DAYS: Day[] = [
  {
    label: 'Day 1',
    date: 'Friday, 25 September 2026',
    entries: [
      {
        time: '08:30',
        dateTime: '2026-09-25T08:30+02:00',
        title: 'Doors open',
        body: 'Check-in at the venue.',
      },
      {
        time: '09:00',
        dateTime: '2026-09-25T09:00+02:00',
        title: 'Welcome and briefing',
        body: 'We walk through the agenda and the rules, and introduce our sponsors, partners and mentors.',
      },
      {
        time: '09:30',
        dateTime: '2026-09-25T09:30+02:00',
        title: 'Epikor presentation',
        body: 'Epikor, co-organizer of Alien Bazaar, presents its mission, the TBOT drone and its vision for it.',
      },
      {
        time: '10:00',
        dateTime: '2026-09-25T10:00+02:00',
        title: 'Hardware handout. Building begins',
        body: 'Every team collects the hardware it booked, and the build starts. Food is provided.',
      },
    ],
  },
  {
    label: 'Day 2',
    date: 'Saturday, 26 September 2026',
    entries: [
      {
        time: 'All day',
        title: 'Build',
        body: 'A full day of building. Meals are provided.',
      },
      {
        time: 'TBA',
        title: 'Hacklab platform presentation',
        body: 'We present the Hacklab platform and our vision for the future.',
      },
    ],
  },
  {
    label: 'Day 3',
    date: 'Sunday, 27 September 2026',
    entries: [
      {
        time: '15:00',
        dateTime: '2026-09-27T15:00+02:00',
        title: 'Building ends. Presentations begin',
        body: 'Tools down. There is nothing to hand in: what is on your table is what you present. Team by team, or together where teams worked together, everyone shows what they made while the judges and investors watch. Presentations run until 17:00.',
      },
      {
        time: '17:00',
        dateTime: '2026-09-27T17:00+02:00',
        title: 'Break and networking',
        body: 'Half an hour to talk with investors and the other teams. Meanwhile, the judges meet separately to pick the winners.',
      },
      {
        time: '17:30',
        dateTime: '2026-09-27T17:30+02:00',
        title: 'Winners announced',
        body: 'The winning teams are called on stage and awarded their prizes.',
      },
      {
        time: '18:00',
        dateTime: '2026-09-27T18:00+02:00',
        title: 'Afterparty',
        body: 'Until 21:00. A DJ playing tech house and techno. There is a pool, so bring swimwear if you want to go in.',
      },
    ],
  },
]

function DayBlock({ day }: { day: Day }) {
  return (
    <section className='hw26-agenda-day'>
      <div className='hw26-agenda-dayhead'>
        <h3>{day.label}</h3>
        <p className='hw26-agenda-date'>{day.date}</p>
      </div>

      <ol className='hw26-agenda-list'>
        {day.entries.map((entry) => (
          <li className='hw26-agenda-row' key={entry.title}>
            <div className='hw26-agenda-slot'>
              {entry.dateTime ? (
                <time dateTime={entry.dateTime}>{entry.time}</time>
              ) : (
                <span>{entry.time}</span>
              )}
            </div>

            <div className='hw26-agenda-item'>
              <h4 className='hw26-agenda-title'>{entry.title}</h4>
              <p className='hw26-agenda-body'>{entry.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function AgendaPage({ hackathon }: { hackathon: HardwareEvent }) {
  return (
    <div
      className={`hw26 ${GeistPixelCircle.variable} ${GeistPixelGrid.variable} ${GeistPixelSquare.variable} ${GeistPixelLine.variable}`}
    >
      <div className='hw26-teamnav'>
        <Link className='hw26-apply hw26-apply--ghost hw26-apply--nav' href='/'>
          Home
        </Link>
      </div>

      <main>
        <section className='hw26-section'>
          <div aria-hidden='true' className='hw26-grid' />
          <div className='hw26-inner'>
            <div className='hw26-head'>
              <h2>Agenda</h2>
            </div>

            <p className='hw26-agenda-lead'>
              Three days at the Hacker Bloc in Warsaw. All times are local
              (CEST).
            </p>

            {DAYS.map((day) => (
              <DayBlock day={day} key={day.label} />
            ))}

            {/* Not `.hw26-note`: that class is uppercase, tracked and cut for
                a one-line aside. This is a paragraph the reader has to read,
                so it takes the note's mint border and faint fill and none of
                its type. */}
            <aside className='hw26-agenda-callout'>
              <h3>Accommodation</h3>
              <p>
                You are welcome to stay overnight at the venue on the nights of
                25 and 26 September, but we do not provide beds or sleeping
                rooms. Bring your own sleeping bag or sleeping pad. The venue is
                not available for sleeping on the night of 27 September, so
                please arrange your own accommodation for that night. We do not
                reimburse travel or accommodation costs.
              </p>
            </aside>
          </div>
        </section>
      </main>

      <Endplate hackathon={hackathon} />
    </div>
  )
}
