"use client";

import { useState } from "react";
import { Button, Textarea } from "@/components/ui";
import { AgentIcon, GlobeIcon, MailIcon, PhoneIcon, SendIcon, SparkIcon } from "@/components/icons";
import { cx } from "@/lib/cx";
import { CHANNEL_LABEL } from "@/lib/format";
import type { ContactConsent, MessageChannel } from "@/lib/types";

/* ============================================================================
   COMPOSER
   ----------------------------------------------------------------------------
   Until now the inbox could only be read. This is where a person answers.

   Two rules shape it:

   1. The agent does not talk over a human. Taking the thread pauses it, and
      the composer says so rather than leaving the owner to wonder.
   2. A channel the visitor has not agreed to is offered, but disabled, with
      the reason on it. Hiding it would leave the owner guessing why they
      cannot text someone whose number they can see.
   ========================================================================== */

const CHANNEL_ICON: Record<MessageChannel, typeof GlobeIcon> = {
  web: GlobeIcon,
  sms: PhoneIcon,
  whatsapp: PhoneIcon,
  email: MailIcon,
};

const ORDER: MessageChannel[] = ["web", "email", "sms", "whatsapp"];

export function Composer({
  live,
  consent,
  allowed,
  takenOverBy,
  onTakeOver,
  onSend,
}: {
  /** True while the visitor is still on the page and reachable there. */
  live: boolean;
  consent: ContactConsent[];
  /** Channels the agent config permits following up on. */
  allowed: MessageChannel[];
  takenOverBy?: { name: string; at: string };
  onTakeOver: () => void;
  onSend: (channel: MessageChannel, body: string) => void;
}) {
  const options = ORDER.map((channel) => {
    const grant = consent.find((c) => c.channel === channel);
    if (channel === "web") {
      return {
        channel,
        address: "This page",
        enabled: live,
        why: live ? undefined : "They have left the page, so nothing sent here would reach them.",
      };
    }
    if (!grant) {
      return {
        channel,
        address: undefined,
        enabled: false,
        why: `They have not given you ${CHANNEL_LABEL[channel].toLowerCase()} permission in this conversation.`,
      };
    }
    if (!allowed.includes(channel)) {
      return {
        channel,
        address: grant.address,
        enabled: false,
        why: `Your agent is not set up to follow up over ${CHANNEL_LABEL[channel].toLowerCase()}.`,
      };
    }
    return { channel, address: grant.address, enabled: true, why: undefined };
  }).filter((o) => o.enabled || o.address || o.channel === "web");

  const firstEnabled = options.find((o) => o.enabled)?.channel ?? "web";
  const [channel, setChannel] = useState<MessageChannel>(firstEnabled);
  const [body, setBody] = useState("");

  const active = options.find((o) => o.channel === channel);

  if (!takenOverBy) {
    return (
      <footer className="flex flex-wrap items-center gap-3 border-t border-divider bg-surface px-4 py-4 sm:px-6">
        <p className="flex min-w-0 flex-1 items-center gap-2 text-[11.5px] text-text-tertiary">
          <AgentIcon size={14} className="shrink-0 text-accent" />
          Concierge is handling this. Take it over and it stops replying on this thread.
        </p>
        <Button size="sm" variant="secondary" onClick={onTakeOver}>
          Take over
        </Button>
      </footer>
    );
  }

  return (
    <footer className="border-t border-divider bg-surface px-4 py-4 sm:px-6">
      <div className="mb-2.5 flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="t-eyebrow text-text-muted">Send by</span>
        <div className="flex flex-wrap items-center gap-1.5">
          {options.map((o) => {
            const Icon = CHANNEL_ICON[o.channel];
            const selected = o.channel === channel && o.enabled;
            return (
              <button
                key={o.channel}
                type="button"
                disabled={!o.enabled}
                title={o.why}
                aria-pressed={selected}
                onClick={() => setChannel(o.channel)}
                className={cx(
                  "inline-flex h-7 items-center gap-1.5 border px-2.5 text-[11px] font-medium transition-colors duration-[var(--dur-micro)]",
                  selected
                    ? "border-ink bg-surface text-text-primary ring-1 ring-ink"
                    : o.enabled
                      ? "border-line-strong bg-surface text-text-secondary hover:border-line-hover"
                      : "cursor-not-allowed border-line bg-surface-subtle text-text-disabled",
                )}
              >
                <Icon size={12} />
                {CHANNEL_LABEL[o.channel]}
              </button>
            );
          })}
        </div>
      </div>

      {active?.why && !active.enabled && <p className="mb-2 text-[11px] text-text-tertiary">{active.why}</p>}

      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={2}
        className="min-h-[62px]"
        placeholder={
          active?.enabled ? `Reply to ${active.address}…` : "Pick a channel you are allowed to use."
        }
        aria-label="Your reply"
      />

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-1.5 text-[11px] text-text-tertiary">
          <SparkIcon size={12} className="text-accent" />
          {takenOverBy.name} is on this thread. Concierge is holding off.
        </p>
        <Button
          size="sm"
          leading={<SendIcon size={13} />}
          disabled={!body.trim() || !active?.enabled}
          onClick={() => {
            onSend(channel, body.trim());
            setBody("");
          }}
        >
          Send
        </Button>
      </div>
    </footer>
  );
}
