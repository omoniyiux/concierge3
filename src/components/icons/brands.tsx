/* ------------------------------------------------------------------
   Connector brand marks. Drawn inline so the workspace never waits
   on a third-party asset host, and so they stay crisp at any size.
   ------------------------------------------------------------------ */

type P = { size?: number; className?: string };
const box = (size: number) => ({ width: size, height: size, viewBox: "0 0 48 48" });

export function GmailMark({ size = 26, className }: P) {
  return (
    <svg {...box(size)} className={className} aria-hidden="true">
      <path d="M6 12.8 24 26 42 12.8V36a2 2 0 0 1-2 2h-4V21.5L24 30.4 12 21.5V38H8a2 2 0 0 1-2-2V12.8Z" fill="#4285F4" />
      <path d="M6 12.8V36a2 2 0 0 0 2 2h4V21.5L6 12.8Z" fill="#1967D2" />
      <path d="M42 12.8V36a2 2 0 0 1-2 2h-4V21.5l6-8.7Z" fill="#34A853" />
      <path d="M12 38V21.5L24 30.4l12-8.9V38h-4.6l-7.4-5.5L16.6 38H12Z" fill="#EA4335" />
      <path d="M6 12.8V10a2.9 2.9 0 0 1 4.7-2.3L24 17.4 37.3 7.7A2.9 2.9 0 0 1 42 10v2.8L24 26 6 12.8Z" fill="#FBBC04" />
      <path d="M6 12.8V10a2.9 2.9 0 0 1 4.7-2.3L24 17.4 12 26.2 6 12.8Z" fill="#C5221F" />
    </svg>
  );
}

export function GoogleCalendarMark({ size = 26, className }: P) {
  return (
    <svg {...box(size)} className={className} aria-hidden="true">
      <rect x="7" y="7" width="34" height="34" rx="4" fill="#fff" />
      <path d="M41 16H7v-5a4 4 0 0 1 4-4h26a4 4 0 0 1 4 4v5Z" fill="#4285F4" />
      <path d="M41 32v5a4 4 0 0 1-4 4H11a4 4 0 0 1-4-4v-5h34Z" fill="#188038" />
      <path d="M7 16h34v16H7z" fill="#fff" />
      <path d="M7 16v16h8V16H7Z" fill="#1967D2" opacity=".12" />
      <text x="24" y="29.5" textAnchor="middle" fontFamily="system-ui, Arial" fontSize="14" fontWeight="700" fill="#4285F4">
        31
      </text>
      <rect x="7" y="7" width="34" height="34" rx="4" fill="none" stroke="#E4E4E4" strokeWidth="1" />
    </svg>
  );
}

export function AppleCalendarMark({ size = 26, className }: P) {
  return (
    <svg {...box(size)} className={className} aria-hidden="true">
      <rect x="7" y="7" width="34" height="34" rx="6" fill="#fff" stroke="#E0E0E0" />
      <path d="M7 13a6 6 0 0 1 6-6h22a6 6 0 0 1 6 6v3H7v-3Z" fill="#FF3B30" />
      <text x="24" y="15" textAnchor="middle" fontFamily="system-ui, Arial" fontSize="6" fontWeight="700" fill="#fff">
        JUL
      </text>
      <text x="24" y="34" textAnchor="middle" fontFamily="system-ui, Arial" fontSize="16" fontWeight="500" fill="#111">
        17
      </text>
    </svg>
  );
}

export function OutlookCalendarMark({ size = 26, className }: P) {
  return (
    <svg {...box(size)} className={className} aria-hidden="true">
      <rect x="18" y="9" width="23" height="30" rx="2.4" fill="#0F6CBD" />
      <rect x="21.5" y="13" width="16" height="4.6" rx="1" fill="#fff" opacity=".55" />
      <rect x="21.5" y="20" width="16" height="15" rx="1.4" fill="#fff" opacity=".85" />
      <rect x="6" y="12" width="20" height="24" rx="3.2" fill="#0358A7" />
      <text x="16" y="29" textAnchor="middle" fontFamily="system-ui, Arial" fontSize="13" fontWeight="700" fill="#fff">
        O
      </text>
    </svg>
  );
}

