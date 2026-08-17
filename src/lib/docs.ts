/* ============================================================================
   DOCUMENTATION
   ----------------------------------------------------------------------------
   The guides that sit behind Help. Content lives here as structured blocks
   rather than markup so the docs index, the article page and search all read
   from one source and stay in step.
   ========================================================================== */

export type DocGroupId = "start" | "manage" | "connect" | "support";

/** Which sticker fronts the card. Mapped to a component at the edge. */
export type DocSticker =
  | "spark"
  | "live"
  | "knowledge"
  | "install"
  | "routing"
  | "chat"
  | "lead"
  | "alert"
  | "allClear"
  | "receptionist"
  | "book"
  | "pencil"
  | "phone"
  | "contact"
  | "payment"
  | "tag"
  | "mail"
  | "webhook"
  | "inbox"
  | "shield"
  | "handoff"
  | "target"
  | "approved"
  | "pending"
  | "gap";

export type DocBlock =
  | { kind: "p"; text: string }
  | { kind: "h"; text: string }
  | { kind: "steps"; items: { title: string; body: string }[] }
  | { kind: "list"; items: string[] }
  | { kind: "note"; tone: "info" | "warning" | "success"; title: string; body: string }
  | { kind: "code"; caption?: string; code: string };

export type DocArticle = {
  slug: string;
  title: string;
  summary: string;
  group: DocGroupId;
  /** Reading time, rounded up to the honest minute. */
  minutes: number;
  sticker: DocSticker;
  blocks: DocBlock[];
  related?: string[];
};

export const DOC_GROUPS: { id: DocGroupId; label: string; blurb: string; sticker: DocSticker }[] = [
  {
    id: "start",
    label: "Start",
    blurb: "From an empty site to a launcher a visitor can actually use.",
    sticker: "spark",
  },
  {
    id: "manage",
    label: "Manage",
    blurb: "The day-to-day: answers, people, settings and spend.",
    sticker: "receptionist",
  },
  {
    id: "connect",
    label: "Connect",
    blurb: "Where a visitor request goes once Concierge has it.",
    sticker: "routing",
  },
  {
    id: "support",
    label: "Support",
    blurb: "Checks, previews and what to do when something is off.",
    sticker: "shield",
  },
];

/* ---- The four moves that get a site live -------------------------------- */
export const LAUNCH_PATH: { step: string; title: string; body: string; href: string }[] = [
  {
    step: "01",
    title: "Choose your starting point",
    body: "Pages if Concierge is the public site. Agent if you already have one and want it answering there.",
    href: "/help/docs/quick-launch",
  },
  {
    step: "02",
    title: "Review what Concierge knows",
    body: "Site Brain holds every claim, where it came from and whether you have approved it. Nothing unapproved reaches a visitor.",
    href: "/help/docs/review-site-brain",
  },
  {
    step: "03",
    title: "Connect the response path",
    body: "At least one destination — inbox, Slack, email, CRM — so a request lands somewhere a person will see it.",
    href: "/help/docs/routing-readiness",
  },
  {
    step: "04",
    title: "Test as a visitor",
    body: "Ask the awkward questions, force a handoff, then confirm the request arrived where you said it should.",
    href: "/help/docs/agent-test-lab",
  },
];

/** What has to be true before you send traffic at it. */
export const LAUNCH_CHECKLIST: { label: string; href: string }[] = [
  { label: "Create or select the site", href: "/help/docs/quick-launch" },
  { label: "Choose Agent or Pages", href: "/help/docs/quick-launch" },
  { label: "Review Site Brain and approve what is right", href: "/help/docs/review-site-brain" },
  { label: "Fill the gaps the scan missed", href: "/help/docs/review-site-brain" },
  { label: "Test real visitor questions in the Test Lab", href: "/help/docs/agent-test-lab" },
  { label: "Connect at least one destination", href: "/help/docs/routing-readiness" },
  { label: "Set brand, voice and domain", href: "/help/docs/site-settings" },
  { label: "Publish Pages or install the script", href: "/help/docs/install-concierge" },
  { label: "Confirm a test request reached Conversations", href: "/help/docs/messages" },
];

