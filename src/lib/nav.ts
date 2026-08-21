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
};

export type NavGroup = { label: string | null; items: NavItem[] };

/**
 * Eleven destinations in five groups, separated by spacing rather than
 * headings. Every group is two or three rows, so the rail has one rhythm
 * instead of a pair of lonely singles above a block of five: the site
 * itself, the front desk, what it does, what it returns, what it runs on.
 */
export const NAV: NavGroup[] = [
  {
    label: null,
    items: [
      { path: "overview", label: "Overview", Icon: OverviewIcon },
      { path: "brain", label: "Site Brain", Icon: BrainIcon },
    ],
  },
  {
    label: null,
    items: [
      { path: "agent", label: "Agent", Icon: AgentIcon },
      { path: "conversations", label: "Conversations", Icon: ConversationsIcon },
      { path: "leads", label: "Leads", Icon: LeadsIcon },
    ],
  },
  {
    label: null,
    items: [
      { path: "actions", label: "Actions", Icon: ActionsIcon },
      { path: "routing", label: "Routing", Icon: RoutingIcon },
    ],
  },
  {
    label: null,
    items: [
      { path: "ledger", label: "Return", Icon: ReturnIcon },
      { path: "assistants", label: "Assistants", Icon: AssistantsIcon },
      { path: "insights", label: "Insights", Icon: InsightsIcon },
    ],
  },
  {
    label: null,
    items: [
      { path: "pages", label: "Pages", Icon: PagesIcon },
      { path: "integrations", label: "Integrations", Icon: IntegrationsIcon },
    ],
  },
];

export const ALL_NAV_ITEMS = NAV.flatMap((g) => g.items);
