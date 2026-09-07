import type { ComponentType } from "react";
import {
  ActionsIcon,
  AgentIcon,
  BrainIcon,
  ConversationsIcon,
  InsightsIcon,
  IntegrationsIcon,
  LeadsIcon,
  OverviewIcon,
  PagesIcon,
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
 * Nine destinations under four quiet headings, following the product's own
 * model: understand the business, engage the visitor, automate the work,
 * grow on what you learn.
 */
export const NAV: NavGroup[] = [
  { label: null, items: [{ path: "overview", label: "Overview", Icon: OverviewIcon }] },
  { label: "Understand", items: [{ path: "brain", label: "Site Brain", Icon: BrainIcon }] },
  {
    label: "Engage",
    items: [
      { path: "agent", label: "Agent", Icon: AgentIcon },
      { path: "conversations", label: "Conversations", Icon: ConversationsIcon },
      { path: "leads", label: "Leads", Icon: LeadsIcon },
    ],
  },
  {
    label: "Automate",
    items: [
      { path: "actions", label: "Actions", Icon: ActionsIcon },
      { path: "routing", label: "Routing", Icon: RoutingIcon },
    ],
  },
  {
    label: "Grow",
    items: [
      { path: "insights", label: "Insights", Icon: InsightsIcon },
      { path: "pages", label: "Pages", Icon: PagesIcon },
      { path: "integrations", label: "Integrations", Icon: IntegrationsIcon },
    ],
  },
];

export const ALL_NAV_ITEMS = NAV.flatMap((g) => g.items);
