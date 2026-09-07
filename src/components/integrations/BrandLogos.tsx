/* Recognisable marks for the tools Concierge connects to, drawn inline so the
 workspace never waits on a third-party asset host. */

type P = { size?: number; className?: string };
const box = (s: number) => ({ width: s, height: s, viewBox: "0 0 48 48", "aria-hidden": true as const });

export function SlackLogo({ size = 22, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <path
        d="M13 29.4a3.9 3.9 0 1 1-3.9-3.9H13v3.9Zm2 0a3.9 3.9 0 0 1 7.8 0v9.7a3.9 3.9 0 0 1-7.8 0v-9.7Z"
        fill="#E01E5A"
      />
      <path
        d="M18.9 13a3.9 3.9 0 1 1 3.9-3.9V13h-3.9Zm0 2a3.9 3.9 0 0 1 0 7.8H9.1a3.9 3.9 0 0 1 0-7.8h9.8Z"
        fill="#36C5F0"
      />
      <path
        d="M35 18.9a3.9 3.9 0 1 1 3.9 3.9H35v-3.9Zm-2 0a3.9 3.9 0 0 1-7.8 0V9.1a3.9 3.9 0 0 1 7.8 0v9.8Z"
        fill="#2EB67D"
      />
      <path
        d="M29.1 35a3.9 3.9 0 1 1-3.9 3.9V35h3.9Zm0-2a3.9 3.9 0 0 1 0-7.8h9.8a3.9 3.9 0 0 1 0 7.8h-9.8Z"
        fill="#ECB22E"
      />
    </svg>
  );
}

export function CalendlyLogo({ size = 22, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <circle cx="24" cy="24" r="19" fill="#006BFF" />
      <path
        d="M32.6 30.4a10.4 10.4 0 0 1-8.6 4.4c-6 0-10.4-4.6-10.4-10.8S18 13.2 24 13.2a10.4 10.4 0 0 1 8.6 4.4"
        fill="none"
        stroke="#fff"
        strokeWidth="3.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function StripeLogo({ size = 22, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <rect x="5" y="5" width="38" height="38" rx="8" fill="#635BFF" />
      <path
        d="M23.4 19.9c0-1.1 1-1.6 2.5-1.6a15 15 0 0 1 5.6 1.4v-5a15.6 15.6 0 0 0-5.6-1c-4.6 0-7.7 2.4-7.7 6.4 0 6.2 8.6 5.2 8.6 7.9 0 1.3-1.1 1.7-2.7 1.7-2 0-4.5-.8-6.4-1.9v5.1a16.5 16.5 0 0 0 6.4 1.3c4.7 0 8-2.3 8-6.4 0-6.7-8.7-5.5-8.7-7.9Z"
        fill="#fff"
      />
    </svg>
  );
}

export function HubspotLogo({ size = 22, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <circle cx="24" cy="24" r="19" fill="#FF7A59" />
      <path
        d="M31 20.5V16a2.8 2.8 0 1 0-3 0v4.5a8 8 0 0 0-3.4 1.4l-8-6.2a3 3 0 1 0-1.7 2.3l7.8 6a7.9 7.9 0 1 0 8.3-3.5Zm-3.3 12.9a4.2 4.2 0 1 1 0-8.4 4.2 4.2 0 0 1 0 8.4Z"
        fill="#fff"
      />
    </svg>
  );
}

export function SalesforceLogo({ size = 22, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <path
        d="M20 14a7 7 0 0 1 11.6-2.1A8.4 8.4 0 0 1 43 19.6a8.2 8.2 0 0 1-8.4 8.2h-.7a6.6 6.6 0 0 1-9.6 2.6A7.5 7.5 0 0 1 11.3 33 8.2 8.2 0 0 1 5 25.1a8 8 0 0 1 4.4-7.1A7.6 7.6 0 0 1 20 14Z"
        fill="#00A1E0"
      />
    </svg>
  );
}

export function WhatsAppLogo({ size = 22, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <circle cx="24" cy="24" r="19" fill="#25D366" />
      <path
        d="M31.5 27.3c-.4-.2-2.4-1.2-2.8-1.3-.4-.2-.6-.2-.9.2s-1 1.3-1.3 1.6c-.2.3-.5.3-.9.1-.4-.2-1.7-.6-3.3-2-1.2-1.1-2-2.4-2.3-2.8-.2-.4 0-.6.2-.8l.6-.7c.2-.3.3-.4.4-.7.1-.3 0-.5 0-.7l-1.3-3c-.3-.8-.6-.7-.9-.7h-.8c-.3 0-.7.1-1.1.5-.4.4-1.4 1.4-1.4 3.4s1.5 3.9 1.7 4.2c.2.3 2.9 4.4 7 6.2 3.9 1.7 3.9 1.1 4.7 1 .7-.1 2.4-1 2.7-1.9.3-.9.3-1.8.2-1.9-.1-.2-.4-.3-.8-.5Z"
        fill="#fff"
      />
    </svg>
  );
}

export function ZapierLogo({ size = 22, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <path
        d="M29.4 24a19 19 0 0 1-1.2 6.6 19 19 0 0 1-6.6 1.2h-.2a19 19 0 0 1-6.6-1.2 19 19 0 0 1-1.2-6.6v-.2c0-2.3.4-4.5 1.2-6.6a19 19 0 0 1 6.6-1.2h.2c2.3 0 4.5.4 6.6 1.2.8 2.1 1.2 4.3 1.2 6.6v.2Z"
        fill="#FF4F00"
        transform="translate(2.5 0)"
      />
      <path
        d="M43 20.6h-11l7.8-7.8a19.6 19.6 0 0 0-4.6-4.6L27.4 16V5a19.7 19.7 0 0 0-6.8 0v11l-7.8-7.8a19.6 19.6 0 0 0-4.6 4.6l7.8 7.8H5a19.7 19.7 0 0 0 0 6.8h11l-7.8 7.8a19.6 19.6 0 0 0 4.6 4.6l7.8-7.8v11a19.7 19.7 0 0 0 6.8 0v-11l7.8 7.8a19.6 19.6 0 0 0 4.6-4.6L32 27.4h11a19.7 19.7 0 0 0 0-6.8Z"
        fill="#FF4F00"
        opacity=".92"
      />
    </svg>
  );
}

export function GmailLogo({ size = 22, className }: P) {
  return (
    <svg {...box(size)} className={className}>
      <path
        d="M6 12.8 24 26l18-13.2V36a2 2 0 0 1-2 2h-4V21.5L24 30.4 12 21.5V38H8a2 2 0 0 1-2-2V12.8Z"
        fill="#4285F4"
      />
      <path d="M6 12.8V36a2 2 0 0 0 2 2h4V21.5L6 12.8Z" fill="#1967D2" />
      <path d="M42 12.8V36a2 2 0 0 1-2 2h-4V21.5l6-8.7Z" fill="#34A853" />
      <path d="M12 38V21.5L24 30.4l12-8.9V38h-4.6l-7.4-5.5L16.6 38H12Z" fill="#EA4335" />
      <path
        d="M6 12.8V10a2.9 2.9 0 0 1 4.7-2.3L24 17.4 37.3 7.7A2.9 2.9 0 0 1 42 10v2.8L24 26 6 12.8Z"
        fill="#FBBC04"
      />
    </svg>
  );
}
