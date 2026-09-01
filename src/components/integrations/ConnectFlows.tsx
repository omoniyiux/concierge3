"use client";

import { useEffect, useState, type ComponentType } from "react";
import { Button, Checkbox, Field, Input, Select, Toggle } from "@/components/ui";
import { Modal, ModalSection, StepList } from "@/components/ui/Modal";
import { AlertIcon, CheckIcon, LockIcon, RefreshIcon } from "@/components/icons";
import { cx } from "@/lib/cx";
import type { Integration } from "@/lib/types";

/* ============================================================================
   THE FOUR THINGS YOU DO TO AN INTEGRATION
   Connect, configure, reconnect, disconnect. Each is a short dialog that ends
   with the card on the page changing state, so a click always produces
   evidence rather than a dead button.
   ========================================================================== */

/** What each tool is actually allowed to do once it is connected. */
const SCOPES: Record<string, string[]> = {
  i_whatsapp: [
    "Send and receive messages on your business number",
    "Continue a website conversation on WhatsApp",
    "Read delivery receipts so the transcript stays honest",
  ],
  i_stripe: [
    "Create payment links for deposits and booking fees",
    "Read the status of a payment it created",
    "Never store a card number — Stripe holds those",
  ],
  i_paypal: ["Create PayPal checkouts for deposits and fees", "Read the status of a checkout it created"],
  i_hubspot: [
    "Create and update contacts from qualified conversations",
    "Attach the transcript to the contact record",
    "Read your pipeline names so leads land in the right one",
  ],
  i_zapier: ["Send Concierge events to your Zaps", "Read the list of Zaps you have published"],
  i_api: ["Read conversations, leads and knowledge", "Write knowledge back into Site Brain"],
};

const DEFAULT_SCOPES = [
  "Receive the conversations you route to it",
  "Read back delivery status so nothing is silently lost",
];

const CONNECT_STEPS = ["Review what it can do", "Sign in and authorise", "Send a test event"];

/** Connecting is three honest steps, not one hopeful button. */
export function ConnectModal({
  integration,
  onClose,
  onConnected,
}: {
  integration: Integration | null;
  onClose: () => void;
  onConnected: (id: string, accountLabel: string) => void;
}) {
  const [step, setStep] = useState(0);
  const [account, setAccount] = useState("");
  const [working, setWorking] = useState(false);

  const key = integration?.id ?? "";
  const [seen, setSeen] = useState("");
  if (integration && seen !== key) {
    setSeen(key);
    setStep(0);
    setAccount("");
    setWorking(false);
  }

  // Step 2 is the round trip to the other service. It ends by itself.
  useEffect(() => {
    if (step !== 1 || !working) return;
    const t = setTimeout(() => {
      setWorking(false);
      setStep(2);
    }, 900);
    return () => clearTimeout(t);
  }, [step, working]);

  if (!integration) return null;

  const scopes = SCOPES[integration.id] ?? DEFAULT_SCOPES;
  const placeholder =
    integration.category === "messaging"
      ? "+1 512 555 0100"
      : integration.category === "crm"
        ? "northlane-dental"
        : "northlanedental.com";

  return (
    <Modal
      open
      onClose={onClose}
      eyebrow={`Connect ${integration.name}`}
      title={
        step === 2 ? `${integration.name} is connected` : `Let Concierge work through ${integration.name}`
      }
      description={
        step === 2
          ? "It is live on this site straight away. Every agent, action and routing rule can use it now."
          : integration.description
      }
      footer={
        step === 2 ? (
          <Button
            leading={<CheckIcon size={13} />}
            onClick={() => onConnected(integration.id, account.trim() || placeholder)}
          >
            Done
          </Button>
        ) : (
          <>
            <Button variant="tertiary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              loading={working}
              disabled={step === 1 && account.trim().length < 3}
              onClick={() => {
                if (step === 0) setStep(1);
                else setWorking(true);
              }}
            >
              {step === 0 ? "Continue" : `Authorise ${integration.name}`}
            </Button>
          </>
        )
      }
    >
      <ModalSection>
        <StepList steps={CONNECT_STEPS} done={step} />
      </ModalSection>

      {step === 0 && (
        <ModalSection title="What it will be allowed to do">
          <ul className="space-y-2">
            {scopes.map((s) => (
              <li key={s} className="flex items-start gap-2.5 text-[12.5px] leading-[1.5]">
                <CheckIcon size={13} className="mt-0.5 shrink-0 text-success" strokeWidth={2.4} />
                {s}
              </li>
            ))}
          </ul>
          <p className="mt-4 flex items-start gap-2.5 bg-surface-subtle p-3.5 text-[12px] leading-[1.5] text-text-secondary">
            <LockIcon size={14} className="mt-px shrink-0 text-text-tertiary" />
            Concierge holds a revocable token, never your password. Disconnecting here removes it immediately.
          </p>
        </ModalSection>
      )}

      {step === 1 && (
        <ModalSection title="The account to use">
          <Field
            label={integration.category === "messaging" ? "Number" : "Account"}
            htmlFor="connect-account"
            hint="This is what shows on the card so anyone on your team can see which account is in use."
          >
            <Input
              id="connect-account"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              placeholder={placeholder}
            />
          </Field>
        </ModalSection>
      )}

      {step === 2 && (
        <ModalSection>
          <div className="flex items-start gap-3 border border-success-line bg-success-soft p-4">
            <CheckIcon size={16} className="mt-px shrink-0 text-success" strokeWidth={2.4} />
            <div>
              <p className="text-[12.5px] font-medium text-success">Test event delivered</p>
              <p className="mt-1 text-[12px] leading-[1.5] text-text-secondary">
                {account.trim() || placeholder} accepted it in 180ms. Nothing was sent to a real customer.
              </p>
            </div>
          </div>
        </ModalSection>
      )}
    </Modal>
  );
}

