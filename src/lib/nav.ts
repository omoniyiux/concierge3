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
  slug: string;
  label: string;
  Icon: ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  /** Rendered as a small dot when the surface needs the owner. */
  attention?: "count" | "dot";
};

export type NavGroup = { label: string | null; items: NavItem[] };

/**
 * Four groups, nine destinations. The grouping follows the product's own
 * mental model — understand, engage, automate, grow — rather than listing
 * every feature the app happens to have.
 */
export const NAV: NavGroup[] = [
  { label: null, items: [{ slug: "overview", label: "Overview", Icon: OverviewIcon }] },
  {
    label: "Understand",
    items: [{ slug: "brain", label: "Site Brain", Icon: BrainIcon, attention: "count" }],
  },
  {
    label: "Engage",
    items: [
      { slug: "agent", label: "Agent", Icon: AgentIcon },
      { slug: "conversations", label: "Conversations", Icon: ConversationsIcon, attention: "count" },
      { slug: "leads", label: "Leads", Icon: LeadsIcon },
    ],
  },
  {
    label: "Automate",
    items: [
      { slug: "actions", label: "Actions", Icon: ActionsIcon },
      { slug: "routing", label: "Routing", Icon: RoutingIcon, attention: "dot" },
    ],
  },
  {
    label: "Grow",
    items: [
      { slug: "insights", label: "Insights", Icon: InsightsIcon },
      { slug: "pages", label: "Pages", Icon: PagesIcon },
      { slug: "integrations", label: "Integrations", Icon: IntegrationsIcon },
    ],
  },
];

export const ALL_NAV_ITEMS = NAV.flatMap((g) => g.items);
