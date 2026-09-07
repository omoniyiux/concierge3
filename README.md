# Symphony

A pixel-calibrated rebuild of the Symphony workspace — an AI operating system for
running a small business. One conversation on the surface, Maestro coordinating
specialist agents underneath.

Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · TypeScript.

```bash
npm run dev     # http://localhost:3000
npm run build
npm run lint
```

## A note on the palette

The written design direction specifies a blue primary (`#0C6EFC`). The product in
the reference screenshots does not use it: the primary action colour is **black**,
with a lime accent reserved for commercial moments (Upgrade, the logo, the
"connect your tools" card). Since the brief asked for a pixel-perfect
implementation of those screenshots, the screenshots won. Blue survives only as
the `working` agent status and the keyboard focus ring, where the doc's semantics
still hold.

## Calibration

Every value below was measured off the reference screenshots (1440×900 at DPR 2)
rather than estimated, then verified by re-measuring the rendered output.

| | Measured | Built |
|---|---|---|
| Brand lime | `#B9FD82` | `--color-brand` |
| Canvas | `#F3F3F3` | `--color-canvas` |
| Sidebar width | 259px | 260px |
| Sidebar header | 84px | 84px |
| Nav row / pitch | 34px / 38.5px | 34px / 38px |
| Content column | 1008px centred | `max-w-[1074px] px-8` → 1010px |
| Page title | 38px | 38px |
| Section heading | 16px | 16px |
| Row title / body | 13.5px | 13.5px |
| Nav label | 14px | 14px |
| Greeting / date | 31px / 48px @ 0.82 | same |
| Settings row | 64px two-line, 44px one-line | same |
| Connector card | 328px wide, 12px gutter | same |

The body scale is noticeably tighter than the written spec (13.5px vs 15–16px).
That is what the product actually renders, so that is what is here.

## Assets

- **Type** — Wix Madefor Display + Wix Madefor Text via `next/font/google`, with
  Source Serif 4 for the editorial counterpoint in the "This *didn't load*" and
  weekly-pulse cards.
- **Logo** — the real mark, pulled from `symphony.wix.com`, redrawn as SVG
  (`SymphonyMark`) so it stays crisp and can be recoloured for the ring loader.
- **Icons** — a hand-built 24px set on a 1.7px stroke (`components/icons`).
  Connector brand marks are inline SVG, so no page waits on a third-party host.
- **QR** — a real, scannable code, generated at build time.

## Structure

```
src/
  app/
    home/         Greeting, mobile app, connect-tools, widget grid
    agents/       Empty state — what this is, why it's empty, what's next
    connectors/   Orbital graph, Tools/Channels, 24-connector directory
    account/      Profile, plan meters, preferences
    chat/         Maestro at full width
    whatsapp/     Phone verification
  components/
    shell/        AppShell, Sidebar + collapsed rail, MobileNav,
                  CommandMenu (⌘K), PhoneModal, Avatar
    chat/         ChatSurface — bubble → dock → expanded
    connectors/   ConnectorGraph
    home/         ConnectToolsMosaic, PageIssueBanner
    ui/           Button, IconButton, Card, Input, Toggle, Segmented,
                  ProgressBar, StatusPill, Badge, RingLoader, WorkingState,
                  Skeleton, DidntLoadCard, EmptyState, Tooltip
  lib/            workspace context, connector + conversation data
```

## Behaviour worth knowing

- **Maestro follows you.** The conversation has four modes — closed, a floating
  bubble, a 400px dock beside the workspace, and full width. On mobile the dock
  and expanded modes both become full-screen; Maestro is never demoted to a
  cramped column.
- **⌘K / Ctrl K** opens the command surface over pages, agents, conversations and
  connectors. It searches the workspace; it does not turn every keystroke into an
  AI request.
- **Status is never colour alone.** `StatusPill` always pairs its dot with a label.
- **No "Loading…".** `WorkingState` names the agent and the task; `DidntLoadCard`
  says what happened and what happens next.
- **The dialog belongs to the workspace,** not the whole app — navigation stays
  sharp and reachable behind the phone-verification modal, as in the product.
- Every interactive component carries hover, focus, active, disabled and loading
  states; icon-only controls carry accessible labels and tooltips.
