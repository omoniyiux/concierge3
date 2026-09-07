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
 * Nine destinations, grouped by spacing rather than headings. The grouping
 * still follows the product's model -- understand, engage, automate, grow --
 * but the gaps say it without four labels taking up the rail.
 */
export const NAV: NavGroup[] = [
  { label: null, items: [{ path: "overview", label: "Overview", Icon: OverviewIcon }] },
  { label: null, items: [{ path: "brain", label: "Site Brain", Icon: BrainIcon }] },
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
      { path: "insights", label: "Insights", Icon: InsightsIcon },
      { path: "pages", label: "Pages", Icon: PagesIcon },
      { path: "integrations", label: "Integrations", Icon: IntegrationsIcon },
    ],
  },
];

export const ALL_NAV_ITEMS = NAV.flatMap((g) => g.items);
