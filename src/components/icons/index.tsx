import type { SVGProps } from "react";

/* ============================================================================
   ICON SET
   One family, one grid (24px), one stroke weight (1.7px), round caps and
 joins — the geometric, generously-sized line style the design direction
 calls for. Icons support labels; they are never decoration.
   ========================================================================== */

export type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function I({ size = 20, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

/* ---- Navigation ---------------------------------------------------------- */

/** Overview — a dial reading the state of the site. */
export const OverviewIcon = (p: IconProps) => (
  <I {...p}>
    <path d="M4 10.2 12 4l8 6.2V19a1.4 1.4 0 0 1-1.4 1.4H5.4A1.4 1.4 0 0 1 4 19v-8.8Z" />
    <path d="M9.6 20.4v-5.2h4.8v5.2" />
  </I>
);

/** Site Brain — layered knowledge, not a cartoon brain. */
export const BrainIcon = (p: IconProps) => (
  <I {...p}>
    <circle cx="12" cy="12" r="8.2" />
    <circle cx="12" cy="12" r="3.1" />
  </I>
);

/** Agent — a considered presence, marked by the Concierge plus. */
export const AgentIcon = (p: IconProps) => (
  <I {...p}>
    <rect x="3.6" y="7" width="16.8" height="13" rx="4.4" />
    <path d="M12 2.8v4.2" />
    <circle cx="9" cy="13" r="1.15" fill="currentColor" stroke="none" />
    <circle cx="15" cy="13" r="1.15" fill="currentColor" stroke="none" />
  </I>
);

export const ConversationsIcon = (p: IconProps) => (
  <I {...p}>
    <path d="M20 11.6c0 4.2-3.6 7.6-8 7.6a8.7 8.7 0 0 1-2.9-.5L4 20.2l1.3-3.8A7.3 7.3 0 0 1 4 11.6C4 7.4 7.6 4 12 4s8 3.4 8 7.6Z" />
  </I>
);

/** Leads — a person with a qualification tick. */
export const LeadsIcon = (p: IconProps) => (
  <I {...p}>
    <circle cx="10" cy="8.2" r="3.6" />
    <path d="M3.8 19.8a6.4 6.4 0 0 1 11.2-4.2" />
    <path d="m14.8 18.2 1.9 1.9 3.9-3.9" />
  </I>
);

/** Actions — a step that completes. */
export const ActionsIcon = (p: IconProps) => (
  <I {...p}>
    <path d="M13.4 3.2 5.6 13.1h5.4l-.9 7.7 7.9-9.9h-5.4l.8-7.7Z" />
  </I>
);

/** Routing — one intent branching to the right human. */
export const RoutingIcon = (p: IconProps) => (
  <I {...p}>
    <circle cx="5.6" cy="12" r="2.4" />
    <circle cx="18.4" cy="5.8" r="2.4" />
    <circle cx="18.4" cy="18.2" r="2.4" />
    <path d="M8 11.2c3.4-.5 5-1.9 6.4-4.4" />
    <path d="M8 12.8c3.4.5 5 1.9 6.4 4.4" />
  </I>
);

export const PagesIcon = (p: IconProps) => (
  <I {...p}>
    <rect x="4" y="3.4" width="16" height="17.2" rx="2.6" />
    <path d="M4 8.6h16" />
    <path d="M8.2 12.6h7.6M8.2 16.4h5" />
  </I>
);

export const InsightsIcon = (p: IconProps) => (
  <I {...p}>
    <path d="M4 20V4" />
    <path d="M4 20h16" />
    <path d="m7.6 15.4 3.4-4.2 3 2.6 4.4-6" />
  </I>
);

/** Assistants — a reply arriving from somewhere that is not your site. */
export const AssistantsIcon = (p: IconProps) => (
  <I {...p}>
    <path d="M20.4 13.6a6.2 6.2 0 0 1-6.2 6.2H8.6L4 22.4l1.4-4.2a6.2 6.2 0 0 1 3.2-11.5h5.6a6.2 6.2 0 0 1 6.2 6.2Z" />
    <path d="M10.4 12.8h.01M14 12.8h.01" />
  </I>
);

/** Return — a ledger rule with the entries stacked against it. */
export const ReturnIcon = (p: IconProps) => (
  <I {...p}>
    <path d="M4 4v16h16" />
    <path d="M7.6 16.4V12M11.6 16.4V8.2M15.6 16.4v-2.6M19.6 16.4V5.6" />
  </I>
);

export const IntegrationsIcon = (p: IconProps) => (
  <I {...p}>
    <path d="M9 3.6v4.2M15 3.6v4.2" />
    <path d="M6.4 7.8h11.2v4.6a5.6 5.6 0 1 1-11.2 0V7.8Z" />
    <path d="M12 18v2.6" />
  </I>
);

export const SettingsIcon = (p: IconProps) => (
  <I {...p}>
    <path d="M4 7.4h7M15.4 7.4H20M4 16.6h4.6M13 16.6H20" />
    <circle cx="13.2" cy="7.4" r="2.3" />
    <circle cx="10.8" cy="16.6" r="2.3" />
  </I>
);

export const TeamIcon = (p: IconProps) => (
  <I {...p}>
    <circle cx="9.2" cy="8" r="3.3" />
    <path d="M3.4 19.4a5.9 5.9 0 0 1 11.6 0" />
    <path d="M16.2 5.2a3.3 3.3 0 0 1 0 6.4" />
    <path d="M17.6 14.4a5.9 5.9 0 0 1 3 5" />
  </I>
);

export const BillingIcon = (p: IconProps) => (
  <I {...p}>
    <rect x="3" y="5.4" width="18" height="13.2" rx="2.6" />
    <path d="M3 9.8h18" />
    <path d="M6.6 14.6h3.4" />
  </I>
);

export const InstallIcon = (p: IconProps) => (
  <I {...p}>
    <path d="m8.6 9.4-3.4 2.6 3.4 2.6M15.4 9.4l3.4 2.6-3.4 2.6" />
    <path d="m13.4 6.2-2.8 11.6" />
  </I>
);

/* ---- Controls ------------------------------------------------------------ */

export const ChevronRight = (p: IconProps) => (
  <I {...p}>
    <path d="m9.6 5.4 6.6 6.6-6.6 6.6" />
  </I>
);
export const ChevronLeft = (p: IconProps) => (
  <I {...p}>
    <path d="M14.4 5.4 7.8 12l6.6 6.6" />
  </I>
);
export const ChevronDown = (p: IconProps) => (
  <I {...p}>
    <path d="m5.4 9.2 6.6 6.6 6.6-6.6" />
  </I>
);
export const ChevronUp = (p: IconProps) => (
  <I {...p}>
    <path d="m5.4 14.8 6.6-6.6 6.6 6.6" />
  </I>
);
export const ChevronUpDown = (p: IconProps) => (
  <I {...p}>
    <path d="m8 10 4-4 4 4M8 14l4 4 4-4" />
  </I>
);

export const PlusIcon = (p: IconProps) => (
  <I {...p}>
    <path d="M12 5v14M5 12h14" />
  </I>
);
export const CloseIcon = (p: IconProps) => (
  <I {...p}>
    <path d="m5.8 5.8 12.4 12.4M18.2 5.8 5.8 18.2" />
  </I>
);
export const CheckIcon = (p: IconProps) => (
  <I {...p}>
    <path d="m5 12.6 4.6 4.6L19 7.6" />
  </I>
);
export const SearchIcon = (p: IconProps) => (
  <I {...p}>
    <circle cx="11" cy="11" r="6.4" />
    <path d="m15.8 15.8 4 4" />
  </I>
);
export const MoreIcon = (p: IconProps) => (
  <I {...p}>
    <circle cx="5.4" cy="12" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="18.6" cy="12" r="1.3" fill="currentColor" stroke="none" />
  </I>
);
export const FilterIcon = (p: IconProps) => (
  <I {...p}>
    <path d="M4 6.4h16M7 12h10M10 17.6h4" />
  </I>
);
export const EditIcon = (p: IconProps) => (
  <I {...p}>
    <path d="M16.4 4.2a2.2 2.2 0 0 1 3.2 3.2L8.4 18.6l-4.2 1 1-4.2L16.4 4.2Z" />
  </I>
);
export const TrashIcon = (p: IconProps) => (
  <I {...p}>
    <path d="M4.6 6.6h14.8" />
    <path d="M9.4 6.6V4.8a1.2 1.2 0 0 1 1.2-1.2h2.8a1.2 1.2 0 0 1 1.2 1.2v1.8" />
    <path d="M6.6 6.6 7.4 19a1.6 1.6 0 0 0 1.6 1.5h6a1.6 1.6 0 0 0 1.6-1.5l.8-12.4" />
  </I>
);
export const CopyIcon = (p: IconProps) => (
  <I {...p}>
    <rect x="9" y="9" width="11" height="11" rx="2.4" />
    <path d="M15.4 6.4A2.4 2.4 0 0 0 13 4H6.4A2.4 2.4 0 0 0 4 6.4V13a2.4 2.4 0 0 0 2.4 2.4" />
  </I>
);
export const ExternalIcon = (p: IconProps) => (
  <I {...p}>
    <path d="M13.4 4.6H19.4v6" />
    <path d="M19.4 4.6 11 13" />
    <path d="M17.6 14v4.2a2 2 0 0 1-2 2H5.8a2 2 0 0 1-2-2V8.4a2 2 0 0 1 2-2H10" />
  </I>
);
export const ArrowRight = (p: IconProps) => (
  <I {...p}>
    <path d="M4.6 12h14.8" />
    <path d="m13.4 6 6 6-6 6" />
  </I>
);
export const ArrowUpRight = (p: IconProps) => (
  <I {...p}>
    <path d="M7 17 17 7" />
    <path d="M8.4 7H17v8.6" />
  </I>
);
export const ArrowUp = (p: IconProps) => (
  <I {...p}>
    <path d="M12 19.4V5" />
    <path d="m6 10.6 6-6 6 6" />
  </I>
);
export const ArrowDown = (p: IconProps) => (
  <I {...p}>
    <path d="M12 4.6V19" />
    <path d="m6 13.4 6 6 6-6" />
  </I>
);
export const RefreshIcon = (p: IconProps) => (
  <I {...p}>
    <path d="M19.4 11a7.6 7.6 0 0 0-13.2-4.2L3.6 9.4" />
    <path d="M3.6 5v4.4H8" />
    <path d="M4.6 13a7.6 7.6 0 0 0 13.2 4.2l2.6-2.6" />
    <path d="M20.4 19v-4.4H16" />
  </I>
);
export const UploadIcon = (p: IconProps) => (
  <I {...p}>
    <path d="M12 16V4.6" />
    <path d="m7.6 9 4.4-4.4L16.4 9" />
    <path d="M4.4 15v3.4a2 2 0 0 0 2 2h11.2a2 2 0 0 0 2-2V15" />
  </I>
);

/* ---- Status & meaning ---------------------------------------------------- */

export const AlertIcon = (p: IconProps) => (
  <I {...p}>
    <circle cx="12" cy="12" r="8.4" />
    <path d="M12 7.8v4.8" />
    <path d="M12 16.2h.01" strokeWidth={2.2} />
  </I>
);
export const InfoIcon = (p: IconProps) => (
  <I {...p}>
    <circle cx="12" cy="12" r="8.4" />
    <path d="M12 11.4v4.8" />
    <path d="M12 7.9h.01" strokeWidth={2.2} />
  </I>
);
export const ShieldIcon = (p: IconProps) => (
  <I {...p}>
    <path d="M12 3.4 5.2 6v5.6c0 4 2.8 7.4 6.8 9 4-1.6 6.8-5 6.8-9V6L12 3.4Z" />
    <path d="m9.2 12 2 2 3.6-3.8" />
  </I>
);
export const EyeIcon = (p: IconProps) => (
  <I {...p}>
    <path d="M2.6 12S6 6.4 12 6.4 21.4 12 21.4 12 18 17.6 12 17.6 2.6 12 2.6 12Z" />
    <circle cx="12" cy="12" r="2.8" />
  </I>
);
export const ClockIcon = (p: IconProps) => (
  <I {...p}>
    <circle cx="12" cy="12" r="8.4" />
    <path d="M12 7.4V12l3 1.8" />
  </I>
);
export const CalendarIcon = (p: IconProps) => (
  <I {...p}>
    <rect x="3.6" y="5.4" width="16.8" height="15" rx="2.4" />
    <path d="M3.6 9.8h16.8M8.4 3.4v4M15.6 3.4v4" />
  </I>
);
export const GlobeIcon = (p: IconProps) => (
  <I {...p}>
    <circle cx="12" cy="12" r="8.4" />
    <path d="M3.6 12h16.8" />
    <path d="M12 3.6c2.1 2.3 3.2 5.2 3.2 8.4s-1.1 6.1-3.2 8.4c-2.1-2.3-3.2-5.2-3.2-8.4S9.9 5.9 12 3.6Z" />
  </I>
);
export const MailIcon = (p: IconProps) => (
  <I {...p}>
    <rect x="3" y="5.4" width="18" height="13.2" rx="2.4" />
    <path d="m3.6 7.4 8.4 5.6 8.4-5.6" />
  </I>
);
export const PhoneIcon = (p: IconProps) => (
  <I {...p}>
    <path d="M8.2 4.6 10 8.4l-1.9 1.8a11 11 0 0 0 5.7 5.7l1.8-1.9 3.8 1.8v3a1.6 1.6 0 0 1-1.8 1.6C10.6 19.6 4.4 13.4 3.6 6.4A1.6 1.6 0 0 1 5.2 4.6h3Z" />
  </I>
);
export const BellIcon = (p: IconProps) => (
  <I {...p}>
    <path d="M17.8 9.6a5.8 5.8 0 1 0-11.6 0c0 4.9-1.8 6.4-1.8 6.4h15.2s-1.8-1.5-1.8-6.4Z" />
    <path d="M13.6 19.2a1.9 1.9 0 0 1-3.2 0" />
  </I>
);
export const SparkIcon = (p: IconProps) => (
  <I {...p}>
    <path d="m12 3.4 1.9 5.1 5.1 1.9-5.1 1.9L12 17.4l-1.9-5.1L5 10.4l5.1-1.9L12 3.4Z" />
    <path d="M18.6 15.4 19.4 18l2.6.8-2.6.8-.8 2.6-.8-2.6-2.6-.8 2.6-.8.8-2.6Z" />
  </I>
);
export const LinkIcon = (p: IconProps) => (
  <I {...p}>
    <path d="M10.2 13.8a3.8 3.8 0 0 0 5.6 0l2.8-2.8a3.8 3.8 0 0 0-5.4-5.4l-1.4 1.4" />
    <path d="M13.8 10.2a3.8 3.8 0 0 0-5.6 0l-2.8 2.8a3.8 3.8 0 0 0 5.4 5.4l1.4-1.4" />
  </I>
);
export const CodeIcon = (p: IconProps) => (
  <I {...p}>
    <path d="m8.4 8.6-3.8 3.4 3.8 3.4M15.6 8.6l3.8 3.4-3.8 3.4" />
  </I>
);
export const PlayIcon = (p: IconProps) => (
  <I {...p}>
    <path d="M8 5.6 18.4 12 8 18.4V5.6Z" />
  </I>
);
export const SendIcon = (p: IconProps) => (
  <I {...p}>
    <path d="M12 19.4V5" />
    <path d="m6 11 6-6 6 6" />
  </I>
);
export const HelpIcon = (p: IconProps) => (
  <I {...p}>
    <circle cx="12" cy="12" r="8.4" />
    <path d="M9.6 9.6a2.5 2.5 0 1 1 3.3 2.4c-.6.2-.9.7-.9 1.3v.5" />
    <path d="M12 16.6h.01" strokeWidth={2.2} />
  </I>
);
export const DotIcon = ({ size = 8, className }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 8 8" className={className} aria-hidden>
    <circle cx="4" cy="4" r="4" fill="currentColor" />
  </svg>
);
export const PanelIcon = (p: IconProps) => (
  <I {...p}>
    <rect x="3.4" y="4.4" width="17.2" height="15.2" rx="2.6" />
    <path d="M9.2 4.4v15.2" />
  </I>
);
export const SourceIcon = (p: IconProps) => (
  <I {...p}>
    <path d="M6 3.6h8.4L19 8.2v12.2H6V3.6Z" />
    <path d="M14 3.6v5h5" />
    <path d="M9 13h7M9 16.4h4.6" />
  </I>
);
export const LockIcon = (p: IconProps) => (
  <I {...p}>
    <rect x="4.8" y="10.4" width="14.4" height="10" rx="2.4" />
    <path d="M8.4 10.4V7.8a3.6 3.6 0 0 1 7.2 0v2.6" />
  </I>
);
export const WandIcon = (p: IconProps) => (
  <I {...p}>
    <path d="m4.6 19.4 9.6-9.6" />
    <path d="m12.6 5.4 1 2.6 2.6 1-2.6 1-1 2.6-1-2.6-2.6-1 2.6-1 1-2.6Z" />
    <path d="M19 4v2.4M20.2 5.2h-2.4M18.4 15.6v2M19.4 16.6h-2" />
  </I>
);

/** Many things at once — the portfolio, rather than one site. */
export const GridIcon = (p: IconProps) => (
  <I {...p}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1" />
  </I>
);
