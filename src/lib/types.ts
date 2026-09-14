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
  "messages" | "routing" | "preview" | "insights" | "settings" | "pages" | "billing" | "team";

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
  /**
   * What the site is built with, detected on the first read. It decides which
   * install route is offered first — most owners cannot paste a script, but
   * nearly all of them can install an app from their platform's own store.
   */
  platform?: "wordpress" | "shopify" | "webflow" | "squarespace" | "wix" | "custom";
  accentColor: string;
  createdAt: string;
  updatedAt: string;
  /** Percentage 0–100 across the six launch steps. */
  launchProgress: number;
  /**
   * When the owner last confirmed the Agent's job, tone and limits. Unset
   * means the launch step is still open: the checklist reads this rather than
   * guessing from `launchProgress`, which nothing in the product can move.
   */
  agentConfiguredAt?: string;
  /** ISO 4217. Every value in the ledger is quoted in this. */
  currency: string;
  openingHours: OpeningHours;
}

/**
 * When the business is actually open. This exists so "after hours" can be
 * stamped on a conversation at the moment it happens — opening hours change,
 * and a conversation from March cannot be re-judged against today's.
 */
export interface OpeningHours {
  timezone: string;
  /** Seven entries, Sunday first. null means closed that day. */
  days: ({ opens: number; closes: number } | null)[];
}

/* ---- Site Brain --------------------------------------------------------- */

/**
 * Every knowledge item declares where it came from and how far the owner has
 * vetted it. Concierge must never answer from unapproved material.
 */
export type KnowledgeStatus =
  "approved" | "needs-review" | "suggested" | "imported" | "restricted" | "missing";

export type KnowledgeCategory =
  "business" | "products" | "services" | "pricing" | "faqs" | "policies" | "voice" | "rules" | "restrictions";

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
  "queued" | "validating" | "scanning" | "extracting" | "building" | "complete" | "failed";

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
  "customer-service" | "knowledge-assistant" | "sales-assistant" | "receptionist" | "custom";

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
  /** How far it may go on its own. The dial owners actually turn. */
  autonomy: AgentAutonomy;
  /** Channels it may carry a conversation onto once the visitor has left. */
  followUpChannels: MessageChannel[];
  /**
   * The languages it is allowed to answer in, as BCP-47 tags. The first is
   * the default; the rest are only used when a visitor writes in them. A
   * business that cannot serve a language in person should not list it here,
   * because an answer it cannot follow up on is worse than none.
   */
  languages: string[];
  /** Off by default: answer only in the default language, whatever is asked. */
  matchVisitorLanguage: boolean;
}

/**
 * Graduated, because the gap between "off" and "answering my customers
 * unsupervised" is where cautious owners stall. Most start at `approve` and
 * move to `send` once they have read a fortnight of drafts.
 */
export type AgentAutonomy =
  | "suggest" // drafts land in the inbox; nothing leaves without a person
  | "approve" // drafts are written and queued; one tap sends them
  | "send"; // it follows up on its own, within the rules

/* ---- Conversations ------------------------------------------------------ */

export type ConversationStatus = "new" | "active" | "qualified" | "converted" | "handed-off" | "closed";

export type VisitorIntent =
  "pricing" | "booking" | "support" | "product" | "human" | "quote" | "hours" | "unknown";

export type MessageAuthor = "visitor" | "agent" | "human" | "system";

/**
 * Where the message physically travelled. A conversation is one thread even
 * when it moves from the website to a phone — the channel belongs to each
 * message, not to the thread, so the history stays honest about how each
 * turn reached the person.
 *
 * Direction is deliberately absent: `author` already settles it, and two
 * fields that must agree eventually disagree.
 */
export type MessageChannel = "web" | "sms" | "whatsapp" | "email";

export interface Message {
  id: ID;
  author: MessageAuthor;
  authorName?: string;
  body: string;
  at: string;
  channel: MessageChannel;
  /** Present on agent turns so the owner can audit what it answered from. */
  citations?: { itemId: ID; title: string }[];
  confidence?: number;
  actionRef?: ID;
}

/**
 * Permission to reach someone, recorded as the moment it was given rather
 * than as a setting that can be quietly flipped later. Without one of these
 * for a channel, Concierge will not send on it — and says why.
 */
