/* ============================================================================
   CONCIERGE DOMAIN MODEL
   ----------------------------------------------------------------------------
   Organization → Website → Site Brain → Agent → Actions → Routing
   Visitor → Conversation → Intent → Action → Outcome

   These types are the contract the UI renders against. Nothing in the
   component tree should invent product data; it arrives shaped like this,
   whether from the demo fixtures or, later, a real API.
   ========================================================================== */

export type ID = string;

/* ---- Organization & tenancy --------------------------------------------- */

export type OrgPlan = "free" | "starter" | "growth" | "scale";

export interface Organization {
  id: ID;
  name: string;
  slug: string;
  plan: OrgPlan;
  /** Agencies manage many client orgs; a direct owner has none. */
  isAgency: boolean;
  seatsUsed: number;
  seatsIncluded: number;
  siteLimit: number;
}

export type TeamRole = "owner" | "admin" | "operator" | "viewer";

/** Capability grants are per-surface so an operator can see Messages only. */
export type TeamScope =
  | "messages"
  | "routing"
  | "preview"
  | "insights"
  | "settings"
  | "pages"
  | "billing"
  | "team";

export interface TeamMember {
  id: ID;
  name: string;
  email: string;
  role: TeamRole;
  scopes: TeamScope[];
  /** null = all current and future sites. */
  siteIds: ID[] | null;
  status: "active" | "invited";
  invitedAt?: string;
}

/* ---- Website ------------------------------------------------------------ */

export type SiteProduct = "agent" | "pages";
export type SiteStatus = "draft" | "learning" | "review" | "ready" | "live" | "paused";
export type InstallState = "not-installed" | "detected" | "stale" | "failed";

export interface Site {
  id: ID;
  orgId: ID;
  name: string;
  /** Public URL for Agent sites, concierge subdomain for Pages sites. */
  url: string;
  product: SiteProduct;
  status: SiteStatus;
  installState: InstallState;
  accentColor: string;
  createdAt: string;
  updatedAt: string;
  /** Percentage 0–100 across the six launch steps. */
  launchProgress: number;
}

/* ---- Site Brain --------------------------------------------------------- */

/**
 * Every knowledge item declares where it came from and how far the owner has
 * vetted it. Concierge must never answer from unapproved material.
 */
export type KnowledgeStatus =
  | "approved"
  | "needs-review"
  | "suggested"
  | "imported"
  | "restricted"
  | "missing";

export type KnowledgeCategory =
  | "business"
  | "products"
  | "services"
  | "pricing"
  | "faqs"
  | "policies"
  | "voice"
  | "rules"
  | "restrictions";

export interface KnowledgeSource {
  id: ID;
  kind: "crawl" | "manual" | "upload" | "integration";
  label: string;
  url?: string;
  fetchedAt?: string;
}

export interface KnowledgeItem {
  id: ID;
  siteId: ID;
  category: KnowledgeCategory;
  title: string;
  body: string;
  status: KnowledgeStatus;
  /** 0–1. Drives the confidence chip and the review ordering. */
  confidence: number;
  required: boolean;
  sources: KnowledgeSource[];
  updatedAt: string;
}

export interface SiteBrain {
  siteId: ID;
  /** Set once the required items are approved or edited. */
  ready: boolean;
  itemCount: number;
  approvedCount: number;
  needsReviewCount: number;
  missingCount: number;
  /** 0–100 coverage across the categories Concierge answers from. */
  coverage: number;
  lastLearnedAt: string;
}

/* ---- Crawl -------------------------------------------------------------- */

export type CrawlPhase =
  | "queued"
  | "validating"
  | "scanning"
  | "extracting"
  | "building"
  | "complete"
  | "failed";

export interface CrawlPage {
  url: string;
  label: string;
  state: "pending" | "reading" | "done" | "skipped";
  itemsFound: number;
}

export interface CrawlRun {
  id: ID;
  siteId: ID;
  phase: CrawlPhase;
  pagesFound: number;
  pagesRead: number;
  itemsFound: number;
  pages: CrawlPage[];
  startedAt: string;
  error?: { code: string; message: string; remedy: string };
}

/* ---- Agent -------------------------------------------------------------- */

export type AgentMode =
  | "customer-service"
  | "knowledge-assistant"
  | "sales-assistant"
  | "receptionist"
  | "custom";

export type AgentTone = "warm" | "professional" | "concise" | "friendly" | "expert";

export interface AgentConfig {
  siteId: ID;
  name: string;
  mode: AgentMode;
  greeting: string;
  role: string;
  tone: AgentTone;
  /** Owner-approved rules the runtime must honour. */
  rules: string[];
  neverPromise: string[];
  escalationTriggers: string[];
  quickActions: ID[];
  /** 0–1, derived from Site Brain coverage and source quality. */
  confidence: number;
  voiceEnabled: boolean;
}

/* ---- Conversations ------------------------------------------------------ */

export type ConversationStatus =
  | "new"
  | "active"
  | "qualified"
  | "converted"
  | "handed-off"
  | "closed";

export type VisitorIntent =
  | "pricing"
  | "booking"
  | "support"
  | "product"
  | "human"
  | "quote"
  | "hours"
  | "unknown";

export type MessageAuthor = "visitor" | "agent" | "human" | "system";

export interface Message {
  id: ID;
  author: MessageAuthor;
  authorName?: string;
  body: string;
  at: string;
  /** Present on agent turns so the owner can audit what it answered from. */
  citations?: { itemId: ID; title: string }[];
  confidence?: number;
  actionRef?: ID;
}

