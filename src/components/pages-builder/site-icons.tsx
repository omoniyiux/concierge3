import type { ReactNode } from "react";

/* ============================================================================
   SITE ICONS
   ----------------------------------------------------------------------------
   Icons for the *customer's website*, deliberately separate from
   `@/components/icons`, which is Concierge's admin chrome. A moving company
   putting a truck beside "Local moves" has nothing to do with the icon set the
   workspace navigates itself by, and letting the two share a file would make
   every future change to one an accident waiting to happen to the other.

   A closed set rather than arbitrary SVG upload: it keeps the stroke weight,
   corner treatment and optical size consistent across a page no matter who is
   picking, which is most of what makes a small site look considered.
   ========================================================================== */

const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const ICONS: Record<string, ReactNode> = {
  truck: (
    <>
      <path {...S} d="M2 6.5h11v9H2z" />
      <path {...S} d="M13 9.5h4l3 3.2v2.8h-7z" />
      <circle {...S} cx="6.5" cy="17.5" r="2" />
      <circle {...S} cx="16.5" cy="17.5" r="2" />
    </>
  ),
  box: (
    <>
      <path {...S} d="M12 3l8 4v10l-8 4-8-4V7z" />
      <path {...S} d="M4 7l8 4 8-4M12 11v10" />
    </>
  ),
  home: (
    <>
      <path {...S} d="M4 10.5L12 4l8 6.5V20H4z" />
      <path {...S} d="M9.5 20v-6h5v6" />
    </>
  ),
  building: (
    <>
      <path {...S} d="M5 20V4h9v16" />
      <path {...S} d="M14 9h5v11M8 8h3M8 12h3M8 16h3" />
    </>
  ),
  calendar: (
    <>
      <path {...S} d="M4 6h16v14H4z" />
      <path {...S} d="M4 10h16M8 3.5v4M16 3.5v4" />
    </>
  ),
  clock: (
    <>
      <circle {...S} cx="12" cy="12" r="8.5" />
      <path {...S} d="M12 7v5.2l3.2 2" />
    </>
  ),
  phone: <path {...S} d="M6 3.5h3l1.6 4-2 1.4a11 11 0 005.5 5.5l1.4-2 4 1.6v3a2 2 0 01-2.2 2A16.5 16.5 0 014 5.7 2 2 0 016 3.5z" />,
  mail: (
    <>
      <path {...S} d="M3 5.5h18v13H3z" />
      <path {...S} d="M3 6.5l9 6 9-6" />
    </>
  ),
  pin: (
    <>
      <path {...S} d="M12 21s6.5-6 6.5-11a6.5 6.5 0 10-13 0C5.5 15 12 21 12 21z" />
      <circle {...S} cx="12" cy="10" r="2.5" />
    </>
  ),
  shield: (
    <>
      <path {...S} d="M12 3l7 2.5v6c0 4.5-3 7.7-7 9.5-4-1.8-7-5-7-9.5v-6z" />
      <path {...S} d="M9 12l2 2 4-4" />
    </>
  ),
  star: <path {...S} d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />,
  heart: <path {...S} d="M12 20.3S4.5 15.8 4.5 10.6A4.1 4.1 0 0112 8a4.1 4.1 0 017.5 2.6c0 5.2-7.5 9.7-7.5 9.7z" />,
  wrench: <path {...S} d="M15.5 3.5a5 5 0 00-4.6 6.9L3.5 17.7 6.3 20.5l7.3-7.4a5 5 0 006.9-4.6l-3.2 3.2-3-.7-.7-3z" />,
  sparkle: (
    <>
      <path {...S} d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9z" />
      <path {...S} d="M18.5 16v4M16.5 18h4" />
    </>
  ),
  check: (
    <>
      <circle {...S} cx="12" cy="12" r="8.5" />
      <path {...S} d="M8.5 12.2l2.4 2.4 4.6-4.9" />
    </>
  ),
  users: (
    <>
      <circle {...S} cx="9.5" cy="8.5" r="3.2" />
      <path {...S} d="M3.5 19.5a6 6 0 0112 0" />
      <path {...S} d="M16 6.2a3.2 3.2 0 010 6M17 14.2a6 6 0 013.5 5.3" />
    </>
  ),
  camera: (
    <>
      <path {...S} d="M3.5 7.5h4l1.5-2h6l1.5 2h4v11h-17z" />
      <circle {...S} cx="12" cy="13" r="3.5" />
    </>
  ),
  scissors: (
    <>
      <circle {...S} cx="6.5" cy="18" r="2.5" />
      <circle {...S} cx="17.5" cy="18" r="2.5" />
      <path {...S} d="M8.3 16.2L18 4M15.7 16.2L6 4" />
    </>
  ),
  brush: (
    <>
      <path {...S} d="M8 14L18.5 3.5 21 6 10.5 16.5z" />
      <path {...S} d="M8 14l-2 2c-1 1-1 3 0 4h-4c1-1 1-2.5 1.5-4L8 14z" />
    </>
  ),
  leaf: (
    <>
      <path {...S} d="M20 4c-9 0-14 3.5-14 9.5a6 6 0 006 6c6 0 8-6.5 8-15.5z" />
      <path {...S} d="M4 20c3-6 7-9 12-11" />
    </>
  ),
  paw: (
    <>
      <circle {...S} cx="7" cy="9" r="2" />
      <circle {...S} cx="12" cy="6.5" r="2" />
      <circle {...S} cx="17" cy="9" r="2" />
      <path {...S} d="M12 11c3 0 5 2.4 5 4.7 0 2-1.6 3.3-3.4 2.8L12 18l-1.6.5C8.6 19 7 17.7 7 15.7 7 13.4 9 11 12 11z" />
    </>
  ),
  coffee: (
    <>
      <path {...S} d="M4 8h13v6a5 5 0 01-5 5H9a5 5 0 01-5-5z" />
      <path {...S} d="M17 9.5h2a2.5 2.5 0 010 5h-2M7 3v2M11 3v2" />
    </>
  ),
  car: (
    <>
      <path {...S} d="M3.5 15v-2.5l2-5h13l2 5V15z" />
      <path {...S} d="M3.5 12.5h17" />
      <circle {...S} cx="7.5" cy="16.5" r="1.8" />
      <circle {...S} cx="16.5" cy="16.5" r="1.8" />
    </>
  ),
  key: (
    <>
      <circle {...S} cx="8" cy="8" r="4.5" />
      <path {...S} d="M11.2 11.2L20 20M17 17l-2 2M14 14l-2 2" />
    </>
  ),
  gift: (
    <>
      <path {...S} d="M3.5 9.5h17V13h-17zM5 13h14v7.5H5z" />
      <path {...S} d="M12 9.5v11" />
      <path {...S} d="M12 9.5S10.5 4 8 4a2.2 2.2 0 000 5.5M12 9.5S13.5 4 16 4a2.2 2.2 0 010 5.5" />
    </>
  ),
  briefcase: (
    <>
      <path {...S} d="M3.5 7.5h17v12h-17z" />
      <path {...S} d="M9 7.5V5h6v2.5M3.5 12.5h17" />
    </>
  ),
  chat: <path {...S} d="M20.5 12c0 4.1-3.8 7.5-8.5 7.5a10 10 0 01-2.8-.4L4 21l1.4-3.6A7 7 0 013.5 12c0-4.1 3.8-7.5 8.5-7.5s8.5 3.4 8.5 7.5z" />,
  card: (
    <>
      <path {...S} d="M3 6h18v12H3z" />
      <path {...S} d="M3 10h18M6.5 14.5h3" />
    </>
  ),
};

export type SiteIconName = keyof typeof ICONS;

export const SITE_ICON_NAMES = Object.keys(ICONS) as SiteIconName[];

export const isSiteIconName = (value: string): value is SiteIconName => value in ICONS;

export function SiteIcon({
  name,
  size = 24,
  className,
}: {
  name: SiteIconName;
  size?: number;
  className?: string;
}) {
  const glyph = ICONS[name];
  if (glyph === undefined) return null;
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-hidden
      focusable="false"
    >
      {glyph}
    </svg>
  );
}
