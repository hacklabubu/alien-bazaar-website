import { TeamPage } from '../../components/team'
import { EVENT } from '../../lib/event'

/**
 * The root layout sets `title: { absolute: EVENT.title }`, which pins every
 * page's tab to the event's name — a template would be inherited and varied,
 * an absolute title is inherited and kept. So this page states its own or it
 * is indistinguishable from the homepage in a row of tabs.
 */
export const metadata = {
  title: `Team — ${EVENT.title}`,
}

export default function Page() {
  return <TeamPage hackathon={EVENT} />
}