/** What a connected tool does with what it receives. */
export function ConfigureModal({
  integration,
  onClose,
  onSave,
}: {
  integration: Integration | null;
  onClose: () => void;
  onSave: (id: string) => void;
}) {
  const [when, setWhen] = useState("qualified");
  const [transcript, setTranscript] = useState(true);
  const [afterHours, setAfterHours] = useState(true);
  const [saving, setSaving] = useState(false);

  const key = integration?.id ?? "";
  const [seen, setSeen] = useState("");
  if (integration && seen !== key) {
    setSeen(key);
    setSaving(false);
  }

  if (!integration) return null;

  return (
    <Modal
      open
      onClose={onClose}
      eyebrow={integration.name}
      title={`What ${integration.name} receives`}
      description="Routing rules decide where a request goes. This decides what travels with it."
      footer={
        <>
          <Button variant="tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            loading={saving}
            onClick={() => {
              setSaving(true);
              setTimeout(() => onSave(integration.id), 420);
            }}
          >
            Save changes
          </Button>
        </>
      }
    >
      <ModalSection title="Account">
        <div className="flex flex-wrap items-center gap-3 border border-line-strong bg-surface-subtle p-3.5">
          <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium">
            {integration.accountLabel ?? integration.name}
          </span>
          <Button size="sm" variant="tertiary" leading={<RefreshIcon size={13} />}>
            Sync now
          </Button>
        </div>
      </ModalSection>

      <ModalSection title="Send a conversation when">
        <Select value={when} onChange={(e) => setWhen(e.target.value)} aria-label="Send a conversation when">
          <option value="qualified">It qualifies as a lead</option>
          <option value="any">Any conversation starts</option>
          <option value="handoff">A visitor asks for a person</option>
          <option value="action">An action completes</option>
        </Select>
      </ModalSection>

      <ModalSection title="What travels with it">
        <div className="space-y-2.5">
          <Checkbox
            checked={transcript}
            onChange={setTranscript}
            label="The full transcript"
            description="Everything the visitor and Concierge said, in order."
          />
          <Checkbox
            checked={afterHours}
            onChange={setAfterHours}
            label="Mark after-hours arrivals"
            description="Flags anything that came in while you were closed."
          />
        </div>
      </ModalSection>
    </Modal>
  );
}

/** Reconnecting says what broke before it asks you to fix it. */
export function ReconnectModal({
  integration,
  onClose,
  onReconnected,
}: {
  integration: Integration | null;
  onClose: () => void;
  onReconnected: (id: string) => void;
}) {
  const [working, setWorking] = useState(false);
  const [done, setDone] = useState(false);

  const key = integration?.id ?? "";
  const [seen, setSeen] = useState("");
  if (integration && seen !== key) {
    setSeen(key);
    setWorking(false);
    setDone(false);
  }

  if (!integration) return null;

  return (
    <Modal
      open
      onClose={onClose}
      eyebrow={integration.name}
      title={done ? `${integration.name} is responding again` : `${integration.name} stopped responding`}
      description={
        done
          ? "The queue has been drained in the order it arrived. Nothing was lost."
          : "Anything that depends on it has been queued rather than lost. Reconnecting replays the queue in order."
      }
      footer={
        done ? (
          <Button onClick={() => onReconnected(integration.id)} leading={<CheckIcon size={13} />}>
            Done
          </Button>
        ) : (
          <>
            <Button variant="tertiary" onClick={onClose}>
              Not now
            </Button>
            <Button
              loading={working}
              onClick={() => {
                setWorking(true);
                setTimeout(() => {
                  setWorking(false);
                  setDone(true);
                }, 1100);
              }}
            >
              Reconnect and replay
            </Button>
          </>
        )
      }
    >
      {!done ? (
        <>
          <ModalSection>
            <div className="flex items-start gap-3 border border-danger-line bg-danger-soft p-4">
              <AlertIcon size={16} className="mt-px shrink-0 text-danger" />
              <div className="min-w-0">
                <p className="text-[12.5px] font-medium text-danger">
                  HTTP 401 from {integration.accountLabel ?? "the endpoint"}
                </p>
                <p className="mt-1 text-[12px] leading-[1.5] text-text-secondary">
                  Last accepted an event 2 days ago. The signing secret was most likely rotated at your end.
                </p>
              </div>
            </div>
          </ModalSection>
          <ModalSection title="Queued and waiting">
            <p className="text-[12.5px] leading-[1.5] text-text-secondary">
              <span className="font-medium text-text-primary">7 events</span> are held, the oldest from 2 days
              ago. They are replayed in order the moment this reconnects.
            </p>
          </ModalSection>
        </>
      ) : (
        <ModalSection>
          <div className="flex items-start gap-3 border border-success-line bg-success-soft p-4">
            <CheckIcon size={16} className="mt-px shrink-0 text-success" strokeWidth={2.4} />
            <p className="text-[12.5px] leading-[1.5] text-text-secondary">
              <span className="font-medium text-success">7 queued events delivered.</span> The endpoint
              accepted every one.
            </p>
          </div>
        </ModalSection>
      )}
    </Modal>
  );
}

