import type { SVGProps } from "react";

/* ------------------------------------------------------------------
   Symphony icon set — 24px grid, 1.6px stroke, round caps/joins.
   Icons support text; they are never decoration on their own.
   ------------------------------------------------------------------ */

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 20, children, ...rest }: IconProps) {
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

export const ChatIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20 11.6c0 4.2-3.6 7.6-8 7.6a8.7 8.7 0 0 1-2.9-.5L4 20.2l1.3-3.8A7.3 7.3 0 0 1 4 11.6C4 7.4 7.6 4 12 4s8 3.4 8 7.6Z" />
  </Icon>
);

export const HomeIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 10.2 12 4l8 6.2V19a1.4 1.4 0 0 1-1.4 1.4H5.4A1.4 1.4 0 0 1 4 19v-8.8Z" />
    <path d="M9.6 20.4v-5.2h4.8v5.2" />
  </Icon>
);

/** Agents — a focus reticle: the specialist team under Maestro. */
export const AgentsIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.2" />
    <circle cx="12" cy="12" r="3.1" />
  </Icon>
);

export const WhatsAppIcon = ({ size = 20, ...rest }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...rest}>
    <path
      d="M12.04 3.2A8.72 8.72 0 0 0 3.3 11.9c0 1.54.4 3.03 1.18 4.35L3.2 20.8l4.68-1.22a8.7 8.7 0 0 0 4.16 1.06h.01a8.72 8.72 0 0 0 0-17.44Zm0 15.98h-.01a7.24 7.24 0 0 1-3.69-1.01l-.26-.16-2.78.73.74-2.71-.17-.28a7.23 7.23 0 1 1 6.17 3.43Z"
      fill="currentColor"
    />
    <path
      d="M16.01 13.9c-.22-.11-1.3-.64-1.5-.71-.2-.08-.35-.11-.5.11-.14.22-.56.71-.69.86-.13.15-.25.16-.47.06-.22-.11-.93-.35-1.77-1.1-.65-.58-1.1-1.3-1.22-1.52-.13-.22-.02-.34.1-.45.1-.1.22-.25.33-.38.11-.13.15-.22.22-.37.08-.15.04-.28-.02-.39-.06-.11-.5-1.2-.68-1.64-.18-.43-.36-.37-.5-.38h-.42c-.15 0-.39.06-.59.28-.2.22-.77.76-.77 1.85s.79 2.15.9 2.3c.11.15 1.56 2.38 3.77 3.34.53.23.94.36 1.26.46.53.17 1.01.15 1.39.09.42-.06 1.3-.53 1.49-1.05.18-.51.18-.95.13-1.05-.06-.09-.2-.15-.42-.26Z"
      fill="currentColor"
    />
  </svg>
);

export const SearchIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="6.6" />
    <path d="m16 16 4 4" />
  </Icon>
);

/** Sidebar collapse — panel with a left-pointing edge. */
export const PanelLeftIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.4" y="4.4" width="17.2" height="15.2" rx="2.6" />
    <path d="M8.6 4.4v15.2" />
    <path d="M16.6 9.6 14 12l2.6 2.4" />
  </Icon>
);

export const PanelRightIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.4" y="4.4" width="17.2" height="15.2" rx="2.6" />
    <path d="M15.4 4.4v15.2" />
    <path d="M7.4 9.6 10 12l-2.6 2.4" />
  </Icon>
);

export const PlusIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

export const HistoryIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.6 12a8.4 8.4 0 1 0 2.6-6.1" />
    <path d="M3.4 4.6v3.9h3.9" />
    <path d="M12 7.9V12l2.9 1.8" />
  </Icon>
);

export const BellIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M18 9.4a6 6 0 1 0-12 0c0 5.1-1.9 6.6-1.9 6.6h15.8S18 14.5 18 9.4Z" />
    <path d="M13.7 19.3a2 2 0 0 1-3.4 0" />
  </Icon>
);

export const ChevronRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />
  </Icon>
);
export const ChevronLeft = (p: IconProps) => (
  <Icon {...p}>
    <path d="M14.5 5.5 8 12l6.5 6.5" />
  </Icon>
);
export const ChevronUp = (p: IconProps) => (
  <Icon {...p}>
    <path d="m5.5 14.5 6.5-6.5 6.5 6.5" />
  </Icon>
);
export const ChevronDown = (p: IconProps) => (
  <Icon {...p}>
    <path d="m5.5 9.5 6.5 6.5 6.5-6.5" />
  </Icon>
);