export interface ContactConsent {
  channel: MessageChannel;
  address: string;
  grantedAt: string;
  /** The words the visitor actually saw when they agreed. */
  basis: string;
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
  /**
   * Stamped when the conversation starts, against the opening hours in force
   * at that moment. Never recomputed.
   */
  afterHours: boolean;
  /** What this conversation produced. Empty is a legitimate answer. */
  outcomeIds: ID[];
  /** Where the thread is reachable now. It starts on the website and moves. */
  channel: MessageChannel;
  /** Every permission the visitor has given, with the moment they gave it. */
  consent: ContactConsent[];
  /** Set the moment a person takes the thread off the agent. */
  takenOverBy?: { name: string; at: string };
}

/* ---- Follow-up: the thread outliving the visit --------------------------- */

export type FollowUpState = "suggested" | "approved" | "sent" | "declined";

/**
 * A message Concierge wants to send after the visitor has gone. It exists as
 * an object rather than a side effect so the owner can read it, change it,
 * and decide — which is the only version of this feature a cautious owner
 * will ever switch on.
 */
export interface FollowUp {
  id: ID;
  siteId: ID;
  conversationId: ID;
  channel: MessageChannel;
  to: string;
  body: string;
  /** Why Concierge believes this one is worth sending, in the owner's terms. */
  reason: string;
  state: FollowUpState;
  draftedAt: string;
  /** Held until this time, so nothing lands at three in the morning. */
  sendAfter: string;
  sentAt?: string;
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
  "booking" | "quote" | "lead-capture" | "payment" | "call" | "message" | "video" | "offer" | "consultation";

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
  /**
   * What one completion is worth, in minor units. Supplied by the owner
   * during setup — Concierge never invents a figure — and used to value
   * outcomes this action produces.
   */
  unitValue?: number;
  /** How that figure was arrived at, shown wherever it is used. */
  unitValueNote?: string;
}

/* ---- Outcomes: what the work was actually worth -------------------------- */

/**
 * The unit of return. Every one of these points back at the conversation that
 * produced it, so no figure on the ledger is ever unaccountable.
 */
export type OutcomeKind =
  | "booking" // a slot taken in the calendar
  | "payment" // money collected
  | "quote" // a priced quote issued
  | "lead-routed" // a qualified lead delivered to a person
  | "answer" // resolved without a human being touched
  | "recovered"; // a visitor who left and came back through a follow-up

/**
 * Value is either confirmed by a system of record or estimated from figures
 * the owner supplied. The ledger never adds the two together silently: an
 * owner who catches Concierge inflating one number stops believing all of
 * them, and belief is the whole product.
 */
export type ValueBasis = "confirmed" | "estimated" | "none";

export interface Outcome {
  id: ID;
  siteId: ID;
  conversationId: ID;
  kind: OutcomeKind;
  /** Written for the owner: "Booked a hygienist appointment for 14 Sept". */
  summary: string;
  at: string;
  /** Minor units of the site currency. Zero when the outcome carries no value. */
  value: number;
  basis: ValueBasis;
  /** The arithmetic behind an estimate, shown wherever the estimate is. */
  valueNote?: string;
  /** Copied from the conversation, so the ledger can split without a join. */
  afterHours: boolean;
  actionId?: ID;
  leadId?: ID;
  destinationId?: ID;
}

/** A period's roll-up. Everything the return surface needs in one object. */
export interface LedgerPeriod {
  siteId: ID;
  label: string;
  start: string;
  end: string;
  conversations: number;
  afterHoursConversations: number;
  /** Kept apart on purpose. Never summed into one headline. */
  confirmedValue: number;
  estimatedValue: number;
  previousConfirmedValue: number;
  previousEstimatedValue: number;
  /** Twenty-four buckets, local to the site, for the opening-hours ribbon. */
  hourHistogram: number[];
  /** Conversations that ended without anyone being called or emailed. */
  resolvedWithoutHuman: number;
  /** The above, at the minutes a phone enquiry actually costs the business. */
  hoursSaved: number;
}

/**
 * The artefact an owner forwards to their partner, and an agency forwards to
 * its client. It is the retention mechanic, so it is a first-class object
 * rather than a rendering of the dashboard.
 */
export interface OwnerReport {
  id: ID;
  siteId: ID;
  periodLabel: string;
  state: "sent" | "scheduled" | "draft";
  /** One sentence, the same one that opens the email. */
  headline: string;
  recipients: string[];
  sentAt?: string;
  scheduledFor?: string;
}

/* ---- Routing ------------------------------------------------------------ */

export type DestinationKind =
  "email" | "slack" | "sms" | "webhook" | "ticket" | "taskologic" | "telegram" | "inbox";

export type DestinationStatus = "connected" | "untested" | "failing" | "paused";

