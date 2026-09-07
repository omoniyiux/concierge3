# Concierge

A complete rebuild of the Concierge product experience — the same product, redesigned
with the design discipline established in the Symphony study and Concierge's own identity.

Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · TypeScript. No UI dependencies.

```bash
npm run dev     # http://localhost:3000
npm run build
npm run lint
```

## What this is, and what it is not

**Preserved:** the product. Terminology (Agent, Site Brain, routing destinations, moments,
requests), the required seven Site Brain cards, the six routing moments, the launch
sequence, the entitlement model, and the multi-tenant shape — all taken from `PRD.md`
in the existing `concierge-source` codebase and from the product screenshots.

**Replaced:** the experience. Information architecture, visual system, density,
interaction quality, empty/loading/error states, responsive behaviour.

`concierge-source` was read, not modified. The Symphony implementation is preserved on
the `symphony-reference` branch and the `symphony-v1` tag.

## Design system

Symphony's *discipline* — calm canvas, borders before shadows, restrained colour, one
primary action per surface, type carrying the hierarchy. Concierge's *identity*.

| | Value | Source |
|---|---|---|
| Canvas | `#FAFAF8` warm paper | poweredbyconcierge.com |
| Ink (primary action) | `#0A0A0A` | poweredbyconcierge.com |
| Accent | `#FF7A00` | poweredbyconcierge.com |
| Text secondary | `#5E5D59` | poweredbyconcierge.com |
| Borders | `#E8E8E3` / `#D4D4CE` | poweredbyconcierge.com |
| Sans | Inter Tight | the site's own `--font-inter-tight` |
| Serif | Newsreader | loaded by the site |
| Mono | JetBrains Mono | loaded by the site |

Orange is a signal, never decoration: the active nav marker, the one suggested next
step, the crawl in progress, an opportunity. It is never the primary button — that is
always ink, exactly as the live product does it.

All tokens live in `src/app/globals.css` under `@theme`. Nothing is hardcoded in a
component; there are no arbitrary hex values, radii or shadows in the tree.

Type is a named scale (`.t-display`, `.t-page`, `.t-section`, `.t-card`, `.t-body`,
`.t-body-sm`, `.t-meta`, `.t-eyebrow`, `.t-num`, `.t-serif`, `.t-mono`) rather than
per-component sizes.

## Information architecture

Nine destinations in four groups, following the product's own mental model rather
than listing every feature:

```
Overview
UNDERSTAND   Site Brain
ENGAGE       Agent · Conversations · Leads
AUTOMATE     Actions · Routing
GROW         Insights · Pages · Integrations
             Settings · Help
```

Preview lives inside Agent (you configure and test in one place). Team, billing and
security live inside Settings. Growth and Contacts from the old build fold into
Insights and Leads.

## Routes

```
/                              Landing — built last, from real product UI
/sign-in /create-account /verify-email /forgot-password
/onboarding                    URL → crawl → review → agent → routing → preview → install
/sites/[siteId]/overview       What happened, what needs you, what to do next
/sites/[siteId]/brain          Site Brain — needs-you / library / sources
/sites/[siteId]/agent          Identity · behaviour · rules · live preview
/sites/[siteId]/conversations  Three-pane inbox with sources and confidence
/sites/[siteId]/leads          Ranked by score, expandable detail
/sites/[siteId]/actions        What it does · when · what it collects · what happens next
/sites/[siteId]/routing        Rules · destinations · delivery history
/sites/[siteId]/insights       Unanswered questions first, charts second
/sites/[siteId]/pages          Concierge Pages editor with live preview
/sites/[siteId]/integrations   Connected, available, coming soon
/sites/[siteId]/settings       Seven sub-sections, not one long page
/help /account
```

## Data architecture

`src/lib/types.ts` is the contract: `Organization`, `Site`, `SiteBrain`,
`KnowledgeItem`, `CrawlRun`, `AgentConfig`, `Conversation`, `Message`, `Lead`,
`ActionDef`, `Destination`, `RoutingRule`, `DeliveryRecord`, `Integration`,
`ConciergePage`, `Metric`, `UnansweredQuestion`, `ActivityEvent`, `TeamMember`.

`src/lib/demo-data.ts` exports `IS_DEMO_DATA = true` and is the only source of fixtures.
No component invents product data. Swapping in a real API is a data-layer change.

Multi-tenancy is in the shape from the start: routes are `/sites/[siteId]/…`, the
switcher is Org → Site, team scopes are per-surface and per-site, and `Organization`
carries `isAgency`. Nothing assumes a single website.

## The landing page uses the real product

`src/components/marketing/ProductFrames.tsx` renders the actual workspace components
and tokens — `OverviewFrame`, `SiteBrainFrame`, `AgentFrame`, `LeadFrame`,
`RoutingFrame`, `InsightsFrame` — inside a window chrome. The marketing site therefore
shows the product rather than a drawing of it, and cannot drift out of date.

## Surfaces worth a look

- **The crawl** (`/onboarding`) — named pages landing one by one with real counts and an
  honest phase, so it reads as learning rather than loading.
- **Site Brain** — every item carries its status, confidence and evidence on the row.
  This is the product's trust surface, so nothing important hides behind a click.
- **Agent preview** — every reply shows its verdict (answered / action / handoff /
  refused safely), its sources and its confidence. The owner is auditing, not chatting.
- **Routing** — rules read as sentences: *If intent is Wants a person → Emergency line.*
- **Insights** — leads with the questions your site could not answer, ranked. Charts
  describe; that list is what you act on.

## States

Every interactive component supports default, hover, focus, active, disabled and
loading. Empty states say what the area is, why it matters and what to do next.
Loading says who is working on what — never "Loading…". Errors say what happened, why,
and the one thing that fixes it.

## Accessibility

Semantic HTML, correct heading order, keyboard navigation, visible focus (`:focus-visible`,
with form controls carrying their own treatment so the ring does not double up),
accessible labels on every icon-only control, `role="switch"` / `"tab"` / `"progressbar"`
where appropriate, status never conveyed by colour alone, and `prefers-reduced-motion`
honoured globally.
