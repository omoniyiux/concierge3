import type { DestinationKind, RoutingMoment } from "@/lib/types";

/* ============================================================================
   ROUTING CHANNELS
   ----------------------------------------------------------------------------
   Everything that differs between one place a request can land and another,
   described as data so the connect surface stays one component.

   Each channel says how it is connected, because they genuinely differ: an
   email address is typed, Slack is granted, Telegram is paired from inside
   Telegram, Taskologic needs a workspace picked, and the mobile inbox is an
   app you install. Flattening those into one "paste a URL" form is what makes
   integrations feel hostile.
   ========================================================================== */

export type ConnectStyle =
  /** Type the destination in and save it. */
  | "field"
  /** Hand over access, then choose a room inside it. */
  | "oauth"
  /** Concierge issues a code you take to the other app. */
  | "pairing"
  /** Pick a workspace and a project to write into. */
  | "workspace"
  /** Nothing to configure — install it and sign in. */
  | "app";

export interface ChannelSpec {
  kind: DestinationKind;
  label: string;
  /** One sentence, owner-facing: what this destination is for. */
  blurb: string;
  /** The caveat or the reassurance. Optional second line. */
  note?: string;
  defaultName: string;
  connectLabel: string;
  style: ConnectStyle;
  target?: { label: string; placeholder: string; type?: "text" | "email" | "url" | "tel" };
  /** OAuth-shaped channels show the shape of the grant before asking for it. */
  steps?: [string, string, string];
  /** The manual way out, for teams whose admin will not grant an app. */
  fallback?: { summary: string; label: string; placeholder: string };
  /** Pairing channels name the bot and the command. */
  pairing?: { handle: string; instruction: string };
  /** Workspace channels report what will be created and how creds are held. */
  workspace?: { picker: string; explain: string; creates: string };
  appLinks?: { label: string; sub: string }[];
  /** Signed payloads: only meaningful where Concierge posts to your server. */
  security?: boolean;
  defaultMoments: RoutingMoment[];
  /** Pre-selected and explained, where one moment is the obvious reason. */
  primaryMoment?: RoutingMoment;
}

export const CHANNELS: ChannelSpec[] = [
  {
    kind: "inbox",
    label: "Concierge Inbox",
    blurb: "Handoffs land here, inside Concierge, with nothing to connect.",
    note: "Always on. Keep it even after you connect somewhere else — it is the record every other destination is a copy of.",
    defaultName: "Concierge Inbox",
    connectLabel: "Already on",
    style: "app",
    appLinks: [
      { label: "Open on the web", sub: "The Inbox tab on this page" },
      { label: "Concierge for iPhone and Android", sub: "Reply to a handoff from your phone" },
    ],
    defaultMoments: ["specialist-requested", "call-requested", "high-intent"],
  },
  {
    kind: "email",
    label: "Email",
    blurb: "Send visitor requests to the inbox your team checks first.",
    note: "The safest first destination — no app to install and nothing for an admin to approve.",
    defaultName: "Front desk",
    connectLabel: "Connect email",
    style: "field",
    target: { label: "Email address", placeholder: "frontdesk@yourbusiness.com", type: "email" },
    defaultMoments: ["specialist-requested", "call-requested", "high-intent"],
  },
  {
    kind: "slack",
    label: "Slack",
    blurb: "Send visitor requests to a Slack channel your team already watches.",
    note: "Choose a workspace and channel. Manual incoming-webhook setup is still available if your team needs it.",
    defaultName: "Cosmetic team",
    connectLabel: "Connect Slack",
    style: "oauth",
    steps: ["Choose workspace", "Pick channel", "Send test"],
    fallback: {
      summary: "Use an incoming webhook URL instead",
      label: "Incoming webhook URL",
      placeholder: "https://hooks.slack.com/services/…",
    },
    defaultMoments: ["high-intent"],
  },
  {
    kind: "telegram",
    label: "Telegram",
    blurb: "Send Concierge route alerts to a Telegram group, channel or direct chat.",
    defaultName: "Telegram",
    connectLabel: "Create Telegram code",
    style: "pairing",
    pairing: {
      handle: "@poweredbyconcierge_bot",
      instruction:
        "Create the code, add the bot to the Telegram group, channel or direct chat, then send it the command Concierge gives you.",
    },
    defaultMoments: ["specialist-requested", "call-requested"],
  },
  {
    kind: "sms",
    label: "Text message",
    blurb: "Text a number when something cannot wait for an inbox.",
    note: "Best kept to the one moment that is genuinely urgent — a phone that buzzes for everything stops being read.",
    defaultName: "Emergency line",
    connectLabel: "Connect number",
    style: "field",
    target: { label: "Mobile number", placeholder: "+1 512 555 0100", type: "tel" },
    defaultMoments: ["call-requested"],
    primaryMoment: "call-requested",
  },
  {
    kind: "taskologic",
    label: "Taskologic",
    blurb: "Create follow-up work from visitor requests.",
    defaultName: "Taskologic",
    connectLabel: "Choose workspace",
    style: "workspace",
    workspace: {
      picker: "Choose where follow-up work should go.",
      explain:
        "Connection credentials are exchanged and stored server-side. They are never shown in the browser.",
      creates: "Concierge will create or reuse a Concierge Desk in the workspace you choose.",
    },
    defaultMoments: ["high-intent", "specialist-requested"],
  },
  {
    kind: "ticket",
    label: "Ticket API",
    blurb: "Send structured ticket submissions to Jira, Zendesk, ServiceNow or another system.",
    note: "Ticket submissions come here by default. Add the “A ticket is created” moment to another destination only when that team should also receive tickets.",
    defaultName: "Ticket API",
    connectLabel: "Connect Ticket API",
    style: "field",
    target: {
      label: "Ticket webhook URL",
      placeholder: "https://your-ticket-system.example.com/concierge/tickets",
      type: "url",
    },
    security: true,
    defaultMoments: ["ticket-created"],
    primaryMoment: "ticket-created",
  },
  {
    kind: "webhook",
    label: "Webhook",
    blurb: "Use this when a developer or ops teammate gives you a custom webhook URL.",
    note: "This is for custom automations. Most teams can skip it during setup.",
    defaultName: "Custom app",
    connectLabel: "Connect custom app",
    style: "field",
    target: { label: "Custom app URL", placeholder: "https://your-app.example.com/concierge", type: "url" },
    security: true,
    defaultMoments: ["conversation-started", "high-intent"],
  },
];

export const CHANNEL_BY_KIND = Object.fromEntries(CHANNELS.map((c) => [c.kind, c])) as Record<
  DestinationKind,
  ChannelSpec
>;
