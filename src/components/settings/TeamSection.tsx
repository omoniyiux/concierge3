"use client";

import { useState } from "react";
import { Badge, Button, Field, Input, Panel, RadioCard, SectionHead, Select } from "@/components/ui";
import { Modal, ModalSection } from "@/components/ui/Modal";
import { CheckIcon, MailIcon, SettingsIcon, ShieldIcon, TeamIcon } from "@/components/icons";
import { ORG, SITES, TEAM } from "@/lib/demo-data";
import { relativeTime } from "@/lib/format";
import type { TeamMember } from "@/lib/types";

/* ============================================================================
   TEAM
   Who can see what, and the one flow that changes it. An invitation is a
   real decision — what they may open, and which sites — so the dialog asks
   both rather than handing out an "invited" state and hoping.
   ========================================================================== */

const ROLES = [
  {
    key: "operator",
    label: "Operator",
    description: "Reads conversations and leads, and can take a thread over. Cannot change settings.",
    Icon: TeamIcon,
  },
  {
    key: "admin",
    label: "Admin",
    description: "Everything an operator can do, plus Site Brain, routing, actions and appearance.",
    Icon: SettingsIcon,
  },
  {
    key: "owner",
    label: "Owner",
    description: "Full access including billing, team and deleting a site. There can be more than one.",
    Icon: ShieldIcon,
  },
] as const;

export function TeamSection({ siteId }: { siteId: string }) {
  const [team, setTeam] = useState<TeamMember[]>(TEAM);
  const [inviting, setInviting] = useState(false);
  const seatsUsed = team.filter((m) => m.status !== "invited").length;

  return (
    <>
      <Panel className="overflow-hidden">
        <SectionHead
          title="Who can see what"
          hint={`${seatsUsed} of ${ORG.seatsIncluded} seats used on the ${ORG.plan} plan.`}
          action={
            <Button size="sm" onClick={() => setInviting(true)}>
              Invite someone
            </Button>
          }
          className="p-5 pb-4 sm:p-6 sm:pb-4"
        />
        <ul className="divide-y divide-divider border-t border-divider">
          {team.map((m) => (
            <li
              key={m.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-2.5 px-5 py-3.5 sm:px-6 sm:py-4"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center bg-surface-subtle text-[10px] font-semibold text-text-secondary">
                {(m.name || m.email)
                  .split(/[\s@]/)
                  .slice(0, 2)
                  .map((w) => w[0]?.toUpperCase())
                  .join("")}
              </span>
              <span className="min-w-[160px] flex-1">
                <span className="block truncate text-[12.5px] font-medium">{m.name || m.email}</span>
                <span className="block truncate text-[12.5px] text-text-tertiary">
                  {m.name ? m.email : `Invited ${m.invitedAt ? relativeTime(m.invitedAt) : "just now"}`}
                </span>
              </span>
              <Badge tone={m.role === "owner" ? "accent" : "neutral"}>{m.role}</Badge>
              <span className="text-[12.5px] text-text-tertiary">
                {m.siteIds === null ? "All sites" : `${m.siteIds.length} site`}
              </span>
              {m.status === "invited" && <Badge tone="review">Pending</Badge>}
            </li>
          ))}
        </ul>
      </Panel>

      <InviteModal
        open={inviting}
        siteId={siteId}
        seatsLeft={ORG.seatsIncluded - seatsUsed}
        onClose={() => setInviting(false)}
        onInvite={(member) => {
          setTeam((t) => [...t, member]);
          setInviting(false);
        }}
      />
    </>
  );
}

function InviteModal({
  open,
  siteId,
  seatsLeft,
  onClose,
  onInvite,
}: {
  open: boolean;
  siteId: string;
  seatsLeft: number;
  onClose: () => void;
  onInvite: (member: TeamMember) => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<(typeof ROLES)[number]["key"]>("operator");
  const [scope, setScope] = useState<"this" | "all">("this");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());

  function reset() {
    setEmail("");
    setRole("operator");
    setScope("this");
    setSending(false);
    setSent(false);
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      eyebrow="Team"
      title={sent ? "Invitation sent" : "Invite someone"}
      description={
        sent
          ? `${email} has been emailed a link. It expires in 7 days, and you can revoke it at any time.`
          : "They get an email with a link. Nothing is shared with them until they accept it."
      }
      footer={
        sent ? (
          <Button
            leading={<CheckIcon size={13} />}
            onClick={() => {
              onInvite({
                id: `t_${Date.now()}`,
                name: "",
                email: email.trim(),
                role,
                scopes: role === "operator" ? ["messages"] : ["messages", "routing", "insights", "settings"],
                siteIds: scope === "all" ? null : [siteId],
                status: "invited",
                invitedAt: new Date().toISOString(),
              });
              reset();
            }}
          >
            Done
          </Button>
        ) : (
          <>
            <Button
              variant="tertiary"
              onClick={() => {
                reset();
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button
              loading={sending}
              disabled={!valid || seatsLeft <= 0}
              leading={<MailIcon size={13} />}
              onClick={() => {
                setSending(true);
                setTimeout(() => {
                  setSending(false);
                  setSent(true);
                }, 650);
              }}
            >
              Send invitation
            </Button>
          </>
        )
      }
    >
      {sent ? (
        <ModalSection>
          <div className="flex items-start gap-3 border border-success-line bg-success-soft p-4">
            <CheckIcon size={16} className="mt-px shrink-0 text-success" strokeWidth={2.4} />
            <div className="min-w-0">
              <p className="text-[12.5px] font-medium text-success">
                {email.trim()} · {role}
              </p>
              <p className="mt-1 text-[12px] leading-[1.5] text-text-secondary">
                {scope === "all" ? "Access to every site in this workspace." : "Access to this site only."}{" "}
                They show as pending in the list until they accept.
              </p>
            </div>
          </div>
        </ModalSection>
      ) : (
        <>
          <ModalSection>
            <Field
              label="Email address"
              htmlFor="invite-email"
              hint={
                seatsLeft > 0
                  ? `${seatsLeft} seat${seatsLeft === 1 ? "" : "s"} left on your plan.`
                  : "No seats left — change your plan to add another person."
              }
            >
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@northlanedental.com"
              />
            </Field>
          </ModalSection>

          <ModalSection title="What they can do">
            <div className="space-y-2.5">
              {ROLES.map((r) => (
                <RadioCard
                  key={r.key}
                  selected={role === r.key}
                  onSelect={() => setRole(r.key)}
                  label={r.label}
                  description={r.description}
                  icon={<r.Icon size={16} />}
                />
              ))}
            </div>
          </ModalSection>

          <ModalSection title="Which sites">
            <Select
              value={scope}
              onChange={(e) => setScope(e.target.value as "this" | "all")}
              aria-label="Which sites"
            >
              <option value="this">This site only — {SITES.find((s) => s.id === siteId)?.name}</option>
              <option value="all">All {SITES.length} sites in this workspace</option>
            </Select>
          </ModalSection>
        </>
      )}
    </Modal>
  );
}
