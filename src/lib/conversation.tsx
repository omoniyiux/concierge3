import type { ReactNode } from "react";

export type Message =
  | { id: string; role: "user"; time: string; text: string }
  | { id: string; role: "assistant"; time: string; body: ReactNode; card?: "gmail" };

/**
 * Maestro's replies are broken into short paragraphs — context, then the
 * action, then the question — rather than one wall of text.
 */
export const CONVERSATION: Message[] = [
  {
    id: "m1",
    role: "user",
    time: "8:12 pm",
    text: "Help me set up a space for my business",
  },
  {
    id: "m2",
    role: "assistant",
    time: "8:12 pm",
    body: (
      <>
        <p>
          Happy to set that up, Olaifa! Tell me a bit about your business — what do you do, and
          what&apos;s it called?
        </p>
        <p>
          Also, the fastest way for me to actually learn your world is to connect your Gmail. I&apos;d
          look at who you&apos;re dealing with, what you sell, and what&apos;s waiting on you — so I
          can hit the ground running rather than asking you to fill me in piece by piece.
        </p>
      </>
    ),
  },
  {
    id: "m3",
    role: "assistant",
    time: "8:12 pm",
    card: "gmail",
    body: (
      <>
        <p>
          Connecting Gmail is the fastest way for me to learn who you are and what you run — I&apos;d
          look at your customers, what you sell, and what&apos;s waiting on you.
        </p>
        <p>
          Hit <strong className="font-bold">Connect</strong> on the card below, or open the{" "}
          <button
            type="button"
            className="underline decoration-brand decoration-[2.5px] underline-offset-[3px] transition-colors hover:decoration-ink"
          >
            Connectors screen
          </button>{" "}
          if you don&apos;t see it.
        </p>
        <p>And while that loads — what&apos;s your business called, and what do you do?</p>
      </>
    ),
  },
];
