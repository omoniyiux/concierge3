import type { Metadata, Viewport } from "next";
import { Archivo, JetBrains_Mono, Source_Serif_4, Wix_Madefor_Text } from "next/font/google";
import "./globals.css";
import { WorkspaceProvider } from "@/lib/workspace";

/* Archivo carries the headings — tight, geometric, modern. */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const madeforText = Wix_Madefor_Text({
  variable: "--font-madefor-text",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

/* The editorial counterpoint used in failure and pulse cards. */
const serifAccent = Source_Serif_4({
  variable: "--font-serif-accent",
  subsets: ["latin"],
  weight: ["400"],
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
  themeColor: "#F3F3F3",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${madeforText.variable} ${serifAccent.variable} ${jetbrainsMono.variable}`}
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
