/* ============================================================================
   VIDEO TUTORIALS
   ----------------------------------------------------------------------------
   Short and practical. Find it, watch it, keep moving. Each video names the
   written guide that covers the same ground, because reading is faster when
   you already know what you are doing.
   ========================================================================== */

export type Tutorial = {
  id: string;
  /** The YouTube video id — the cover and the player both come from it. */
  youtubeId: string;
  title: string;
  /** One line on what you will be able to do afterwards. */
  summary: string;
  /** mm:ss, as shown on the player. */
  duration: string;
  /** Total seconds, for sorting and for structured data. */
  seconds: number;
  chapter: "Set up" | "Knowledge";
  /** The written guide covering the same ground. */
  doc?: string;
  chapters?: { at: string; label: string }[];
  featured?: boolean;
};

export const TUTORIALS: Tutorial[] = [
  {
    id: "onboarding",
    youtubeId: "P7Z6TG3Jh8c",
    title: "Concierge onboarding",
    summary:
      "The whole arc in one sitting: scan a site, review what it learned, connect a destination and watch a real request land.",
    duration: "9:58",
    seconds: 598,
    chapter: "Set up",
    doc: "introduction",
    featured: true,
    chapters: [
      { at: "0:00", label: "What Concierge actually does" },
      { at: "1:24", label: "Scanning your site" },
      { at: "3:10", label: "Reading Site Brain" },
      { at: "5:35", label: "Approving and correcting" },
      { at: "7:02", label: "Connecting a destination" },
      { at: "8:40", label: "Testing as a visitor" },
    ],
  },
  {
    id: "deploy-agent",
    youtubeId: "us4y51sS8mU",
    title: "Set up and deploy your Concierge AI agent",
    summary: "From an empty site to a launcher live on your own domain, including the install check.",
    duration: "6:23",
    seconds: 383,
    chapter: "Set up",
    doc: "install-concierge",
    chapters: [
      { at: "0:00", label: "Choosing Agent or Pages" },
      { at: "1:48", label: "Persona and guardrails" },
      { at: "3:30", label: "Pasting the script" },
      { at: "5:05", label: "Confirming the install" },
    ],
  },
  {
    id: "quick-launch",
    youtubeId: "M1mUL3xD7pI",
    title: "Quick Launch your chat agent",
    summary: "The fastest path to something a visitor can talk to, in a little over a minute.",
    duration: "1:10",
    seconds: 70,
    chapter: "Set up",
    doc: "quick-launch",
  },
  {
    id: "knowledge-sources",
    youtubeId: "hzBbhf2woWQ",
    title: "Manage your chat agent's knowledge sources",
    summary: "Where each claim came from, how to correct one, and what re-learning does to your approvals.",
    duration: "3:08",
    seconds: 188,
    chapter: "Knowledge",
    doc: "review-site-brain",
    chapters: [
      { at: "0:00", label: "Sources and status" },
      { at: "1:05", label: "Fixing a stale price" },
      { at: "2:10", label: "Re-learning safely" },
    ],
  },
  {
    id: "test-knowledge",
    youtubeId: "T0fLS0nSCHA",
    title: "Test your AI agent's knowledge base",
    summary: "Ask the questions that expose a thin brain before a visitor finds it for you.",
    duration: "1:10",
    seconds: 70,
    chapter: "Knowledge",
    doc: "agent-test-lab",
  },
];

export const TUTORIAL_CHAPTERS = ["Set up", "Knowledge"] as const;

export const FEATURED_TUTORIAL = TUTORIALS.find((t) => t.featured) ?? TUTORIALS[0];

/** maxres is not generated for every upload, so hq is the reliable fallback. */
export function thumbnail(t: Tutorial, quality: "maxres" | "hq" = "maxres") {
  return `https://i.ytimg.com/vi/${t.youtubeId}/${quality}default.jpg`;
}

export function watchUrl(t: Tutorial) {
  return `https://www.youtube.com/watch?v=${t.youtubeId}`;
}