/** Disconnecting states the consequence before it asks. */
export function DisconnectModal({
  integration,
  onClose,
  onDisconnect,
}: {
  integration: Integration | null;
  onClose: () => void;
  onDisconnect: (id: string) => void;
}) {
  if (!integration) return null;
  return (
    <Modal
      open
      onClose={onClose}
      size="sm"
      eyebrow={integration.name}
      title={`Disconnect ${integration.name}?`}
      description="Concierge keeps answering visitors, but anything routed here stops arriving until you connect it again."
      footer={
        <>
          <Button variant="tertiary" onClick={onClose}>
            Keep it connected
          </Button>
          <Button variant="danger" onClick={() => onDisconnect(integration.id)}>
            Disconnect
          </Button>
        </>
      }
    >
      <ul className="space-y-2 text-[12.5px] leading-[1.5] text-text-secondary">
        <li>The access token is deleted immediately.</li>
        <li>Routing rules that point here are paused, not removed.</li>
        <li>Past conversations keep their record of what was sent.</li>
      </ul>
    </Modal>
  );
}

/** A developer endpoint, added by hand. */
export function CustomEndpointModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string, url: string) => void;
}) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [signed, setSigned] = useState(true);
  const [saving, setSaving] = useState(false);

  const valid = name.trim().length > 1 && /^https?:\/\/.+\..+/.test(url.trim());

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Integrations"
      title="Connect a custom endpoint"
      description="Concierge will POST a signed JSON event to this URL whenever a rule routes to it."
      footer={
        <>
          <Button variant="tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            loading={saving}
            disabled={!valid}
            onClick={() => {
              setSaving(true);
              setTimeout(() => {
                setSaving(false);
                onAdd(name.trim(), url.trim());
                setName("");
                setUrl("");
              }, 600);
            }}
          >
            Add endpoint
          </Button>
        </>
      }
    >
      <ModalSection>
        <div className="grid gap-4">
          <Field label="Name" htmlFor="ep-name" hint="What your team will call it in routing rules.">
            <Input
              id="ep-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Practice management system"
            />
          </Field>
          <Field
            label="Endpoint URL"
            htmlFor="ep-url"
            hint="HTTPS only. It must answer 2xx within 10 seconds or the event is queued and retried."
          >
            <Input
              id="ep-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.yourpractice.com/concierge"
            />
          </Field>
        </div>
      </ModalSection>

      <ModalSection title="Signing">
        <div className="flex items-center gap-4 bg-surface-subtle px-3.5 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-medium">Sign every request</p>
            <p className="mt-0.5 text-[12px] leading-[1.45] text-text-tertiary">
              Adds an HMAC header so your endpoint can prove the event came from Concierge.
            </p>
          </div>
          <Toggle checked={signed} onChange={setSigned} label="Sign every request" size="sm" />
        </div>
      </ModalSection>
    </Modal>
  );
}

/** The small state line a card shows after something happened to it. */
export function CardFlash({
  show,
  children,
  tone = "success",
  Icon = CheckIcon,
}: {
  show: boolean;
  children: React.ReactNode;
  tone?: "success" | "danger";
  Icon?: ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
}) {
  if (!show) return null;
  return (
    <p
      className={cx(
        "cg-enter mt-3 flex items-center gap-1.5 text-[11.5px] font-medium",
        tone === "success" ? "text-success" : "text-danger",
      )}
    >
      <Icon size={12} strokeWidth={2.4} />
      {children}
    </p>
  );
}
