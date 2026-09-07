import type { Metadata, Viewport } from "next";
import { Source_Serif_4, Wix_Madefor_Display, Wix_Madefor_Text } from "next/font/google";
import "./globals.css";
import { WorkspaceProvider } from "@/lib/workspace";
import { AppShell } from "@/components/shell/AppShell";

const madeforDisplay = Wix_Madefor_Display({
  variable: "--font-madefor-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const madeforText = Wix_Madefor_Text({
  variable: "--font-madefor-text",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

/** The editorial counterpoint used in Symphony's failure and pulse cards. */
const serifAccent = Source_Serif_4({
  variable: "--font-serif-accent",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Symphony",
  description:
    "Symphony is an AI-powered operating system for running your business. Talk to Maestro, delegate to specialist agents, approve the work, see the results.",
  icons: { icon: "/symphony-logo.png", apple: "/symphony-logo.png" },
};

export const viewport: Viewport = {
  themeColor: "#F3F3F3",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${madeforDisplay.variable} ${madeforText.variable} ${serifAccent.variable}`}>
      <body>
        <a
          href="#workspace"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <WorkspaceProvider>
          <AppShell>{children}</AppShell>
        </WorkspaceProvider>
      </body>
    </html>
  );
}