export const ReplyIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 8.4 4.6 12.6 9 16.8" />
    <path d="M4.6 12.6h9.2a5.6 5.6 0 0 1 5.6 5.6v.6" />
  </Icon>
);

export const CopyIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="9" y="9" width="11" height="11" rx="2.6" />
    <path d="M15.6 6.2A2.2 2.2 0 0 0 13.4 4H6.2A2.2 2.2 0 0 0 4 6.2v7.2a2.2 2.2 0 0 0 2.2 2.2" />
  </Icon>
);

export const EmojiPlusIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20.4 11.1A8.4 8.4 0 1 1 13 3.7" />
    <path d="M8.9 9.9h.01M15.1 9.9h.01" strokeWidth={2.2} />
    <path d="M8.6 14.4a4.3 4.3 0 0 0 6.3.6" />
    <path d="M18.2 3v4.2M20.3 5.1h-4.2" />
  </Icon>
);

export const MicIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="9.2" y="3" width="5.6" height="11" rx="2.8" />
    <path d="M5.8 11.4a6.2 6.2 0 0 0 12.4 0" />
    <path d="M12 17.6V21" />
  </Icon>
);

export const ArrowDownIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 4.8v14.4" />
    <path d="m5.8 13 6.2 6.2L18.2 13" />
  </Icon>
);

export const ArrowUpRightIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M7 17 17 7" />
    <path d="M8.4 7H17v8.6" />
  </Icon>
);

export const PencilIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M16.2 3.9a2.3 2.3 0 0 1 3.3 3.3L8 18.7l-4.3 1 1-4.3L16.2 3.9Z" />
  </Icon>
);

export const ShareIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 15.4V3.8" />
    <path d="M8.2 7.6 12 3.8l3.8 3.8" />
    <path d="M4.6 13.6v4.8a2 2 0 0 0 2 2h10.8a2 2 0 0 0 2-2v-4.8" />
  </Icon>
);

export const MoreVerticalIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="5.2" r="1.35" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.35" fill="currentColor" stroke="none" />
    <circle cx="12" cy="18.8" r="1.35" fill="currentColor" stroke="none" />
  </Icon>
);

export const CloseIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m5.6 5.6 12.8 12.8M18.4 5.6 5.6 18.4" />
  </Icon>
);

/** Collapse into the dock — two arrows pulling inward. */
export const MinimiseIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20 4.4 14.2 10.2" />
    <path d="M14.2 5.6v4.6h4.6" />
    <path d="M4 19.6 9.8 13.8" />
    <path d="M9.8 18.4v-4.6H5.2" />
  </Icon>
);

/** Expand to full width — two arrows pushing outward. */
export const MaximiseIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M14.4 9.6 20 4" />
    <path d="M15.2 4H20v4.8" />
    <path d="M9.6 14.4 4 20" />
    <path d="M8.8 20H4v-4.8" />
  </Icon>
);

export const GridIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="4" y="4" width="6.6" height="6.6" rx="1.6" />
    <rect x="13.4" y="4" width="6.6" height="6.6" rx="1.6" />
    <rect x="4" y="13.4" width="6.6" height="6.6" rx="1.6" />
    <rect x="13.4" y="13.4" width="6.6" height="6.6" rx="1.6" />
  </Icon>
);

export const CreditIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.4" />
    <circle cx="12" cy="12" r="3.2" />
  </Icon>
);

/** Speak — a compact live waveform. */
export const WaveformIcon = ({ size = 18, ...rest }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" {...rest}>
    {[
      { x: 3.2, h: 6 },
      { x: 6.6, h: 12 },
      { x: 10, h: 17 },
      { x: 13.4, h: 11 },
      { x: 16.8, h: 15 },
      { x: 20.2, h: 7 },
    ].map((b) => (
      <rect
        key={b.x}
        x={b.x}
        y={12 - b.h / 2}
        width="1.9"
        height={b.h}
        rx="0.95"
        fill="currentColor"
      />
    ))}
  </svg>
);

export const SendIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 19.2V4.8" />
    <path d="M5.8 11 12 4.8 18.2 11" />
  </Icon>
);

export const CheckIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m5 12.6 4.6 4.6L19 7.8" />
  </Icon>
);

export const SlidersIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 8h10M18 8h2M4 16h4M12 16h8" />
    <circle cx="16" cy="8" r="2.2" />
    <circle cx="10" cy="16" r="2.2" />
  </Icon>
);
