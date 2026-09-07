import type { Metadata, Viewport } from "next";
import { Inter_Tight, JetBrains_Mono, Newsreader } from "next/font/google";
import "./globals.css";
import { WorkspaceProvider } from "@/lib/workspace";

/* Concierge's own brand faces, matching poweredbyconcierge.com. */
const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Concierge", template: "%s · Concierge" },
  description:
    "Concierge turns an ordinary website into a smart site. It learns your business, answers visitor questions from approved knowledge, completes actions and routes high-intent visitors to the right person.",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#FAFAF8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${interTight.variable} ${newsreader.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <a
          href="#workspace"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-text-inverse"
        >
          Skip to content
        </a>
        <WorkspaceProvider>{children}</WorkspaceProvider>
      </body>
    </html>
  );
}