/**
 * What can fire a route. Six of these are things a visitor does — those are
 * the ones routing coverage is measured against, because a visitor moment
 * with nowhere to go is a dropped request. The last two are one-off lifecycle
 * events; they are routable but they are not coverage.
 */
export type RoutingMoment =
  | "specialist-requested"
  | "team-replied"
  | "ticket-created"
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
  /** Set on webhook-shaped destinations that sign their payloads. */
  signingSecret?: string;
}

/* ---- The routing inbox -------------------------------------------------- */

/**
 * Concierge's own destination. It exists so that routing is useful before a
 * single external tool is connected — a handoff always lands somewhere, even
 * on day one, and the owner is never blocked behind an OAuth screen.
 */
export type InboxState = "unread" | "open" | "answered" | "closed";

export interface InboxItem {
  id: ID;
  siteId: ID;
  moment: RoutingMoment;
  /** What the visitor called themselves, or "Anonymous visitor". */
  visitor: string;
  /** One line: what they want. */
  summary: string;
  /** The sentence that triggered the handoff. */
  detail: string;
  page: string;
  at: string;
  state: InboxState;
  conversationId?: ID;
  email?: string;
  phone?: string;
  /** Destinations this same handoff was also sent to. */
  alsoSentTo: ID[];
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
  "routing" | "messaging" | "scheduling" | "payments" | "crm" | "automation" | "developer";

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

/**
 * Pages is a builder for owners who have no website at all, so the unit of
 * authoring is a *section*, not an element. An owner picks "Services" and
 * fills in services; they never position a div. That constraint is the
 * product: every edit a person can make still produces a page that looks
 * deliberate, which is the only promise worth making to someone who has
 * never built a site.
 */
export type PageSectionKind =
  "hero" | "services" | "about" | "testimonials" | "pricing" | "faq" | "contact" | "gallery";

/* -- Shared content pieces ------------------------------------------------- */

/**
 * A button. It either opens one of the site's Actions — the same booking or
 * quote flow the Agent uses — or it links somewhere. Pointing at an Action is
 * the reason a Concierge page converts better than a hand-built one, so it is
 * the first-class case and `href` is the fallback.
 */
export interface PageCta {
  label: string;
  actionId?: ID;
  href?: string;
}

/**
 * `src` is empty until the owner adds one; renderers show a placeholder that
 * holds the space rather than collapsing, so the layout does not lurch when a
 * photograph finally arrives. It is a URL or, before there is an asset store
 * to put files in, a data URI.
 */
export interface PageImage {
  src: string;
  alt: string;
}

/**
 * The name of one of the site icons. Typed as a plain string rather than a
 * union of the current catalogue on purpose: a stored document must survive an
 * icon being renamed or retired, and an unknown name should quietly render
 * nothing instead of failing to parse. The renderer validates on the way out.
 */
export type SiteIconRef = string;

/* -- Per-kind content ------------------------------------------------------ */

export interface HeroContent {
  headline: string;
  subheadline: string;
  cta?: PageCta;
  secondaryCta?: PageCta;
  image?: PageImage;
}

export interface ServiceItem {
  id: ID;
  name: string;
  description: string;
  /** Free text. A moving firm quotes "from $400", not a number. */
  price?: string;
  icon?: SiteIconRef;
  image?: PageImage;
}

export interface ServicesContent {
  heading: string;
  intro?: string;
  items: ServiceItem[];
}

export interface AboutContent {
  heading: string;
  body: string;
  image?: PageImage;
  /** Short proof points: "Family run since 2009". */
  highlights: string[];
}

export interface Testimonial {
  id: ID;
  quote: string;
  author: string;
  /** A face makes a quote land. Optional, because most owners have none. */
  avatar?: PageImage;
  /** "Moved from Austin to Dallas" — context that makes the quote land. */
  detail?: string;
  rating?: number;
}

export interface TestimonialsContent {
  heading: string;
  items: Testimonial[];
}

export interface PricingTier {
  id: ID;
  name: string;
  price: string;
  /** "per move", "per hour". Free text for the same reason as ServiceItem. */
  cadence?: string;
  description?: string;
  features: string[];
  cta?: PageCta;
  featured: boolean;
}

export interface PricingContent {
  heading: string;
  intro?: string;
  tiers: PricingTier[];
  /** The honest small print: "Final price confirmed after a survey." */
  note?: string;
}

export interface FaqItem {
  id: ID;
  question: string;
  answer: string;
  /**
   * Set when this answer came from the Site Brain rather than being typed
   * here. It is what lets a published page and the Agent stay in agreement
   * instead of drifting into two different stories.
   */
  knowledgeItemId?: ID;
}

export interface FaqContent {
  heading: string;
  items: FaqItem[];
}

export interface ContactContent {
  heading: string;
  body?: string;
  phone?: string;
  email?: string;
  address?: string;
  /** The Action rendered as the form. */
  actionId?: ID;
  /** Reads the site's opening hours rather than restating them here. */
  showHours: boolean;
}

export interface GalleryItem {
  id: ID;
  image: PageImage;
  caption?: string;
}

export interface GalleryContent {
  heading: string;
  intro?: string;
  items: GalleryItem[];
}

/* -- Look: a closed set, not CSS ------------------------------------------- */

export type SectionBackground = "default" | "subtle" | "inverse" | "brand";
export type SectionSpacing = "compact" | "normal" | "roomy" | "grand";
export type SectionAlign = "left" | "center";
export type SectionWidth = "narrow" | "normal" | "wide";
export type SectionColumns = 1 | 2 | 3 | 4;

/**
 * Five dials, all of them enumerations. Deliberately not CSS: an owner cannot
 * express an ugly page in this vocabulary, and every combination is something
 * the renderers have been designed against.
 *
 * The shape is uniform across kinds even though not every dial applies to
 * every kind — a hero has no column count. Renderers ignore what they do not
 * use and the inspector only offers what is meaningful, which is cheaper than
 * a per-kind style type and keeps the override table below single-shaped.
 */
export interface SectionStyle {
  background: SectionBackground;
  spacing: SectionSpacing;
  align: SectionAlign;
  width: SectionWidth;
  columns: SectionColumns;
}

/* -- Sections -------------------------------------------------------------- */

interface PageSectionBase {
  id: ID;
  /** The owner's name for it in the sections list. Not shown on the page. */
  title: string;
  enabled: boolean;
  /** The look at the widest breakpoint. Narrower ones override it. */
  style: SectionStyle;
}

/**
 * `kind` discriminates, so narrowing a section also narrows its content and
 * no second field has to agree with the first.
 *
 * There is deliberately no stored `summary`: it is derived from the content by
 * `sectionSummary`, because a description that is typed once and never updated
 * starts lying the moment a fifth testimonial is added.
 */
export type PageSection =
  | (PageSectionBase & { kind: "hero"; content: HeroContent })
  | (PageSectionBase & { kind: "services"; content: ServicesContent })
  | (PageSectionBase & { kind: "about"; content: AboutContent })
  | (PageSectionBase & { kind: "testimonials"; content: TestimonialsContent })
  | (PageSectionBase & { kind: "pricing"; content: PricingContent })
  | (PageSectionBase & { kind: "faq"; content: FaqContent })
  | (PageSectionBase & { kind: "contact"; content: ContactContent })
  | (PageSectionBase & { kind: "gallery"; content: GalleryContent });

/* -- Responsive ------------------------------------------------------------ */

/**
 * Three widths, widest first. `desktop` is the base every section is authored
 * at; the other two only ever hold overrides, so a page with no responsive
 * work carries no extra data at all.
 */
export type PageBreakpoint = "desktop" | "tablet" | "mobile";

export type SectionStyleProperty = keyof SectionStyle;

/**
 * One dial and the value it is being set to. Distributing over the property
 * keeps `value` tied to the property it belongs to, so a patch carrying
 * `{ property: "columns", value: "roomy" }` cannot be constructed.
 */
export type SectionStylePatch = {
  [P in SectionStyleProperty]: { property: P; value: SectionStyle[P] };
}[SectionStyleProperty];

/** The same pairing, addressed to one section at one breakpoint. */
export type SectionStyleDecl = {
  sectionId: ID;
  breakpoint: PageBreakpoint;
} & SectionStylePatch;

/** `${sectionId}:${breakpoint}:${property}` — see `styleDeclKey`. */
export type SectionStyleDeclKey = string;

/**
 * A flat table rather than styles nested inside sections. One key answers "is
 * this dial set at this breakpoint?", which is exactly what the inspector has
 * to show, and clearing an override is deleting one entry instead of pruning
 * a tree.
 */
export type SectionStyleOverrides = Record<SectionStyleDeclKey, SectionStyleDecl>;

/* -- Theme ----------------------------------------------------------------- */

export type ThemeFontPairing = "grotesk" | "editorial" | "humanist" | "classic";
export type ThemeRadius = "square" | "soft" | "round";
export type ThemeButtonShape = "square" | "rounded" | "pill";
export type ThemeDensity = "tight" | "regular" | "airy";

/**
 * The look of the *customer's* website, which is not Concierge's look and must
 * never inherit it. Concierge's own surfaces are square-cornered and monochrome
 * by conviction; a florist may want soft corners and a serif, and is right to.
 * The builder chrome and the page being edited are two separate style worlds,
 * and keeping them apart is what the editor's iframe is for.
 */
export interface PageTheme {
  /** Hex. The customer's brand colour, not the Concierge accent. */
  brandColor: string;
  mode: "light" | "dark";
  fonts: ThemeFontPairing;
  radius: ThemeRadius;
  buttonShape: ThemeButtonShape;
  density: ThemeDensity;
}

/* -- Pages and the document ------------------------------------------------ */

export interface ConciergePage {
  id: ID;
  siteId: ID;
  slug: string;
  title: string;
  navLabel: string;
  sections: PageSection[];
  /**
   * Lives on the page, not the document, so a page stays self-contained:
   * duplicating one brings its responsive rules with it.
   */
  styleOverrides: SectionStyleOverrides;
  published: boolean;
  updatedAt: string;
}

/**
 * The only facts about a site that the page renderer actually reads. Narrower
 * than `Site` on purpose: publishing freezes a copy of these alongside the
 * document, and a snapshot should carry what a visitor's page needs, not the
 * workspace's internal launch state.
 *
 * `Site` satisfies this structurally, so the editor still passes its own.
 */
export interface PublishedSiteFacts {
  name: string;
  url: string;
  openingHours: OpeningHours;
}

/**
 * Everything the builder loads and the publisher writes, in one object. The
 * theme sits here rather than on a page because it is the site's, and a site
 * whose pages disagreed about their own typography would not look like a site.
 */
export interface PageDocument {
  /** Bumped whenever this shape changes, so stored documents can be migrated. */
  version: number;
  siteId: ID;
  theme: PageTheme;
  pages: ConciergePage[];
  updatedAt: string;
}

/* ---- The answer layer: what machines can read ---------------------------- */

/**
 * Concierge already holds the thing every assistant is guessing at: an
 * owner-approved, structured, current set of answers about the business.
 * These are the surfaces that publish it outward, so the answer a customer
 * gets in ChatGPT comes from the same knowledge as the answer they would
 * get on the site.
 */
export type PublishedSurfaceKind =
  | "structured-data" // schema.org JSON-LD, emitted by the same script tag
  | "llms-txt" // a maintained index of the approved answers
  | "answer-mirror" // clean Markdown of each approved item
  | "mcp" // a hosted endpoint an assistant can call directly
  | "agent-card"; // what this business can do, at a well-known address

export type PublishedSurfaceState = "live" | "ready" | "off" | "blocked";

export interface PublishedSurface {
  id: ID;
  siteId: ID;
  kind: PublishedSurfaceKind;
  url: string;
  state: PublishedSurfaceState;
  /** Approved items currently exposed. Never includes restricted material. */
  itemsExposed: number;
  lastPublishedAt?: string;
  /** Times an assistant fetched it in the last 30 days. */
  fetches30d: number;
  /** Set when state is "blocked": what stops it, and the one fix. */
  blocker?: { reason: string; remedy: string };
}

export type AssistantName = "chatgpt" | "claude" | "perplexity" | "gemini";

/**
 * How an assistant answered when asked about this business. Ordered by how
 * much it costs the owner: an absent answer loses the customer entirely, an
 * outdated one loses them at the door.
 */
export type MentionVerdict = "accurate" | "incomplete" | "outdated" | "absent";

export interface AssistantAnswer {
  id: ID;
  siteId: ID;
  assistant: AssistantName;
  question: string;
  verdict: MentionVerdict;
  /** What it actually said, quoted rather than summarised. */
  quote: string;
  checkedAt: string;
  /** The approved item that would put it right, when one exists. */
  fixWithItemId?: ID;
  /** Where the answer should live when nothing covers it yet. */
  suggestedCategory?: KnowledgeCategory;
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
  /** When the owner answered it. The clock attribution is measured from. */
  resolvedAt?: string;
  /** The knowledge the answer became, so what it earned can be traced. */
  knowledgeItemId?: ID;
}

export interface IntentBreakdown {
  intent: VisitorIntent;
  count: number;
  share: number;
  conversionRate: number;
}

/* ---- Activity ----------------------------------------------------------- */

export type ActivityKind =
  "conversation" | "lead" | "action" | "routing" | "knowledge" | "install" | "system";

export interface ActivityEvent {
  id: ID;
  kind: ActivityKind;
  title: string;
  detail?: string;
  at: string;
  siteId: ID;
  href?: string;
}
