import type { ComponentType } from "react";
import {
  ActionsIcon,
  AgentIcon,
  AssistantsIcon,
  BrainIcon,
  ConversationsIcon,
  InsightsIcon,
  IntegrationsIcon,
  LeadsIcon,
  OverviewIcon,
  PagesIcon,
  ReturnIcon,
  RoutingIcon,
} from "@/components/icons";

export type NavItem = {
  /** Path under /sites/[siteId]/. */
  path: string;
  label: string;
  Icon: ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  /** Extra words the command menu should match on. The label is matched already. */
  keywords?: string[];
};

export type NavGroup = { label: string | null; items: NavItem[] };

/**
 * Eight destinations in four groups, separated by spacing rather than
 * headings: the site itself, the front desk, what it returns, what it runs on.
 *
 * Site Brain, Actions and Routing are deliberately absent. They are facets of
 * one object — the Agent — and they live as tabs on it (see
 * `sites/[siteId]/agent/layout.tsx`). Having them in both places meant two
 * URLs for every one of those surfaces, so the rail lit up "Agent" while the
 * page said "Site Brain" and Back had two ways to mean the same thing. They
 * are still one keystroke away through the command menu, via AGENT_FACETS.
 */
export const NAV: NavGroup[] = [
  {
    label: null,
    items: [
      { path: "overview", label: "Overview", Icon: OverviewIcon, keywords: ["home", "health", "launch"] },
      { path: "agent", label: "Agent", Icon: AgentIcon, keywords: ["persona", "brain", "routing", "actions"] },
    ],
  },
  {
    label: null,
    items: [
      { path: "conversations", label: "Conversations", Icon: ConversationsIcon, keywords: ["inbox", "chats"] },
      { path: "leads", label: "Leads", Icon: LeadsIcon, keywords: ["contacts", "enquiries"] },
    ],
  },
  {
    label: null,
    items: [
      { path: "ledger", label: "Return", Icon: ReturnIcon, keywords: ["ledger", "roi", "value", "outcomes"] },
      { path: "assistants", label: "Assistants", Icon: AssistantsIcon, keywords: ["chatgpt", "perplexity"] },
      { path: "insights", label: "Insights", Icon: InsightsIcon, keywords: ["analytics", "gaps", "reports"] },
    ],
  },
  {
    label: null,
    items: [
      { path: "pages", label: "Pages", Icon: PagesIcon, keywords: ["site", "editor", "publish"] },
      { path: "integrations", label: "Integrations", Icon: IntegrationsIcon, keywords: ["connect", "apps"] },
    ],
  },
];

export const ALL_NAV_ITEMS = NAV.flatMap((g) => g.items);

/**
 * The Agent's tabs. Not in the rail, but every one of them is a place an owner
 * thinks of by name — shortening the rail should not make "Routing" unfindable
 * — so the command menu lists them alongside the rail's own destinations.
 */
export const AGENT_FACETS: NavItem[] = [
  { path: "agent/brain", label: "Site Brain", Icon: BrainIcon, keywords: ["knowledge", "learn", "sources"] },
  { path: "agent/actions", label: "Actions", Icon: ActionsIcon, keywords: ["book", "quote", "capture"] },
  { path: "agent/routing", label: "Routing", Icon: RoutingIcon, keywords: ["destinations", "rules", "escalation"] },
  { path: "agent/preview", label: "Preview the agent", Icon: AgentIcon, keywords: ["test", "try", "run"] },
];
