"use client";

import { type ReactNode, useEffect, useState } from "react";

import { buildJoinUrl, readFirstTouchCookie } from "../lib/attribution";
import { JOIN_URL } from "../lib/event";

/**
 * The surfaces that can send somebody to hacklab. The union is deliberately
 * closed: it is the list of join controls on the site, so adding a fourth
 * button is a one-word edit here and the breakdown in PostHog stays a fixed set
 * of names rather than whatever string a call site invented.
 */
type JoinControl = "menu" | "hero" | "closer";

/**
 * A join control, tagged with where the visitor came from.
 *
 * The anchor renders with the plain destination and rewrites its own `href`
 * after mount, once `document.cookie` is readable. Server and client therefore
 * agree on the first render — no hydration mismatch — and the tag lands on the
 * `href` itself rather than in a click handler, so it survives every way a link
 * gets used: a left click, a cmd-click into a new tab, a middle click, or
 * "copy link address" into a message to a friend.
 */
export function JoinLink({
  control,
  className,
  children,
}: {
  control: JoinControl;
  className?: string;
  children: ReactNode;
}) {
  const [href, setHref] = useState(JOIN_URL);

  useEffect(() => {
    setHref(buildJoinUrl(JOIN_URL, readFirstTouchCookie(document.cookie), control));
  }, [control]);

  return (
    <a className={className} href={href}>
      {children}
    </a>
  );
}