export interface Conversation {
  id: ID;
  siteId: ID;
  visitorName: string;
  visitorLocation?: string;
  intent: VisitorIntent;
  status: ConversationStatus;
  pageUrl: string;
  startedAt: string;
  lastMessageAt: string;
  messageCount: number;
  preview: string;
  messages: Message[];
  leadId?: ID;
  routedTo?: string;
  actionsTaken: ID[];
  /** Set when the agent could not answer — feeds the Insights gap list. */
  unanswered?: string;
}

/* ---- Leads -------------------------------------------------------------- */

export type LeadQualification = "hot" | "warm" | "cool" | "unqualified";

export interface Lead {
  id: ID;
  siteId: ID;
  name: string;
  email?: string;
  phone?: string;
  intent: VisitorIntent;
  service?: string;
  budget?: string;
  location?: string;
  urgency?: "immediate" | "this-week" | "this-month" | "exploring";
  qualification: LeadQualification;
  /** 0–100. */
  score: number;
  conversationId: ID;
  capturedAt: string;
  routedTo?: string;
  notes?: string;
}

/* ---- Actions ------------------------------------------------------------ */

export type ActionKind =
  | "booking"
  | "quote"
  | "lead-capture"
  | "payment"
  | "call"
  | "message"
  | "video"
  | "offer"
  | "consultation";

export type ActionReadiness = "ready" | "needs-setup" | "needs-connection" | "disabled";

export type ActionPlacement = "agent" | "pages" | "website" | "routing";

export interface ActionField {
  key: string;
  label: string;
  required: boolean;
  type: "text" | "email" | "phone" | "date" | "select" | "number";
}

export interface ActionDef {
  id: ID;
  siteId: ID;
  kind: ActionKind;
  name: string;
  /** What the visitor gets. Written for the owner, not the developer. */
  description: string;
  provider?: string;
  readiness: ActionReadiness;
  /** The intents that may trigger it. */
  triggers: VisitorIntent[];
  collects: ActionField[];
  /** What happens once the visitor completes it. */
  outcome: string;
  placements: ActionPlacement[];
  completions30d: number;
}

/* ---- Routing ------------------------------------------------------------ */

export type DestinationKind =
  | "email"
  | "slack"
  | "sms"
  | "webhook"
  | "taskologic"
  | "telegram"
  | "inbox";

export type DestinationStatus = "connected" | "untested" | "failing" | "paused";

/** The six moments the PRD says can fire a route. */
export type RoutingMoment =
  | "specialist-requested"
  | "call-requested"
  | "conversation-started"
  | "high-intent"
  | "brain-approved"
  | "agent-launched";

export interface Destination {
  id: ID;
  siteId: ID;
  kind: DestinationKind;
  name: string;
  target: string;
  status: DestinationStatus;
  moments: RoutingMoment[];
  lastDeliveryAt?: string;
  lastTestedAt?: string;
}

export type RuleOperator = "is" | "is-not" | "contains" | "greater-than" | "less-than";

export interface RuleCondition {
  field: "intent" | "location" | "lead-value" | "service" | "urgency" | "page";
  operator: RuleOperator;
  value: string;
}

export interface RoutingRule {
  id: ID;
  siteId: ID;
  name: string;
  enabled: boolean;
  /** All conditions must hold. Kept deliberately simple. */
  conditions: RuleCondition[];
  destinationId: ID;
  priority: number;
  matches30d: number;
}

export interface DeliveryRecord {
  id: ID;
  destinationId: ID;
  moment: RoutingMoment;
  at: string;
  state: "delivered" | "failed" | "retrying";
  conversationId?: ID;
  error?: string;
}

/* ---- Integrations ------------------------------------------------------- */

export type IntegrationStatus = "connected" | "available" | "coming-soon" | "error";

export type IntegrationCategory =
  | "routing"
  | "messaging"
  | "scheduling"
  | "payments"
  | "crm"
  | "automation"
  | "developer";

export interface Integration {
  id: ID;
  name: string;
  description: string;
  category: IntegrationCategory;
  status: IntegrationStatus;
  connectedAt?: string;
  accountLabel?: string;
  lastSyncAt?: string;
}

/* ---- Concierge Pages ---------------------------------------------------- */

export type PageSectionKind =
  | "hero"
  | "services"
  | "about"
  | "testimonials"
  | "pricing"
  | "faq"
  | "contact"
  | "gallery";

export interface PageSection {
  id: ID;
  kind: PageSectionKind;
  title: string;
  enabled: boolean;
  summary: string;
}

export interface ConciergePage {
  id: ID;
  siteId: ID;
  slug: string;
  title: string;
  navLabel: string;
  sections: PageSection[];
  published: boolean;
  updatedAt: string;
}

/* ---- Insights ----------------------------------------------------------- */

export interface MetricPoint {
  date: string;
  value: number;
}

export interface Metric {
  key: string;
  label: string;
  value: number;
  /** Percentage change against the previous window. */
  delta: number;
  format: "number" | "percent" | "duration" | "currency";
  series: MetricPoint[];
}

/** The product's sharpest insight: what the site could not answer. */
export interface UnansweredQuestion {
  id: ID;
  question: string;
  askCount: number;
  lastAskedAt: string;
  suggestedCategory: KnowledgeCategory;
  status: "open" | "resolved" | "dismissed";
}

export interface IntentBreakdown {
  intent: VisitorIntent;
  count: number;
  share: number;
  conversionRate: number;
}

/* ---- Activity ----------------------------------------------------------- */

export type ActivityKind =
  | "conversation"
  | "lead"
  | "action"
  | "routing"
  | "knowledge"
  | "install"
  | "system";

export interface ActivityEvent {
  id: ID;
  kind: ActivityKind;
  title: string;
  detail?: string;
  at: string;
  siteId: ID;
  href?: string;
}
