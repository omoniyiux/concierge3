"use client";

import { useMemo, useState } from "react";
import { Badge, Button, Field, Input, Panel, cx } from "@/components/ui";
import { CheckIcon, ChevronDown, CopyIcon, ExternalIcon, LockIcon } from "@/components/icons";
import { DESTINATION_STICKER } from "@/components/stickers/maps";
import { ALL_MOMENTS, MOMENT_CHIP, MOMENT_LABEL } from "@/components/routing/MomentLabels";
import { CHANNELS, type ChannelSpec } from "@/lib/routing-channels";
import type { Destination, DestinationKind, RoutingMoment } from "@/lib/types";

/* ============================================================================
   CHANNEL CONNECT
   ----------------------------------------------------------------------------
   Choosing where a handoff lands, and setting it up.

   The strip along the top is the list of kinds, not the list of things already
   connected — an owner looking for Telegram should find Telegram, whether or
   not anyone has connected it yet. Selecting one opens the setup for that kind
   below it, and each kind gets the setup it actually needs rather than a
   shared "paste a URL" form.

   Every panel ends the same way: which moments this should hear about, and
   whether to switch it on now. Those two answers are the destination; the
   credentials above them are just how it is reached.
   ========================================================================== */

export function ChannelConnect({
  destinations,
  onConnect,
  initialKind,
}: {
  destinations: Destination[];
  onConnect: (d: Omit<Destination, "id" | "siteId">) => void;
  initialKind?: DestinationKind;
}) {
  const [kind, setKind] = useState<DestinationKind>(initialKind ?? "email");
  const spec = useMemo(() => CHANNELS.find((c) => c.kind === kind) ?? CHANNELS[0], [kind]);
  const existing = destinations.find((d) => d.kind === kind);

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="t-section">Routing destination</h2>
          <p className="t-body-sm mt-1 text-text-tertiary">
            Choose a destination below to set it up, or to test one you already have.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={destinations.length ? "approved" : "neutral"}>
            {destinations.filter((d) => d.status === "connected").length} connected
          </Badge>
        </div>
      </div>

      {/* The kinds, always all of them ------------------------------------ */}
      {/* Wraps rather than scrolls: a kind hidden past the right edge of a
          scroller is a kind an owner concludes you do not support. */}
      <div className="mt-4 flex flex-wrap gap-2 border-b border-divider pb-4">
        {CHANNELS.map((c) => {
          const Sticker = DESTINATION_STICKER[c.kind];
          const live = destinations.some((d) => d.kind === c.kind && d.status === "connected");
          const active = c.kind === kind;
          return (
            <button
              key={c.kind}
              type="button"
              aria-pressed={active}
              onClick={() => setKind(c.kind)}
              className={cx(
                "flex h-11 shrink-0 items-center gap-2.5 border px-3.5 text-[12.5px] font-medium",
                "transition-[background-color,border-color,color] duration-[var(--dur-micro)]",
                active
                  ? "border-ink bg-ink text-text-inverse"
                  : "border-line-strong bg-surface text-text-secondary hover:border-ink hover:text-text-primary",
              )}
            >
              <Sticker size={22} />
              {c.label}
              {live && (
                <span
                  aria-label="connected"
                  className={cx("h-1.5 w-1.5 rounded-full", active ? "bg-white" : "bg-success")}
                />
              )}
            </button>
          );
        })}
      </div>

      <ChannelPanel key={kind} spec={spec} existing={existing} onConnect={onConnect} />
    </section>
  );
}

/* ---- One kind, set up the way that kind is actually set up --------------- */