export function OutlookMailMark({ size = 26, className }: P) {
  return (
    <svg {...box(size)} className={className} aria-hidden="true">
      <path d="M22 12 42 9v30l-20-3V12Z" fill="#1B84D9" />
      <path d="M22 20 43 14v20l-21-6V20Z" fill="#0F6CBD" />
      <rect x="5" y="13" width="20" height="22" rx="3.4" fill="#0358A7" />
      <text x="15" y="29" textAnchor="middle" fontFamily="system-ui, Arial" fontSize="12.5" fontWeight="700" fill="#fff">
        O
      </text>
    </svg>
  );
}

export function InstagramMark({ size = 26, className }: P) {
  return (
    <svg {...box(size)} className={className} aria-hidden="true">
      <defs>
        <radialGradient id="ig" cx="30%" cy="107%" r="150%">
          <stop offset="0" stopColor="#FDD649" />
          <stop offset=".25" stopColor="#F7743B" />
          <stop offset=".5" stopColor="#E9366F" />
          <stop offset=".75" stopColor="#B429A5" />
          <stop offset="1" stopColor="#5B4FE9" />
        </radialGradient>
      </defs>
      <rect x="6" y="6" width="36" height="36" rx="11" fill="url(#ig)" />
      <rect x="13.5" y="13.5" width="21" height="21" rx="7" fill="none" stroke="#fff" strokeWidth="2.6" />
      <circle cx="24" cy="24" r="5.6" fill="none" stroke="#fff" strokeWidth="2.6" />
      <circle cx="32.6" cy="15.6" r="1.9" fill="#fff" />
    </svg>
  );
}

export function FacebookMark({ size = 26, className }: P) {
  return (
    <svg {...box(size)} className={className} aria-hidden="true">
      <rect x="6" y="6" width="36" height="36" rx="9" fill="#1877F2" />
      <path
        d="M29.6 25.4h-3.9V38h-5.2V25.4h-2.8v-4.6h2.8v-3.2c0-3.3 1.9-5.4 5.7-5.4h3.4v4.6h-2.1c-1.2 0-1.8.5-1.8 1.7v2.3h4l-.6 4.6Z"
        fill="#fff"
      />
    </svg>
  );
}

export function LinkedInMark({ size = 26, className }: P) {
  return (
    <svg {...box(size)} className={className} aria-hidden="true">
      <rect x="6" y="6" width="36" height="36" rx="8" fill="#0A66C2" />
      <circle cx="15.4" cy="16.2" r="3.1" fill="#fff" />
      <rect x="12.8" y="21.2" width="5.2" height="15" fill="#fff" />
      <path
        d="M21.6 21.2h5v2.1a5.4 5.4 0 0 1 4.8-2.5c4 0 5.6 2.6 5.6 6.8v8.6h-5.2v-7.8c0-2-.7-3.2-2.4-3.2-1.5 0-2.4 1-2.8 2a4 4 0 0 0-.1 1.4v7.6h-5.2s.1-13 .3-15Z"
        fill="#fff"
      />
    </svg>
  );
}

export function GoogleDriveMark({ size = 26, className }: P) {
  return (
    <svg {...box(size)} className={className} aria-hidden="true">
      <path d="m18.4 6 12.6 21.8H43L30.4 6H18.4Z" fill="#FFCF63" />
      <path d="M5 33.4 11.2 44h25.6L43 33.4H5Z" fill="#4285F4" />
      <path d="M11.2 44 24 21.8 17.8 11 5 33.4 11.2 44Z" fill="#2A9E4B" />
      <path d="m18.4 6-7 12.2L17.8 29 24.9 17 18.4 6Z" fill="#0F9D58" opacity=".18" />
    </svg>
  );
}

export function GoogleSheetsMark({ size = 26, className }: P) {
  return (
    <svg {...box(size)} className={className} aria-hidden="true">
      <path d="M12 5h16l10 10v26a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" fill="#0F9D58" />
      <path d="M28 5l10 10H30a2 2 0 0 1-2-2V5Z" fill="#57BB8A" />
      <rect x="16" y="20" width="16" height="14" rx="1.2" fill="#fff" />
      <path d="M16 25h16M16 29.5h16M21.4 20v14M26.6 20v14" stroke="#0F9D58" strokeWidth="1.3" />
    </svg>
  );
}

