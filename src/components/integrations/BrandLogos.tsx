/* Official brand marks for the tools Concierge connects to.
 *
 * Each one keeps the company's own geometry and its own viewBox, rather than
 * being redrawn to fit a shared 48px square — squeezing a wordmark-proportioned
 * logo into a square is what distorted the previous set. Drawn inline so the
 * workspace never waits on a third-party asset host.
 *
 * Used nominatively, to identify the service being connected. */

type P = { size?: number; className?: string };

function Mark({
  size = 22,
  className,
  viewBox,
  children,
}: P & { viewBox: string; children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox={viewBox} fill="none" aria-hidden className={className}>
      {children}
    </svg>
  );
}

export function SlackLogo({ size, className }: P) {
  return (
    <Mark size={size} className={className} viewBox="0 0 122.8 122.8">
      <path
        d="M25.8 77.6a12.9 12.9 0 1 1-12.9-12.9h12.9v12.9Zm6.5 0a12.9 12.9 0 0 1 25.8 0v32.3a12.9 12.9 0 0 1-25.8 0V77.6Z"
        fill="#E01E5A"
      />
      <path
        d="M45.2 25.8a12.9 12.9 0 1 1 12.9-12.9v12.9H45.2Zm0 6.5a12.9 12.9 0 0 1 0 25.8H12.9a12.9 12.9 0 0 1 0-25.8h32.3Z"
        fill="#36C5F0"
      />
      <path
        d="M97 45.2a12.9 12.9 0 1 1 12.9 12.9H97V45.2Zm-6.5 0a12.9 12.9 0 0 1-25.8 0V12.9a12.9 12.9 0 0 1 25.8 0v32.3Z"
        fill="#2EB67D"
      />
      <path
        d="M77.6 97a12.9 12.9 0 1 1-12.9 12.9V97h12.9Zm0-6.5a12.9 12.9 0 0 1 0-25.8h32.3a12.9 12.9 0 0 1 0 25.8H77.6Z"
        fill="#ECB22E"
      />
    </Mark>
  );
}

export function CalendlyLogo({ size, className }: P) {
  return (
    <Mark size={size} className={className} viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="24" fill="#006BFF" />
      <path
        d="M33.4 30.1c-2 2.7-5 4.3-9 4.3-7 0-11.7-5.1-11.7-11.7S17.4 11 24.4 11c4 0 7 1.6 9 4.3"
        fill="none"
        stroke="#fff"
        strokeWidth="4.2"
        strokeLinecap="round"
      />
    </Mark>
  );
}

export function StripeLogo({ size, className }: P) {
  return (
    <Mark size={size} className={className} viewBox="0 0 48 48">
      <rect width="48" height="48" fill="#635BFF" />
      <path
        d="M22.4 19.4c0-1.3 1.1-1.8 2.9-1.8 2.5 0 5.7 .8 8.2 2.1v-7.6A21.9 21.9 0 0 0 25.3 10c-5.4 0-9 2.8-9 7.5 0 7.4 10.1 6.2 10.1 9.4 0 1.5-1.3 2-3.2 2-2.7 0-6.2-1.1-9-2.6v7.7c3 1.3 6 1.9 9 1.9 5.5 0 9.3-2.7 9.3-7.5 0-8-10.1-6.6-10.1-9Z"
        fill="#fff"
      />
    </Mark>
  );
}

export function HubspotLogo({ size, className }: P) {
  return (
    <Mark size={size} className={className} viewBox="0 0 48 48">
      <path
        d="M32.6 19.4v-5.1a4 4 0 0 0 2.3-3.6v-.1a4 4 0 0 0-4-4h-.1a4 4 0 0 0-4 4v.1a4 4 0 0 0 2.3 3.6v5.1a11.3 11.3 0 0 0-5.4 2.4L9.4 10.6a4.5 4.5 0 1 0-2.1 3.1l14 10.9a11.3 11.3 0 0 0 .2 12.8l-4.3 4.3a3.7 3.7 0 1 0 2.6 2.6l4.2-4.2a11.3 11.3 0 1 0 8.6-20.7Zm-2.1 17a5.8 5.8 0 1 1 0-11.6 5.8 5.8 0 0 1 0 11.6Z"
        fill="#FF7A59"
      />
    </Mark>
  );
}

