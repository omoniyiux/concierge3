import type { ReactNode } from "react";
import { SymphonyMark } from "@/components/icons/SymphonyMark";
import {
  AppsWebMark,
  ClaudeMark,
  GmailMark,
  GoogleCalendarMark,
  WhatsAppBrandMark,
  WixMark,
} from "@/components/icons/brands";

/**
 * The product's core metaphor, drawn once: everything the business runs on
 * routes through Symphony. Solid lines are live; dashed lines are waiting
 * to be connected.
 */
export function ConnectorGraph() {
  return (
    <div className="relative mx-auto h-[386px] w-full max-w-[1010px]" role="img" aria-label="Your tools connect through Symphony. WhatsApp, Claude and Wix are live; Gmail, Calendar, Apps & Web and 66 more are available to connect.">
      <svg
        viewBox="0 0 1010 386"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        {/* Orbit rings — quiet structure, never decoration */}
        <g stroke="#DFDFDF" strokeDasharray="2 7" strokeLinecap="round" fill="none">
          <circle cx="505" cy="193" r="98" />
          <circle cx="505" cy="193" r="152" />
          <circle cx="505" cy="193" r="206" />
        </g>

        {/* Live connections */}
        <g stroke="#111" strokeWidth="1.6" fill="none">
          <path d="M300 150 C 380 150, 400 205, 460 200" />
          <path d="M330 240 C 400 244, 410 214, 458 205" />
          <path d="M552 208 C 620 236, 660 300, 730 300" />
        </g>
        <g fill="#111">
          <circle cx="398" cy="169" r="4.6" />
          <circle cx="381" cy="240" r="4.6" />
          <circle cx="700" cy="292" r="4.6" />
        </g>

        {/* Available connections */}
        <g stroke="#C8C8C8" strokeWidth="1.5" strokeDasharray="3 6" strokeLinecap="round" fill="none">
          <path d="M552 180 C 620 150, 660 108, 725 100" />
          <path d="M556 193 C 640 193, 660 190, 725 190" />
          <path d="M458 214 C 400 236, 380 268, 336 288" />
          <path d="M552 220 C 640 260, 700 330, 762 344" />
          <path d="M452 200 C 380 190, 350 250, 300 262" />
        </g>
        <g fill="#B4B4B4">
          <circle cx="684" cy="193" r="4.2" />
          <circle cx="372" cy="272" r="4.2" />
          <circle cx="642" cy="308" r="4.2" />
        </g>
      </svg>

      {/* Symphony at the centre */}
      <div className="absolute left-1/2 top-[193px] -translate-x-1/2 -translate-y-1/2">
        <SymphonyMark size={102} />
      </div>

      <Node label="WhatsApp" x={258} y={100} live>
        <WhatsAppBrandMark size={30} />
      </Node>
      <Node label="Claude" x={290} y={193} live>
        <ClaudeMark size={26} />
      </Node>
      <Node label="Apps & Web" x={290} y={286} tinted>
        <AppsWebMark size={22} />
      </Node>
      <Node label="Gmail" x={757} y={100} tinted>
        <GmailMark size={26} />
      </Node>
      <Node label="Calendar" x={757} y={193} tinted>
        <GoogleCalendarMark size={30} />
      </Node>
      <Node label="Wix" x={757} y={286} live>
        <WixMark size={30} />
      </Node>

      <CountNode x={258} y={344} count="+3" label="3 more tools connected" />
      <CountNode x={789} y={344} count="+63" label="63 more tools available to connect" />
    </div>
  );
}

function Node({
  label,
  x,
  y,
  children,
  tinted = false,
}: {
  label: string;
  x: number;
  y: number;
  children: ReactNode;
  live?: boolean;
  tinted?: boolean;
}) {
  return (
    <div
      className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2"
      style={{ left: `${(x / 1010) * 100}%`, top: y }}
    >
      <span className="whitespace-nowrap text-[14px] text-text-primary">{label}</span>
      <span
        className={`flex h-[50px] w-[50px] items-center justify-center rounded-full ring-1 ring-line ${
          tinted ? "bg-[#f5f5f5]" : "bg-surface"
        }`}
      >
        {children}
      </span>
    </div>
  );
}

function CountNode({
  x,
  y,
  count,
  label,
}: {
  x: number;
  y: number;
  count: string;
  label: string;
}) {
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${(x / 1010) * 100}%`, top: y }}
    >
      <span
        title={label}
        className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-ink text-[17px] font-semibold text-white"
      >
        {count}
      </span>
    </div>
  );
}