function ChannelPanel({
  spec,
  existing,
  onConnect,
}: {
  spec: ChannelSpec;
  existing?: Destination;
  onConnect: (d: Omit<Destination, "id" | "siteId">) => void;
}) {
  const [name, setName] = useState(existing?.name ?? spec.defaultName);
  const [target, setTarget] = useState(existing?.target ?? "");
  const [moments, setMoments] = useState<RoutingMoment[]>(existing?.moments ?? spec.defaultMoments);
  const [turnOn, setTurnOn] = useState(true);
  const [granted, setGranted] = useState(false);
  const [room, setRoom] = useState("");
  const [fallbackOpen, setFallbackOpen] = useState(false);
  const [fallbackUrl, setFallbackUrl] = useState("");
  const [pairCode, setPairCode] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState<string | null>(null);
  const [secret, setSecret] = useState("");
  const [securityOpen, setSecurityOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggle = (m: RoutingMoment) =>
    setMoments((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));

  const resolvedTarget =
    spec.style === "oauth"
      ? room || fallbackUrl
      : spec.style === "pairing"
        ? pairCode
          ? `${spec.pairing?.handle} · paired`
          : ""
        : spec.style === "workspace"
          ? workspace ?? ""
          : target;

  const ready =
    spec.style === "app" ? false : Boolean(name.trim()) && Boolean(resolvedTarget) && moments.length > 0;

  const save = () => {
    onConnect({
      kind: spec.kind,
      name: name.trim(),
      target: resolvedTarget,
      status: turnOn ? "untested" : "paused",
      moments,
      signingSecret: secret || undefined,
    });
    setSaved(true);
  };

  return (
    <Panel className="mt-4 p-6">
      <div className="flex flex-wrap items-center gap-2.5">
        <h3 className="t-section">{spec.label}</h3>
        {existing ? (
          // The real status, not a green tick for anything that exists: a
          // destination saved but never proven is exactly the thing an owner
          // needs to be told about.
          <Badge
            tone={
              existing.status === "failing"
                ? "restricted"
                : existing.status === "connected"
                  ? "approved"
                  : "review"
            }
          >
            {existing.status === "failing"
              ? "Failing"
              : existing.status === "connected"
                ? "Connected"
                : existing.status === "paused"
                  ? "Paused"
                  : "Saved, never tested"}
          </Badge>
        ) : (
          <Badge tone="neutral">{spec.style === "app" ? "Always on" : "Not connected"}</Badge>
        )}
      </div>
      <p className="t-body mt-2 text-text-secondary">{spec.blurb}</p>
      {spec.note && <p className="t-body-sm mt-1.5 max-w-[76ch] text-text-tertiary">{spec.note}</p>}

      {/* ---- The part that differs, per kind --------------------------- */}

      {spec.style === "app" && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {spec.appLinks?.map((a) => (
            <div
              key={a.label}
              className="flex items-center gap-3 border border-line-strong bg-surface-subtle px-4 py-3.5"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[12.5px] font-semibold">{a.label}</p>
                <p className="mt-0.5 text-[11.5px] text-text-tertiary">{a.sub}</p>
              </div>
              <ExternalIcon size={14} className="shrink-0 text-text-muted" />
            </div>
          ))}
        </div>
      )}

      {spec.style === "field" && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Name your connection" htmlFor={`${spec.kind}-name`}>
            <Input id={`${spec.kind}-name`} value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label={spec.target!.label} htmlFor={`${spec.kind}-target`}>
            <Input
              id={`${spec.kind}-target`}
              type={spec.target!.type ?? "text"}
              value={target}
              placeholder={spec.target!.placeholder}
              onChange={(e) => setTarget(e.target.value)}
            />
          </Field>
        </div>
      )}

      {spec.style === "oauth" && (
        <div className="mt-5">
          <Field label="Name your connection" htmlFor={`${spec.kind}-name`} className="max-w-[420px]">
            <Input id={`${spec.kind}-name`} value={name} onChange={(e) => setName(e.target.value)} />
          </Field>

          <div className="mt-4 border border-line-strong bg-surface-subtle p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-[60ch]">
                <p className="t-card">Connect a {spec.label} channel</p>
                <p className="t-body-sm mt-1 text-text-tertiary">
                  Choose the workspace and channel that should receive Concierge handoffs. Concierge will
                  send routed visitor requests there automatically.
                </p>
              </div>
              <Button size="sm" onClick={() => setGranted(true)} disabled={granted}>
                {granted ? "Access granted" : `Connect ${spec.label}`}
              </Button>
            </div>

            <ol className="mt-4 grid gap-2 sm:grid-cols-3">
              {spec.steps?.map((s, i) => {
                const state = granted ? (i === 0 ? "done" : i === 1 && room ? "done" : "todo") : "todo";
                return (
                  <li
                    key={s}
                    className={cx(
                      "border bg-surface px-3.5 py-3",
                      state === "done" ? "border-success-line" : "border-line",
                    )}
                  >
                    <p className="t-eyebrow flex items-center gap-1.5 text-text-muted">
                      {state === "done" && <CheckIcon size={11} strokeWidth={2.6} className="text-success" />}
                      Step {i + 1}
                    </p>
                    <p className="mt-1.5 text-[12.5px] font-medium">{s}</p>
                  </li>
                );
              })}
            </ol>

            {granted && (
              <div className="cg-enter mt-4 max-w-[420px]">
                <Field label="Which channel?" htmlFor={`${spec.kind}-room`}>
                  <Input
                    id={`${spec.kind}-room`}
                    value={room}
                    placeholder="#leads"
                    onChange={(e) => setRoom(e.target.value)}
                  />
                </Field>
              </div>
            )}
          </div>

          {spec.fallback && (
            <Disclosure
              open={fallbackOpen}
              onToggle={() => setFallbackOpen((o) => !o)}
              summary={spec.fallback.summary}
            >
              <p className="t-body-sm mb-3 text-text-tertiary">
                For teams whose administrator will not approve an app. Paste the URL {spec.label} gives you
                and Concierge will post to it directly.
              </p>
              <Input
                value={fallbackUrl}
                placeholder={spec.fallback.placeholder}
                onChange={(e) => setFallbackUrl(e.target.value)}
              />
            </Disclosure>
          )}
        </div>
      )}

      {spec.style === "pairing" && spec.pairing && (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <Field label="Name your connection" htmlFor={`${spec.kind}-name`}>
            <Input id={`${spec.kind}-name`} value={name} onChange={(e) => setName(e.target.value)} />
          </Field>

          <div className="border border-line-strong bg-surface-subtle p-4">
            <p className="text-[12.5px] font-semibold">Connect {spec.pairing.handle}</p>
            <p className="t-body-sm mt-1.5 leading-[1.55] text-text-secondary">{spec.pairing.instruction}</p>

            {pairCode ? (
              <div className="cg-enter mt-3 flex items-center gap-2 border border-line-strong bg-surface px-3 py-2.5">
                <code className="t-mono flex-1 select-all text-[12px]">/concierge {pairCode}</code>
                <button
                  type="button"
                  aria-label="Copy the pairing command"
                  onClick={() => navigator.clipboard?.writeText(`/concierge ${pairCode}`)}
                  className="shrink-0 text-text-muted transition-colors hover:text-text-primary"
                >
                  <CopyIcon size={14} />
                </button>
              </div>
            ) : (
              <p className="mt-3 text-[11.5px] text-text-tertiary">
                The code expires after ten minutes. Create a new one any time.
              </p>
            )}
          </div>
        </div>
      )}

      {spec.style === "workspace" && spec.workspace && (
        <div className="mt-5">
          <div className="border border-line-strong bg-surface-subtle p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-[60ch]">
                <p className="t-card">{spec.workspace.picker}</p>
                <p className="t-body-sm mt-1 text-text-tertiary">{spec.workspace.creates}</p>
              </div>
              <Button size="sm" onClick={() => setWorkspace("Northlane Dental · Concierge Desk")}>
                {workspace ? "Change workspace" : "Choose workspace"}
              </Button>
            </div>

            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="border border-line bg-surface px-4 py-3">
                <dt className="t-eyebrow text-text-muted">{spec.label} project</dt>
                <dd className={cx("mt-1.5 text-[12.5px] font-medium", !workspace && "text-text-muted")}>
                  {workspace ?? "Not selected"}
                </dd>
              </div>
              <div className="border border-line bg-surface px-4 py-3">
                <dt className="t-eyebrow text-text-muted">Secure connection</dt>
                <dd
                  className={cx(
                    "mt-1.5 flex items-center gap-1.5 text-[12.5px] font-medium",
                    workspace ? "text-success" : "text-text-muted",
                  )}
                >
                  <LockIcon size={12} />
                  {workspace ? "Established" : "Waiting"}
                </dd>
              </div>
            </dl>

            <p className="mt-3 text-[11.5px] leading-[1.5] text-text-tertiary">{spec.workspace.explain}</p>
          </div>
        </div>
      )}

      {spec.security && (
        <Disclosure
          open={securityOpen}
          onToggle={() => setSecurityOpen((o) => !o)}
          summary="Advanced security option"
        >
          <p className="t-body-sm mb-3 max-w-[70ch] text-text-tertiary">
            Concierge signs every request with this secret in an{" "}
            <code className="t-mono">X-Concierge-Signature</code> header, so your server can prove the
            request came from us. Leave it blank if your endpoint does not check.
          </p>
          <Field label="Signing secret" htmlFor={`${spec.kind}-secret`} className="max-w-[420px]">
            <Input
              id={`${spec.kind}-secret`}
              value={secret}
              placeholder="whsec_…"
              onChange={(e) => setSecret(e.target.value)}
            />
          </Field>
        </Disclosure>
      )}

      {/* ---- The part that is the same for every kind ------------------- */}

      {spec.style !== "app" && (
        <>
          <div className="mt-6 border-t border-divider pt-5">
            <p className="t-eyebrow text-text-muted">When should Concierge send this?</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {ALL_MOMENTS.map((m) => {
                const on = moments.includes(m);
                const primary = spec.primaryMoment === m;
                return (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={on}
                    title={MOMENT_LABEL[m]}
                    onClick={() => toggle(m)}
                    className={cx(
                      "h-8 border px-3 text-[12px] font-medium transition-colors duration-[var(--dur-micro)]",
                      on
                        ? "border-ink bg-ink text-text-inverse"
                        : "border-line-strong bg-surface text-text-tertiary hover:border-ink hover:text-text-primary",
                    )}
                  >
                    {MOMENT_CHIP[m]}
                    {primary && !on && <span className="ml-1.5 text-accent">·</span>}
                  </button>
                );
              })}
            </div>
            {spec.primaryMoment && (
              <p className="mt-2.5 text-[11.5px] text-text-tertiary">
                {MOMENT_LABEL[spec.primaryMoment]} is the moment this destination exists for.
              </p>
            )}
            {moments.length === 0 && (
              <p className="mt-2.5 text-[11.5px] text-danger">
                Pick at least one, or this destination will never hear anything.
              </p>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            {/* The grant button above already says "Connect Slack"; this one
                saves the destination that grant produced, so it must not
                repeat the same words back. */}
            <Button onClick={save} disabled={!ready || saved}>
              {saved
                ? "Saved"
                : spec.style === "oauth"
                  ? `Save ${spec.label} channel`
                  : spec.style === "workspace"
                    ? `Save ${spec.label} desk`
                    : spec.style === "pairing"
                      ? `Save ${spec.label}`
                      : spec.connectLabel}
            </Button>

            {spec.style === "pairing" && !pairCode && (
              <Button variant="secondary" onClick={() => setPairCode("NL-4827-QK")}>
                Create {spec.label} code
              </Button>
            )}

            <TurnOnNow checked={turnOn} onChange={setTurnOn} />

            {saved && (
              <p className="cg-enter flex items-center gap-1.5 text-[11.5px] font-medium text-success">
                <CheckIcon size={13} strokeWidth={2.4} />
                Added. Run a route check to prove it delivers.
              </p>
            )}
          </div>
        </>
      )}
    </Panel>
  );
}

/* ---- Small shared pieces ------------------------------------------------- */

/**
 * Connecting and switching on are two decisions. Collapsing them means an
 * owner who is mid-setup starts paging a phone at three in the morning.
 */
function TurnOnNow({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2 text-[12.5px] font-medium"
    >
      <span
        className={cx(
          "flex h-[17px] w-[17px] shrink-0 items-center justify-center border transition-colors",
          checked ? "border-ink bg-ink text-white" : "border-line-strong bg-surface",
        )}
      >
        {checked && <CheckIcon size={12} strokeWidth={2.6} />}
      </span>
      Turn on now
    </button>
  );
}

function Disclosure({
  open,
  onToggle,
  summary,
  children,
}: {
  open: boolean;
  onToggle: () => void;
  summary: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4 border border-line-strong">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-4 py-3 text-left text-[12.5px] font-medium transition-colors hover:bg-surface-subtle"
      >
        <ChevronDown
          size={14}
          className={cx("shrink-0 text-text-muted transition-transform", !open && "-rotate-90")}
        />
        {summary}
      </button>
      {open && <div className="cg-enter border-t border-divider p-4">{children}</div>}
    </div>
  );
}