export const DOCS: DocArticle[] = [
  /* ---- START ------------------------------------------------------------ */
  {
    slug: "introduction",
    title: "Introduction",
    summary: "What Concierge is, the four pieces it runs on, and how they fit together.",
    group: "start",
    minutes: 4,
    sticker: "spark",
    blocks: [
      {
        kind: "p",
        text: "Concierge turns an ordinary website into one that answers. It learns your business, replies from knowledge you have approved, completes small actions on a visitor's behalf, and brings a person in when the moment is worth a person.",
      },
      { kind: "h", text: "The four pieces" },
      {
        kind: "steps",
        items: [
          {
            title: "Site Brain",
            body: "Everything Concierge is allowed to say, each claim carrying its source and its status. Approved, needs review, restricted, missing. Unapproved knowledge never reaches a visitor.",
          },
          {
            title: "Agent",
            body: "The persona, the guardrails and the tone. Same knowledge, different manner depending on whether it is greeting, selling or supporting.",
          },
          {
            title: "Actions",
            body: "The outcomes a conversation can produce — a booking, a quote, a callback, a payment link — rather than a transcript nobody reads.",
          },
          {
            title: "Routing",
            body: "Where a request goes: your inbox, Slack, email, a CRM, a webhook. Routing is what makes an answer into a response.",
          },
        ],
      },
      {
        kind: "note",
        tone: "info",
        title: "The one rule worth learning first",
        body: "Concierge would rather say it does not know than guess. If an answer looks thin, the fix is almost always in Site Brain, not in the Agent.",
      },
    ],
    related: ["quick-launch", "review-site-brain", "concierge-actions"],
  },
  {
    slug: "quick-launch",
    title: "Quick Launch",
    summary: "Pick Agent for an existing website or Pages for a new one, and get to a working launcher.",
    group: "start",
    minutes: 3,
    sticker: "live",
    blocks: [
      {
        kind: "p",
        text: "Quick Launch is the shortest route from a URL to something a visitor can talk to. It scans the site, drafts a Site Brain, picks sensible defaults for tone and routing, and stops before anything goes public.",
      },
      {
        kind: "steps",
        items: [
          {
            title: "Enter the site address",
            body: "Concierge reads the public pages and pulls out services, pricing, hours, locations and contact routes.",
          },
          {
            title: "Choose Agent or Pages",
            body: "Agent installs a launcher on the site you already run. Pages gives you a Concierge-hosted site instead, useful when the current one is not worth keeping.",
          },
          {
            title: "Wait out the first scan",
            body: "Two to four minutes on a normal site. Larger sites keep learning in the background while you work.",
          },
          {
            title: "Open Site Brain",
            body: "The scan produces drafts, not truth. Approving them is the step that actually makes the agent useful.",
          },
        ],
      },
      {
        kind: "note",
        tone: "warning",
        title: "A scan is a starting point",
        body: "Anything the scan is unsure about lands as needs review rather than approved. Launching without clearing that queue means answering visitors with your worst-maintained page.",
      },
    ],
    related: ["review-site-brain", "build-pages", "install-concierge"],
  },
  {
    slug: "build-pages",
    title: "Build Pages",
    summary: "Create, edit, preview and publish a focused public site that Concierge hosts.",
    group: "start",
    minutes: 4,
    sticker: "pencil",
    blocks: [
      {
        kind: "p",
        text: "Pages is for businesses whose website is the bottleneck. Rather than bolting an agent onto a site that cannot answer for itself, Concierge builds a small, fast public site from the same knowledge the agent uses.",
      },
      {
        kind: "steps",
        items: [
          {
            title: "Start from your brain",
            body: "Sections are drafted from approved knowledge, so the page and the agent cannot drift apart.",
          },
          {
            title: "Arrange the sections",
            body: "Services, pricing, proof, locations, hours, contact. Reorder or remove; each section stays bound to its source.",
          },
          {
            title: "Preview at both widths",
            body: "Check the mobile view specifically — most Concierge traffic arrives on a phone.",
          },
          {
            title: "Publish",
            body: "Goes live on a concierge subdomain immediately, or on your own domain once DNS verifies.",
          },
        ],
      },
      {
        kind: "note",
        tone: "info",
        title: "Editing knowledge edits the page",
        body: "Change a price in Site Brain and every section quoting it updates on next publish. Do not edit the same fact in two places.",
      },
    ],
    related: ["pages-studio", "custom-domains", "sharing-previews"],
  },
  {
    slug: "review-site-brain",
    title: "Review Site Brain",
    summary: "Approve what is right, correct what is stale, and fill the gaps the scan could not.",
    group: "start",
    minutes: 5,
    sticker: "knowledge",
    blocks: [
      {
        kind: "p",
        text: "Site Brain is the trust surface. Every claim carries a status and a source, and the status is what decides whether a visitor ever sees it.",
      },
      { kind: "h", text: "The five statuses" },
      {
        kind: "list",
        items: [
          "Approved — Concierge may say this, verbatim or paraphrased.",
          "Needs review — drafted from your site but not confirmed. Held back until you approve it.",
          "Restricted — deliberately off limits. Concierge will decline and offer a handoff instead.",
          "Missing — a question visitors ask that nothing in your site answers.",
          "Suggested — Concierge proposing an entry, usually because a visitor asked and it had nothing.",
        ],
      },
      { kind: "h", text: "Working the queue" },
      {
        kind: "steps",
        items: [
          {
            title: "Clear required items first",
            body: "Hours, location, pricing shape and contact route. These carry most visitor questions.",
          },
          {
            title: "Read the source, not just the claim",
            body: "Each entry links back to the page it came from, so a wrong answer is usually a wrong page.",
          },
          {
            title: "Restrict rather than delete",
            body: "Deleting invites a re-scan to learn it again. Restricting tells Concierge it is off limits and keeps the note.",
          },
          {
            title: "Re-learn after site changes",
            body: "A re-crawl flags what changed and leaves everything else approved and untouched.",
          },
        ],
      },
      {
        kind: "note",
        tone: "success",
        title: "What good looks like",
        body: "No required item pending, no missing entry for a question you get weekly, and every price under thirty days old.",
      },
    ],
    related: ["agent-test-lab", "agent-workspace", "troubleshooting"],
  },
  {
    slug: "agent-test-lab",
    title: "Agent Test Lab",
    summary: "Ask the awkward questions before a visitor does, and see which knowledge answered.",
    group: "start",
    minutes: 3,
    sticker: "target",
    blocks: [
      {
        kind: "p",
        text: "The Test Lab runs the real agent against the real brain, and shows its working: which entries it drew on, how confident it was, and whether it would have handed off.",
      },
      { kind: "h", text: "Questions worth asking" },
      {
        kind: "list",
        items: [
          "The price question, phrased the way a customer phrases it.",
          "Something you deliberately restricted, to confirm it declines cleanly.",
          "Something you do not offer, to confirm it does not invent an offering.",
          "An urgent question, to confirm the handoff fires and lands.",
        ],
      },
      {
        kind: "note",
        tone: "warning",
        title: "A thin answer is a knowledge problem",
        body: "Rewriting the persona will not fix a missing fact. If the trace shows no source, add the entry in Site Brain and test again.",
      },
    ],
    related: ["review-site-brain", "agent-workspace", "handoffs"],
  },
  {
    slug: "dashboard-and-launch",
    title: "Dashboard and launch",
    summary: "Read readiness, progress and install state from the Overview.",
    group: "start",
    minutes: 3,
    sticker: "allClear",
    blocks: [
      {
        kind: "p",
        text: "Overview answers one question: is this site ready for visitors, and if not, what is holding it back. Everything on it is a link to the thing you would have to fix.",
      },
      {
        kind: "list",
        items: [
          "Readiness — required knowledge approved, one destination connected, script detected.",
          "Install state — whether the launcher has been seen on a live page in the last 24 hours.",
          "Answer quality — the share of conversations that ended without a fallback.",
          "Attention — anything that changed since you last looked and probably should not have.",
        ],
      },
      {
        kind: "note",
        tone: "info",
        title: "Readiness is not permission",
        body: "Concierge will not block a launch on an incomplete brain. It will tell you plainly what visitors are about to run into.",
      },
    ],
    related: ["install-check", "review-site-brain", "routing-readiness"],
  },
  {
    slug: "install-concierge",
    title: "Install Concierge",
    summary: "Add the launcher to an existing website and confirm it appears.",
    group: "start",
    minutes: 4,
    sticker: "install",
    blocks: [
      {
        kind: "p",
        text: "One script tag, before the closing body tag, on every page you want Concierge to answer on. It loads asynchronously and does not block rendering.",
      },
      {
        kind: "code",
        caption: "Paste before </body>",
        code: '<script\n  src="https://cdn.poweredbyconcierge.com/embed.js"\n  data-site="YOUR_SITE_ID"\n  async\n></script>',
      },
      { kind: "h", text: "Platform notes" },
      {
        kind: "list",
        items: [
          "WordPress — theme footer, or any header-and-footer script plugin.",
          "Shopify — Online Store, Themes, Edit code, theme.liquid.",
          "Webflow — Project settings, Custom code, Footer code, then republish.",
          "Squarespace and Wix — Settings, Advanced, Custom code, site-wide footer.",
          "Next.js and React — the script component in the root layout.",
        ],
      },
      {
        kind: "note",
        tone: "warning",
        title: "Republish after pasting",
        body: "Most site builders keep custom code in a draft until the site is republished. If the install check still says not detected, that is the first thing to rule out.",
      },
    ],
    related: ["install-check", "troubleshooting", "site-settings"],
  },
  {
    slug: "clone-for-staging",
    title: "Clone for staging",
    summary: "Copy knowledge and settings onto a staging URL so you can test without touching live.",
    group: "start",
    minutes: 2,
    sticker: "pending",
    blocks: [
      {
        kind: "p",
        text: "A clone duplicates the Site Brain, agent configuration and action set onto a second site pointed at your staging URL. Conversations and leads do not come with it.",
      },
      {
        kind: "steps",
        items: [
          {
            title: "Clone from Settings",
            body: "Name it so it is obvious which is which — the switcher shows both.",
          },
          {
            title: "Point it at staging",
            body: "Set the staging domain, and let it install its own script there.",
          },
          {
            title: "Mute destinations",
            body: "Clear routing on the clone, or your team gets test alerts at midnight.",
          },
          {
            title: "Promote the diff",
            body: "When staging is right, apply the knowledge changes to the live site rather than swapping sites.",
          },
        ],
      },
    ],
    related: ["quick-launch", "site-settings", "routing-readiness"],
  },

  /* ---- MANAGE ----------------------------------------------------------- */
  {
    slug: "messages",
    title: "Messages",
    summary: "Work the inbox, pick up a conversation mid-flight, and see what Concierge already said.",
    group: "manage",
    minutes: 4,
    sticker: "inbox",
    blocks: [
      {
        kind: "p",
        text: "Every conversation lands in Conversations with its full transcript, the knowledge that answered, and whatever the visitor left behind. Taking over is a single action and the visitor is told a person joined.",
      },
      {
        kind: "steps",
        items: [
          {
            title: "Read the outcome first",
            body: "Each thread is labelled by what it produced — booked, quoted, handed off, unresolved — so you can work the ones that matter.",
          },
          {
            title: "Take over when it is worth it",
            body: "Concierge stops answering the moment you type, and resumes only when you release it.",
          },
          {
            title: "Fix the cause",
            body: "An unresolved thread usually points at one missing entry. Add it from the transcript and the next visitor gets an answer.",
          },
        ],
      },
      {
        kind: "note",
        tone: "info",
        title: "Unresolved is a feature",
        body: "A thread marked unresolved means Concierge declined rather than guessed. Read those first — they are your knowledge gaps, already sorted by demand.",
      },
    ],
    related: ["handoffs", "contacts-and-insights", "review-site-brain"],
  },
  {
    slug: "agent-workspace",
    title: "AI Agent workspace",
    summary: "Persona, guardrails, behaviour and when to bring a person in.",
    group: "manage",
    minutes: 4,
    sticker: "receptionist",
    blocks: [
      {
        kind: "p",
        text: "The Agent workspace sets manner, not facts. Knowledge comes from Site Brain; the agent decides how it is said and when to stop saying it.",
      },
      {
        kind: "steps",
        items: [
          {
            title: "Mode",
            body: "Receptionist greets and routes. Sales qualifies and pushes toward an action. Support resolves and escalates. One mode per site.",
          },
          {
            title: "Voice",
            body: "A short description of how you sound, plus a few phrases you would never use. Short beats elaborate.",
          },
          {
            title: "Guardrails",
            body: "Topics to refuse, claims never to make, and whether it may discuss price at all.",
          },
          {
            title: "Handoff triggers",
            body: "The signals that should end the conversation and start a request — urgency, high value, repeated confusion, an explicit ask for a person.",
          },
        ],
      },
      {
        kind: "note",
        tone: "warning",
        title: "Guardrails outrank persona",
        body: "A restricted topic stays restricted regardless of tone. If a visitor pushes, Concierge declines and offers the handoff.",
      },
    ],
    related: ["review-site-brain", "agent-test-lab", "handoffs"],
  },
  {
    slug: "contacts-and-insights",
    title: "Contacts and Insights",
    summary: "Review contacts, status and activity, and read what visitors keep asking for.",
    group: "manage",
    minutes: 3,
    sticker: "lead",
    blocks: [
      {
        kind: "p",
        text: "A contact is created when a visitor leaves something identifying. Insights is the aggregate view — what people ask, what Concierge could not answer, and which answers precede an action.",
      },
      {
        kind: "list",
        items: [
          "Contacts carry the conversation that produced them, so context survives the handoff.",
          "Status moves as the conversation does: new, engaged, handed off, closed.",
          "Insights ranks unanswered questions by frequency — the shortest route to better answers.",
          "Export is CSV, or push straight into a connected CRM.",
        ],
      },
    ],
    related: ["messages", "crm-integrations", "review-site-brain"],
  },
  {
    slug: "team-access",
    title: "Team access",
    summary: "Invite teammates with the right scope and the right role.",
    group: "manage",
    minutes: 2,
    sticker: "contact",
    blocks: [
      {
        kind: "p",
        text: "Access is granted per site, not per account, so an agency or a multi-location owner can keep sites genuinely separate.",
      },
      {
        kind: "list",
        items: [
          "Owner — billing, deletion, everything below.",
          "Admin — knowledge, agent, routing, integrations. No billing.",
          "Editor — approve and edit knowledge, work the inbox. No integrations.",
          "Viewer — read conversations and insights only.",
        ],
      },
      {
        kind: "note",
        tone: "info",
        title: "Invite editors early",
        body: "The person who knows the prices is rarely the person who set up the site. Approving knowledge is faster when they can do it themselves.",
      },
    ],
    related: ["profile-and-account", "billing-and-plans"],
  },
  {
    slug: "site-settings",
    title: "Site settings",
    summary: "Brand, launcher, voice, domains and publishing in one place.",
    group: "manage",
    minutes: 3,
    sticker: "tag",
    blocks: [
      {
        kind: "p",
        text: "Settings covers how Concierge looks and where it lives. Anything that changes what it says lives in Site Brain or the Agent workspace instead.",
      },
      {
        kind: "list",
        items: [
          "Brand — name, mark, accent colour, and the greeting the launcher opens with.",
          "Launcher — position, offset, and which pages it appears on.",
          "Availability — hours during which a handoff promises a person, and what it says outside them.",
          "Domains — the address Pages is served from.",
          "Danger zone — clone, transfer or delete the site.",
        ],
      },
    ],
    related: ["custom-domains", "build-pages", "voice-concierge"],
  },
  {
    slug: "billing-and-plans",
    title: "Billing and plans",
    summary: "Review the plan, usage, invoices and payment details.",
    group: "manage",
    minutes: 2,
    sticker: "payment",
    blocks: [
      {
        kind: "p",
        text: "Plans are priced per site, on conversations rather than seats — inviting the whole team costs nothing.",
      },
      {
        kind: "list",
        items: [
          "A conversation counts once, however long it runs.",
          "Test Lab runs do not count against the allowance.",
          "Going over does not cut anyone off; it bills at the overage rate and warns you at 80 percent.",
          "Invoices and receipts sit under Billing, downloadable as PDF.",
        ],
      },
    ],
    related: ["team-access", "site-settings"],
  },
  {
    slug: "voice-concierge",
    title: "Voice Concierge",
    summary: "Turn on the spoken interface, set its tone, and decide when it hands to a phone.",
    group: "manage",
    minutes: 3,
    sticker: "phone",
    blocks: [
      {
        kind: "p",
        text: "Voice runs on the same brain as chat. Nothing needs re-approving; the answers are the same, spoken, and shorter.",
      },
      {
        kind: "steps",
        items: [
          {
            title: "Enable it",
            body: "A microphone appears alongside the launcher. Visitors can switch mid-conversation without losing context.",
          },
          {
            title: "Pick a voice and pace",
            body: "Slower than you think. Spoken answers are cut to roughly forty words before a natural pause.",
          },
          {
            title: "Set the phone handoff",
            body: "A number and the hours it is answered. Outside them, voice takes a message rather than promising a callback.",
          },
        ],
      },
      {
        kind: "note",
        tone: "warning",
        title: "Restricted topics are stricter aloud",
        body: "Anything restricted in Site Brain is refused in voice without paraphrase — there is no way to caveat a sentence a caller half-hears.",
      },
    ],
    related: ["agent-workspace", "handoffs", "site-settings"],
  },
  {
    slug: "custom-domains",
    title: "Custom domains",
    summary: "Connect a business domain to Concierge Pages.",
    group: "manage",
    minutes: 3,
    sticker: "shield",
    blocks: [
      {
        kind: "p",
        text: "Pages is served from a concierge subdomain until you point a domain at it. Certificates are issued automatically once DNS verifies.",
      },
      {
        kind: "steps",
        items: [
          {
            title: "Add the domain",
            body: "Apex or subdomain. Both are supported; www is created as an alias either way.",
          },
          {
            title: "Create the record",
            body: "A CNAME for a subdomain, or the two A records shown for an apex.",
          },
          {
            title: "Wait for propagation",
            body: "Usually minutes, occasionally an hour. The status refreshes on its own.",
          },
          {
            title: "Set it as primary",
            body: "The old address keeps redirecting, so links already in the wild continue to work.",
          },
        ],
      },
    ],
    related: ["build-pages", "sharing-previews", "site-settings"],
  },

  /* ---- CONNECT ---------------------------------------------------------- */
  {
    slug: "concierge-actions",
    title: "Concierge Actions",
    summary: "The outcomes a conversation can produce, who owns each, and how to test one.",
    group: "connect",
    minutes: 4,
    sticker: "book",
    blocks: [
      {
        kind: "p",
        text: "An action is the point of the conversation. Without one, Concierge is a better FAQ; with one, it books the appointment, sends the quote or takes the deposit.",
      },
      { kind: "h", text: "Setting one up" },
      {
        kind: "steps",
        items: [
          {
            title: "Name the outcome",
            body: "In the visitor's language — Book a consultation, not Calendar integration.",
          },
          {
            title: "Decide what it needs",
            body: "The fewest fields that make it actionable. Every extra field costs completions.",
          },
          {
            title: "Give it an owner",
            body: "A destination and a person. An action nobody owns is a form that fills a table.",
          },
          {
            title: "Run it once yourself",
            body: "Complete the action end to end and confirm it arrived, before a visitor does it for you.",
          },
        ],
      },
      {
        kind: "note",
        tone: "info",
        title: "Confirm, do not assume",
        body: "Concierge reads back what it captured before completing an action. That read-back is why bookings from chat hold up.",
      },
    ],
    related: ["handoffs", "integrations-overview", "routing-readiness"],
  },
  {
    slug: "integrations-overview",
    title: "Integrations overview",
    summary: "The providers available, what each one carries, and how a link is verified.",
    group: "connect",
    minutes: 3,
    sticker: "webhook",
    blocks: [
      {
        kind: "p",
        text: "Integrations are how a Concierge request becomes work in the systems you already run. Every connection is tested with a real record before it is marked verified.",
      },
      {
        kind: "list",
        items: [
          "Messaging — Slack, Telegram, Microsoft Teams.",
          "CRM — HubSpot, Salesforce, Pipedrive, Airtable.",
          "Calendar — Google Calendar, Cal.com, Calendly.",
          "Work — Taskologic, Linear, Notion.",
          "Anything else — a signed webhook and the REST API.",
        ],
      },
      {
        kind: "note",
        tone: "warning",
        title: "Verified means tested",
        body: "A connection stays pending until a test payload lands. Pending connections do not receive live traffic, by design.",
      },
    ],
    related: ["connect-slack", "crm-integrations", "connect-airtable"],
  },
  {
    slug: "handoffs",
    title: "Handoffs",
    summary: "Send a request to the right person, with the context that produced it.",
    group: "connect",
    minutes: 3,
    sticker: "handoff",
    blocks: [
      {
        kind: "p",
        text: "A handoff is Concierge deciding this one needs a person. It stops answering, captures a contact route, and delivers the transcript alongside the request.",
      },
      { kind: "h", text: "What triggers one" },
      {
        kind: "list",
        items: [
          "The visitor asks for a person, in any phrasing.",
          "A restricted topic comes up and declining twice has not helped.",
          "Confidence drops below your threshold two turns running.",
          "An action fails partway and the visitor is left mid-flight.",
        ],
      },
      {
        kind: "note",
        tone: "info",
        title: "Never hand off into silence",
        body: "If no destination is connected, Concierge says so rather than promising a callback nobody will make. Connect one before launch.",
      },
    ],
    related: ["routing-readiness", "messages", "agent-workspace"],
  },
  {
    slug: "routing-readiness",
    title: "Routing readiness",
    summary: "Configure destinations, test delivery, and read the delivery history.",
    group: "connect",
    minutes: 4,
    sticker: "routing",
    blocks: [
      {
        kind: "p",
        text: "Routing decides where a request lands. Readiness is the check that it actually lands there — a destination that has never received a test is not a destination.",
      },
      {
        kind: "steps",
        items: [
          {
            title: "Add destinations",
            body: "Inbox, email, Slack, CRM or webhook. Most sites want two: one immediate, one durable.",
          },
          {
            title: "Write the rules",
            body: "Rules are ordered and the first match wins. Keep a catch-all at the bottom so nothing falls through.",
          },
          {
            title: "Send a test",
            body: "A real payload down the real path. The destination goes verified only when it confirms.",
          },
          {
            title: "Read the history",
            body: "Every delivery, its status and its response. Failures retry three times with backoff, then surface as an alert.",
          },
        ],
      },
      {
        kind: "note",
        tone: "success",
        title: "What good looks like",
        body: "One catch-all rule, every destination verified in the last thirty days, and no failed deliveries older than a day sitting unread.",
      },
    ],
    related: ["handoffs", "integrations-overview", "connect-slack"],
  },
  {
    slug: "crm-integrations",
    title: "CRM integrations",
    summary: "Connect a customer system, map the fields, and turn on delivery.",
    group: "connect",
    minutes: 4,
    sticker: "contact",
    blocks: [
      {
        kind: "p",
        text: "A CRM connection makes Concierge contacts real records, with the conversation attached, so nobody has to re-ask what the visitor already answered.",
      },
      {
        kind: "steps",
        items: [
          {
            title: "Authorise",
            body: "OAuth where the provider supports it, an API key where it does not. Scopes are the minimum needed to read and write contacts.",
          },
          {
            title: "Map the fields",
            body: "Concierge fields on the left, yours on the right. Unmapped fields are dropped, not guessed at.",
          },
          {
            title: "Choose a dedupe key",
            body: "Usually email, sometimes phone. Without one you will get two records per returning visitor.",
          },
          { title: "Send a test record", body: "Check it in the CRM, delete it, then enable live delivery." },
        ],
      },
      {
        kind: "note",
        tone: "warning",
        title: "Map required fields first",
        body: "If your CRM requires a field Concierge never captures, every write fails silently at the provider. The delivery history will show the rejection.",
      },
    ],
    related: ["crm-inbound-updates", "connect-airtable", "contacts-and-insights"],
  },
  {
    slug: "crm-inbound-updates",
    title: "CRM inbound updates",
    summary: "Let the CRM update Concierge contacts, and choose which fields it owns.",
    group: "connect",
    minutes: 2,
    sticker: "approved",
    blocks: [
      {
        kind: "p",
        text: "Inbound is the return leg: when a record changes in your CRM, the matching Concierge contact follows. You choose which fields the CRM owns.",
      },
      {
        kind: "list",
        items: [
          "Pick the fields deliberately — an owned field cannot be edited in Concierge.",
          "Status and owner are the usual pair. Notes are usually better left one-way.",
          "Conflicts resolve to the CRM, because that is what owning a field means.",
          "Inbound never creates contacts, only updates ones Concierge already has.",
        ],
      },
    ],
    related: ["crm-integrations", "contacts-and-insights"],
  },
  {
    slug: "connect-slack",
    title: "Connect Slack",
    summary: "Send alerts to a channel and reply without leaving it.",
    group: "connect",
    minutes: 2,
    sticker: "alert",
    blocks: [
      {
        kind: "p",
        text: "Slack is the fastest destination to set up and the easiest to over-subscribe. Route what needs a person now; leave the rest in the inbox.",
      },
      {
        kind: "steps",
        items: [
          {
            title: "Authorise the workspace",
            body: "Concierge asks only for permission to post to the channels you choose.",
          },
          {
            title: "Choose a channel",
            body: "A dedicated one. Handoffs in a busy general channel get scrolled past.",
          },
          {
            title: "Pick the events",
            body: "Handoffs and completed actions are usually enough. Every conversation is noise.",
          },
          {
            title: "Reply in thread",
            body: "Replies go back to the visitor if the conversation is still open, and are recorded either way.",
          },
        ],
      },
    ],
    related: ["routing-readiness", "handoffs", "connect-taskologic"],
  },
  {
    slug: "connect-airtable",
    title: "Connect Airtable",
    summary: "Connect a base and verify a test record before live contacts flow.",
    group: "connect",
    minutes: 3,
    sticker: "tag",
    blocks: [
      {
        kind: "p",
        text: "Airtable is the pragmatic middle ground between a spreadsheet and a CRM, and it is a first-class destination.",
      },
      {
        kind: "steps",
        items: [
          {
            title: "Connect the base",
            body: "Grant access to a single base rather than the whole workspace.",
          },
          {
            title: "Pick the table",
            body: "Concierge reads its schema and offers a field map. Single-selects must already contain the option being written.",
          },
          {
            title: "Test one record",
            body: "Confirm it appears with every mapped field populated, then delete it.",
          },
          {
            title: "Enable delivery",
            body: "New contacts write on creation; status changes update the same row.",
          },
        ],
      },
      {
        kind: "note",
        tone: "warning",
        title: "Airtable rate limits",
        body: "Five requests a second per base. Concierge queues and retries, but a busy base shared with other automations will show delivery lag.",
      },
    ],
    related: ["crm-integrations", "integrations-overview"],
  },
  {
    slug: "connect-taskologic",
    title: "Connect Taskologic",
    summary: "Send the moments worth acting on into a Taskologic workspace.",
    group: "connect",
    minutes: 2,
    sticker: "target",
    blocks: [
      {
        kind: "p",
        text: "Where Slack is for noticing, Taskologic is for finishing. A routed moment becomes a task with the transcript attached and an owner already on it.",
      },
      {
        kind: "steps",
        items: [
          { title: "Authorise the workspace", body: "Then pick the project new tasks land in." },
          {
            title: "Map the outcome to a task type",
            body: "Handoffs become follow-ups, failed actions become fixes, quotes become quotes.",
          },
          {
            title: "Set the default assignee",
            body: "A round-robin group is better than a single person on holiday.",
          },
        ],
      },
    ],
    related: ["connect-slack", "routing-readiness", "handoffs"],
  },
  {
    slug: "contact-only-mode",
    title: "Contact-only mode",
    summary: "Keep the launcher useful while Site Brain is still being reviewed.",
    group: "connect",
    minutes: 2,
    sticker: "mail",
    blocks: [
      {
        kind: "p",
        text: "Contact-only turns off answering and leaves capture on. Concierge greets, takes the question and routes it, without claiming to know anything.",
      },
      {
        kind: "list",
        items: [
          "Useful while the brain is under review, or during a pricing change you have not finished approving.",
          "Handoffs, actions and routing all keep working.",
          "Visitors are told plainly that a person will answer — no pretence of an agent.",
          "Switching back on is instant and needs no re-install.",
        ],
      },
    ],
    related: ["review-site-brain", "handoffs", "agent-workspace"],
  },

  /* ---- SUPPORT ---------------------------------------------------------- */
  {
    slug: "install-check",
    title: "Install check",
    summary: "Verify the script is live, on the right pages, and reporting back.",
    group: "support",
    minutes: 2,
    sticker: "install",
    blocks: [
      {
        kind: "p",
        text: "The install check loads your site the way a visitor would and reports what it found. Run it after every deploy that touches the theme.",
      },
      { kind: "h", text: "When it says not detected" },
      {
        kind: "list",
        items: [
          "The site was not republished after the code was pasted.",
          "The tag went into a page template rather than the site-wide footer.",
          "A consent banner is blocking the script until a category is accepted.",
          "The site ID in the tag belongs to a different Concierge site.",
          "A content security policy is blocking the CDN host.",
        ],
      },
      {
        kind: "code",
        caption: "If you use a CSP, allow the CDN",
        code: "script-src 'self' https://cdn.poweredbyconcierge.com;\nconnect-src 'self' https://api.poweredbyconcierge.com;",
      },
    ],
    related: ["install-concierge", "troubleshooting", "dashboard-and-launch"],
  },
  {
    slug: "sharing-previews",
    title: "Sharing previews",
    summary: "Check the title, description and image that appear when a link is shared.",
    group: "support",
    minutes: 2,
    sticker: "pencil",
    blocks: [
      {
        kind: "p",
        text: "Pages generates its own preview metadata from approved knowledge. Worth checking before a link goes into a campaign, because social platforms cache aggressively.",
      },
      {
        kind: "list",
        items: [
          "Title — under sixty characters or it truncates.",
          "Description — under a hundred and sixty, and it should say what you do, not what you value.",
          "Image — 1200 by 630. The default is generated from your brand mark.",
          "Re-share after changes; most platforms cache a preview for around a week.",
        ],
      },
    ],
    related: ["build-pages", "custom-domains", "pages-studio"],
  },
  {
    slug: "pages-studio",
    title: "Pages Studio",
    summary: "Structure, sections, drafts and publishing.",
    group: "support",
    minutes: 3,
    sticker: "pencil",
    blocks: [
      {
        kind: "p",
        text: "Studio is where a Pages site is edited. Drafts are private until published, and every publish is a version you can roll back to.",
      },
      {
        kind: "list",
        items: [
          "Sections are typed, not freeform, so they stay bound to the knowledge that feeds them.",
          "A draft carries a shareable preview link for sign-off.",
          "Publishing is atomic — visitors never see a half-updated page.",
          "Version history keeps the last twenty publishes, each restorable in one action.",
        ],
      },
    ],
    related: ["build-pages", "sharing-previews", "custom-domains"],
  },
  {
    slug: "troubleshooting",
    title: "Troubleshooting",
    summary: "The failures worth recognising, and the shortest route out of each.",
    group: "support",
    minutes: 5,
    sticker: "gap",
    blocks: [
      { kind: "h", text: "The launcher does not appear" },
      {
        kind: "p",
        text: "Run the install check first. If it reports detected but you cannot see it, check whether the launcher is scoped to specific pages in Settings, and whether an ad blocker is hiding it.",
      },
      { kind: "h", text: "Answers are vague or wrong" },
      {
        kind: "p",
        text: "Open the conversation and read the trace. No source means missing knowledge; a stale source means a re-learn is due; the right source with the wrong emphasis is a persona change.",
      },
      { kind: "h", text: "Requests are not arriving" },
      {
        kind: "p",
        text: "Check the delivery history before anything else. A failing destination shows its rejection there. If the history is empty, no rule matched — add a catch-all.",
      },
      { kind: "h", text: "It answers a restricted topic" },
      {
        kind: "p",
        text: "Restricted covers the entry, not the subject. If the same fact exists in a second approved entry, restrict that one too, then confirm in the Test Lab.",
      },
      {
        kind: "note",
        tone: "info",
        title: "Still stuck",
        body: "Send the site, the question you asked and what you expected instead. The conversation ID from the transcript makes it quick to trace.",
      },
    ],
    related: ["install-check", "review-site-brain", "routing-readiness"],
  },
  {
    slug: "profile-and-account",
    title: "Profile and account",
    summary: "Update your details, and what deletion actually removes.",
    group: "support",
    minutes: 2,
    sticker: "shield",
    blocks: [
      {
        kind: "p",
        text: "Your profile is one account across every site you have access to. Leaving a site does not delete the account, and deleting the account does not delete sites others own.",
      },
      {
        kind: "list",
        items: [
          "Changing email requires confirmation from both addresses.",
          "Deleting a site removes its knowledge, conversations and contacts after a thirty-day grace period.",
          "Export contacts and transcripts before deleting; there is no restore after the grace period.",
          "Ownership can be transferred instead, which keeps everything intact.",
        ],
      },
      {
        kind: "note",
        tone: "warning",
        title: "Deletion is not reversible",
        body: "After thirty days the data is gone from backups too. Export first, then delete.",
      },
    ],
    related: ["team-access", "billing-and-plans"],
  },
];

export const DOC_BY_SLUG = new Map(DOCS.map((d) => [d.slug, d]));

export function docsInGroup(group: DocGroupId) {
  return DOCS.filter((d) => d.group === group);
}

export function relatedDocs(article: DocArticle) {
  return (article.related ?? []).map((s) => DOC_BY_SLUG.get(s)).filter((d): d is DocArticle => Boolean(d));
}