export function GoogleDocsMark({ size = 26, className }: P) {
  return (
    <svg {...box(size)} className={className} aria-hidden="true">
      <path d="M12 5h16l10 10v26a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" fill="#4285F4" />
      <path d="M28 5l10 10H30a2 2 0 0 1-2-2V5Z" fill="#A0C3FF" />
      <path d="M16.4 22h15.2M16.4 26.4h15.2M16.4 30.8h10.4" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function YouTubeMark({ size = 26, className }: P) {
  return (
    <svg {...box(size)} className={className} aria-hidden="true">
      <rect x="4" y="11" width="40" height="26" rx="7" fill="#FF0000" />
      <path d="M20 18.6v10.8L29.6 24 20 18.6Z" fill="#fff" />
    </svg>
  );
}

export function GoogleAnalyticsMark({ size = 26, className }: P) {
  return (
    <svg {...box(size)} className={className} aria-hidden="true">
      <rect x="31" y="7" width="10" height="34" rx="5" fill="#F9AB00" />
      <rect x="19" y="18" width="10" height="23" rx="5" fill="#E37400" />
      <rect x="7" y="29" width="10" height="12" rx="5" fill="#E37400" />
    </svg>
  );
}

export function SearchConsoleMark({ size = 26, className }: P) {
  return (
    <svg {...box(size)} className={className} aria-hidden="true">
      <rect x="8" y="26" width="7" height="14" rx="1.6" fill="#5F6368" />
      <rect x="20.5" y="18" width="7" height="22" rx="1.6" fill="#4285F4" />
      <rect x="33" y="10" width="7" height="30" rx="1.6" fill="#F9AB00" />
    </svg>
  );
}

export function GoogleMapsMark({ size = 26, className }: P) {
  return (
    <svg {...box(size)} className={className} aria-hidden="true">
      <path d="M24 5c-6.6 0-12 5.3-12 11.9C12 26.4 24 43 24 43s12-16.6 12-26.1C36 10.3 30.6 5 24 5Z" fill="#EA4335" />
      <path d="M24 5c-3.4 0-6.5 1.4-8.7 3.7l16.1 16.6c2.7-4.5 4.6-8.6 4.6-11.4C36 10.3 30.6 5 24 5Z" fill="#FBBC04" />
      <path d="M15.3 8.7A11.8 11.8 0 0 0 12 16.9c0 3 2 7.4 4.9 12.2l7.4-9.5-9-10.9Z" fill="#34A853" />
      <circle cx="24" cy="17" r="4.6" fill="#1A73E8" />
    </svg>
  );
}

export function GoogleMeetMark({ size = 26, className }: P) {
  return (
    <svg {...box(size)} className={className} aria-hidden="true">
      <path d="M6 16a3 3 0 0 1 3-3h17v22H9a3 3 0 0 1-3-3V16Z" fill="#00832D" />
      <path d="M26 13v9l7 5.5V19l-7-6Z" fill="#0066DA" />
      <path d="M26 22v13l7-5.5V27.5L26 22Z" fill="#E94235" />
      <path d="M33 19v10l6.4 4.6c1 .7 2.6 0 2.6-1.4V15.8c0-1.4-1.6-2.1-2.6-1.4L33 19Z" fill="#FFBA00" />
    </svg>
  );
}

export function NotionMark({ size = 26, className }: P) {
  return (
    <svg {...box(size)} className={className} aria-hidden="true">
      <rect x="6" y="6" width="36" height="36" rx="6" fill="#fff" stroke="#E0E0E0" />
      <path
        d="M15 15.6v17l3.6-.3V21.4l8.4 11.4 4-.4V15.5l-3.4.3v10.6L19.6 15.3l-4.6.3Z"
        fill="#111"
      />
    </svg>
  );
}

export function ZoomMark({ size = 26, className }: P) {
  return (
    <svg {...box(size)} className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="18" fill="#0B5CFF" />
      <path d="M15 19.4a1.6 1.6 0 0 1 1.6-1.6h9.6a3.4 3.4 0 0 1 3.4 3.4v6.4a1.6 1.6 0 0 1-1.6 1.6h-9.6a3.4 3.4 0 0 1-3.4-3.4v-6.4Z" fill="#fff" />
      <path d="m30.6 23.4 4.4-3.3v7.8l-4.4-3.3v-1.2Z" fill="#fff" />
    </svg>
  );
}

export function GitHubMark({ size = 26, className }: P) {
  return (
    <svg {...box(size)} className={className} aria-hidden="true">
      <path
        d="M24 5C13.5 5 5 13.5 5 24a19 19 0 0 0 13 18c1 .2 1.3-.4 1.3-.9v-3.3c-5.3 1.2-6.4-2.3-6.4-2.3-.9-2.2-2.1-2.8-2.1-2.8-1.8-1.2.1-1.2.1-1.2 1.9.2 3 2 3 2 1.7 3 4.5 2.1 5.6 1.6.2-1.3.7-2.1 1.3-2.6-4.3-.5-8.8-2.1-8.8-9.5 0-2.1.8-3.9 2-5.2-.2-.5-.9-2.5.2-5.2 0 0 1.6-.5 5.3 2a18.3 18.3 0 0 1 9.6 0c3.7-2.5 5.3-2 5.3-2 1.1 2.7.4 4.7.2 5.2 1.2 1.3 2 3.1 2 5.2 0 7.4-4.5 9-8.8 9.5.7.6 1.3 1.8 1.3 3.6v5.3c0 .5.4 1.1 1.3.9A19 19 0 0 0 43 24C43 13.5 34.5 5 24 5Z"
        fill="#181717"
      />
    </svg>
  );
}

export function CalendlyMark({ size = 26, className }: P) {
  return (
    <svg {...box(size)} className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="18" fill="#006BFF" />
      <path
        d="M31.8 29.6c-1.8 2.3-4.4 3.7-7.6 3.7-5.4 0-9.4-4-9.4-9.3s4-9.3 9.4-9.3c3.2 0 5.8 1.4 7.6 3.7"
        fill="none"
        stroke="#fff"
        strokeWidth="3.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function GoogleAdsMark({ size = 26, className }: P) {
  return (
    <svg {...box(size)} className={className} aria-hidden="true">
      <rect x="4.5" y="16" width="26" height="12.5" rx="6.25" transform="rotate(-60 4.5 16)" fill="#FBBC04" />
      <rect x="15" y="9.5" width="26" height="12.5" rx="6.25" transform="rotate(60 15 9.5)" fill="#4285F4" />
      <circle cx="14.4" cy="34.6" r="6.4" fill="#34A853" />
    </svg>
  );
}

export function WixMark({ size = 26, className }: P) {
  return (
    <svg {...box(size)} className={className} aria-hidden="true">
      <text
        x="24"
        y="30"
        textAnchor="middle"
        fontFamily="system-ui, Arial"
        fontSize="15"
        fontWeight="800"
        fill="#111"
        letterSpacing="-0.5"
      >
        WIX
      </text>
    </svg>
  );
}

export function ClaudeMark({ size = 26, className }: P) {
  return (
    <svg {...box(size)} className={className} aria-hidden="true">
      <g stroke="#D97757" strokeWidth="3.1" strokeLinecap="round">
        <path d="M24 9v30M9 24h30M13.4 13.4l21.2 21.2M34.6 13.4 13.4 34.6" />
      </g>
    </svg>
  );
}

export function WhatsAppBrandMark({ size = 26, className }: P) {
  return (
    <svg {...box(size)} className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="18" fill="#25D366" />
      <path
        d="M31.5 27.3c-.4-.2-2.4-1.2-2.8-1.3-.4-.2-.6-.2-.9.2s-1 1.3-1.3 1.6c-.2.3-.5.3-.9.1-.4-.2-1.7-.6-3.3-2-1.2-1.1-2-2.4-2.3-2.8-.2-.4 0-.6.2-.8l.6-.7c.2-.3.3-.4.4-.7.1-.3 0-.5 0-.7l-1.3-3c-.3-.8-.6-.7-.9-.7h-.8c-.3 0-.7.1-1.1.5-.4.4-1.4 1.4-1.4 3.4s1.5 3.9 1.7 4.2c.2.3 2.9 4.4 7 6.2 3.9 1.7 3.9 1.1 4.7 1 .7-.1 2.4-1 2.7-1.9.3-.9.3-1.8.2-1.9-.1-.2-.4-.3-.8-.5Z"
        fill="#fff"
      />
    </svg>
  );
}

export function AppsWebMark({ size = 26, className }: P) {
  return (
    <svg {...box(size)} className={className} aria-hidden="true">
      <rect x="9" y="9" width="12.5" height="12.5" rx="3" fill="#5F6368" />
      <rect x="26.5" y="9" width="12.5" height="12.5" rx="3" fill="#5F6368" />
      <rect x="9" y="26.5" width="12.5" height="12.5" rx="3" fill="#5F6368" />
      <rect x="26.5" y="26.5" width="12.5" height="12.5" rx="3" fill="#5F6368" />
    </svg>
  );
}

export function ExcelMark({ size = 26, className }: P) {
  return (
    <svg {...box(size)} className={className} aria-hidden="true">
      <path d="M18 5h16l8 8v28a2 2 0 0 1-2 2H18a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" fill="#fff" stroke="#E0E0E0" />
      <rect x="5" y="12" width="22" height="24" rx="3" fill="#107C41" />
      <path d="M11 18.5 20.6 29.5M20.6 18.5 11 29.5" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export function SquareMark({ size = 26, className }: P) {
  return (
    <svg {...box(size)} className={className} aria-hidden="true">
      <rect x="7" y="7" width="34" height="34" rx="7" fill="#111" />
      <rect x="18" y="18" width="12" height="12" rx="2.4" fill="#fff" />
    </svg>
  );
}

export function GoogleTasksMark({ size = 26, className }: P) {
  return (
    <svg {...box(size)} className={className} aria-hidden="true">
      <rect x="7" y="7" width="34" height="34" rx="8" fill="#2684FC" />
      <path d="m15.5 24.5 5.4 5.4L33 18.4" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function AppStoreBadge({ className }: { className?: string }) {
  return (
    <svg width="124" height="41" viewBox="0 0 124 41" className={className} role="img" aria-label="Download on the App Store">
      <rect width="124" height="41" rx="7" fill="#000" />
      <path
        d="M27.3 20.9c0-2.4 2-3.6 2.1-3.6-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.1-.8-1.6 0-3.1.9-3.9 2.4-1.7 2.9-.4 7.2 1.2 9.5.8 1.2 1.7 2.4 3 2.4 1.2 0 1.6-.8 3.1-.8 1.4 0 1.8.8 3.1.8 1.3 0 2.1-1.2 2.9-2.3.9-1.3 1.3-2.6 1.3-2.7 0 0-2.5-1-2.5-3.9Zm-2.4-7.2c.7-.8 1.1-2 1-3.1-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4Z"
        fill="#fff"
      />
      <text x="40" y="16.5" fontFamily="system-ui, Arial" fontSize="8" fill="#fff">
        Download on the
      </text>
      <text x="40" y="30" fontFamily="system-ui, Arial" fontSize="15" fontWeight="600" fill="#fff">
        App Store
      </text>
    </svg>
  );
}

export function GooglePlayBadge({ className }: { className?: string }) {
  return (
    <svg width="140" height="41" viewBox="0 0 140 41" className={className} role="img" aria-label="Get it on Google Play">
      <rect width="140" height="41" rx="7" fill="#000" />
      <path d="M14 9.6c-.3.3-.4.8-.4 1.4v19c0 .6.1 1.1.4 1.4l.1.1 10.6-10.6v-.3L14.1 9.6H14Z" fill="#00A0FF" />
      <path d="m28.3 24.5-3.5-3.5v-.3l3.5-3.5.1.1 4.2 2.4c1.2.7 1.2 1.8 0 2.5l-4.3 2.3Z" fill="#FFBC00" />
      <path d="M28.4 24.4 24.8 20.8 14 31.6c.4.4 1.1.5 1.8.1l12.6-7.3" fill="#FF3A44" />
      <path d="M28.4 17.2 15.8 10c-.7-.4-1.4-.4-1.8.1l10.8 10.7 3.6-3.6Z" fill="#00D26A" />
      <text x="44" y="16" fontFamily="system-ui, Arial" fontSize="8" fill="#fff">
        GET IT ON
      </text>
      <text x="44" y="30" fontFamily="system-ui, Arial" fontSize="15" fontWeight="600" fill="#fff">
        Google Play
      </text>
    </svg>
  );
}
