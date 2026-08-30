"use client";

import { useState } from "react";
import { Badge, Button, Textarea } from "@/components/ui";
import { CheckIcon, ClockIcon, MailIcon, PhoneIcon, SparkIcon } from "@/components/icons";
import { CHANNEL_LABEL, clockTime, relativeTime } from "@/lib/format";
import type { FollowUp } from "@/lib/types";

/* ============================================================================
   FOLLOW-UP CARD
   ----------------------------------------------------------------------------
   The draft Concierge wants to send once the visitor has gone. It sits in the
   thread it belongs to, not in a separate queue, because the only way to
   judge a follow-up is against the conversation that earned it.

   The owner can change every word before it goes. That is the point: an
   agent that writes and waits gets switched on; an agent that writes and
   sends gets switched off.
   ========================================================================== */

export function FollowUpCard({
  followUp,
  onApprove,
  onDecline,
}: {
  followUp: FollowUp;
  onApprove: (body: string) => void;
  onDecline: () => void;
}) {
  const [body, setBody] = useState(followUp.body);
  const [editing, setEditing] = useState(false);
  const edited = body.trim() !== followUp.body.trim();

  if (followUp.state === "sent") {
    return (
      <div className="border border-line bg-surface p-4">
        <p className="flex items-center gap-2 text-[11.5px] text-text-tertiary">
          <CheckIcon size={13} className="text-success" strokeWidth={2.4} />
          Follow-up sent by {CHANNEL_LABEL[followUp.channel].toLowerCase()} to {followUp.to}
          {followUp.sentAt && ` · ${relativeTime(followUp.sentAt)}`}
        </p>
      </div>
    );
  }

  if (followUp.state === "declined") {
    return (
      <div className="border border-line bg-surface p-4">
        <p className="text-[11.5px] text-text-tertiary">
          You decided not to send this one. Concierge will not draft it again.
        </p>
      </div>
    );
  }

  if (followUp.state === "approved") {
    return (
      <div className="border border-approved-soft bg-approved-soft p-4">
        <p className="flex items-center gap-2 text-[12px] font-medium text-approved">
          <CheckIcon size={14} strokeWidth={2.4} />
          Approved — goes out at {clockTime(followUp.sendAfter)}
        </p>
        <p className="mt-1.5 text-[11.5px] leading-[1.5] text-text-secondary">
          To {followUp.to} by {CHANNEL_LABEL[followUp.channel].toLowerCase()}
          {edited && ". Your edits were kept."}
        </p>
      </div>
    );
  }

  const ChannelIcon = followUp.channel === "sms" || followUp.channel === "whatsapp" ? PhoneIcon : MailIcon;

  return (
    <div className="border border-accent-line bg-accent-subtle p-4">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <p className="flex items-center gap-2 text-[13px] font-medium text-accent-ink">
          <SparkIcon size={14} />
          Concierge wants to follow this up
        </p>
        <Badge tone="accent">
          <ClockIcon size={11} />
          Held until {clockTime(followUp.sendAfter)}
        </Badge>
      </div>

      <p className="mt-2 text-[11.5px] leading-[1.5] text-text-secondary">{followUp.reason}</p>

      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-text-tertiary">
        <ChannelIcon size={12} />
        {CHANNEL_LABEL[followUp.channel]} to {followUp.to}
      </p>

      {editing ? (
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          className="mt-2"
          aria-label="Edit the follow-up before it goes"
        />
      ) : (
        <p className="mt-2 border border-line-strong bg-surface p-3 text-[12px] leading-[1.6] text-text-primary">
          {body}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => onApprove(body)}>
          {edited ? "Send my version" : "Approve and send"}
        </Button>
        <Button size="sm" variant="secondary" onClick={() => setEditing((v) => !v)}>
          {editing ? "Done editing" : "Edit it"}
        </Button>
        <Button size="sm" variant="tertiary" onClick={onDecline}>
          Do not send
        </Button>
        <span className="ml-auto text-[10px] text-text-tertiary">
          Drafted {relativeTime(followUp.draftedAt)}
        </span>
      </div>
    </div>
  );
}