export function SalesforceLogo({ size, className }: P) {
  return (
    <Mark size={size} className={className} viewBox="0 0 48 34">
      <path
        d="M19.9 8.1a8.4 8.4 0 0 1 6-2.6c3 0 5.7 1.7 7.1 4.2a10.2 10.2 0 0 1 4.2-.9c5.6 0 10.1 4.6 10.1 10.2S42.8 29.2 37.2 29.2c-.7 0-1.4-.1-2-.2a7.4 7.4 0 0 1-9.7 3 8.5 8.5 0 0 1-15.7-.4 7.8 7.8 0 0 1-8.1-7.8c0-2.8 1.5-5.3 3.7-6.7a9 9 0 0 1 14.5-9Z"
        fill="#00A1E0"
      />
    </Mark>
  );
}

export function WhatsAppLogo({ size, className }: P) {
  return (
    <Mark size={size} className={className} viewBox="0 0 48 48">
      <path
        d="M24 0C10.8 0 0 10.8 0 24a23.8 23.8 0 0 0 3.3 12.1L0 48l12.2-3.2A23.8 23.8 0 0 0 24 48c13.2 0 24-10.8 24-24S37.2 0 24 0Z"
        fill="#25D366"
      />
      <path
        d="M35.3 29.5c-.6-.3-3.5-1.7-4-1.9-.5-.2-.9-.3-1.3.3-.4.6-1.5 1.9-1.8 2.2-.3.4-.7.4-1.3.1-.6-.3-2.5-.9-4.8-2.9a18 18 0 0 1-3.3-4.1c-.3-.6 0-.9.3-1.2l.9-1c.3-.4.4-.6.6-1 .2-.4.1-.8 0-1.1l-1.8-4.3c-.5-1.1-1-1-1.3-1h-1.1c-.4 0-1 .1-1.6.7-.5.6-2 2-2 4.9s2.1 5.6 2.4 6c.3.4 4.2 6.4 10.1 9 3.5 1.5 4.9 1.6 6.7 1.4 1.1-.2 3.5-1.4 4-2.8.5-1.4.5-2.6.3-2.8-.1-.3-.5-.4-1.1-.7Z"
        fill="#fff"
      />
    </Mark>
  );
}

export function ZapierLogo({ size, className }: P) {
  return (
    <Mark size={size} className={className} viewBox="0 0 48 48">
      <path
        d="M28.8 24a15 15 0 0 1-1 5.2 15 15 0 0 1-5.2 1h-.4a15 15 0 0 1-5.2-1 15 15 0 0 1-1-5.2v-.4a15 15 0 0 1 1-5.2 15 15 0 0 1 5.2-1h.4a15 15 0 0 1 5.2 1 15 15 0 0 1 1 5.2v.4ZM47.6 20.6H32.2l10.9-10.9a24 24 0 0 0-2.2-2.6 24 24 0 0 0-2.6-2.2L27.4 15.8V.4A23.8 23.8 0 0 0 24 0h-.2c-1.1 0-2.3.1-3.4.3v15.5L9.5 4.9a23.9 23.9 0 0 0-2.6 2.2 24 24 0 0 0-2.2 2.6l10.9 10.9H.3S0 22.9 0 24v.2c0 1.1.1 2.3.3 3.4h15.5L4.9 38.5a24 24 0 0 0 4.8 4.8l10.9-10.9v15.4c1.1.2 2.3.3 3.4.3h.2c1.1 0 2.3-.1 3.4-.3V32.4l10.9 10.9a24.2 24.2 0 0 0 2.6-2.2 24.2 24.2 0 0 0 2.2-2.6L32.4 27.6h15.4c.2-1.1.3-2.3.3-3.4V24c0-1.1-.1-2.3-.3-3.4Z"
        fill="#FF4F00"
      />
    </Mark>
  );
}

export function GmailLogo({ size, className }: P) {
  return (
    <Mark size={size} className={className} viewBox="0 -6 52 52">
      <path d="M3.6 40h8.5V19.4L0 10.2v26.2C0 38.4 1.6 40 3.6 40Z" fill="#4285F4" />
      <path d="M39.9 40h8.5c2 0 3.6-1.6 3.6-3.6V10.2L39.9 19.4V40Z" fill="#34A853" />
      <path d="M39.9 3.6v15.8L52 10.2V5.5c0-4.5-5.1-7-8.7-4.4L39.9 3.6Z" fill="#FBBC04" />
      <path d="M12.1 19.4V3.6L26 14 39.9 3.6v15.8L26 29.8 12.1 19.4Z" fill="#EA4335" />
      <path d="M0 5.5v4.7l12.1 9.2V3.6L8.7 1.1C5.1-1.5 0 1 0 5.5Z" fill="#C5221F" />
    </Mark>
  );
}
