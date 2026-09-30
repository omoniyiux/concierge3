"use client";

import { useState } from "react";
import { ConciergeMark } from "@/components/shell/ConciergeMark";
import {
  ArrowRight,
  CheckIcon,
  EditIcon,
  RefreshIcon,
  SparkIcon,
} from "@/components/icons";
import { Button, Field, Input, SegmentedControl } from "@/components/ui";
import { displayName } from "@/lib/starters";
import { applyChanges, describeChange, draftFromPrompt, interpret, planFor, type PageChange } from "@/lib/vibe";
import type { PageDocument } from "@/lib/types";
import { ChatComposer, ChatThread, message, type ChatMessage } from "./Chat";
import { AgentIncluded, previewFacts } from "./shared";
import { BrowserFrame, PhoneFrame, SitePreview } from "./SitePreview";

/* ============================================================================
   BUILD WITH VIBE CHAT
   ----------------------------------------------------------------------------
   One sentence in, a whole page out — template, sections, copy, button, style
   and agent — shown as a plan the owner can read before they accept it. Every
   follow-up goes through the same interpreter the editor uses, so what
   "make it more premium" means here is what it means everywhere.
   ========================================================================== */

const STARTERS = [
  "Build me a premium page for my landscaping business in Austin. I want quote requests and bookings.",
  "A coaching business called Maya Brooks Coaching that books free intro calls",
  "A restaurant page with a summer promotion that collects phone numbers",
];

const REFINEMENTS = [
  { label: "More premium", prompt: "Make it more premium" },
  { label: "More simple", prompt: "Make it clean and simple" },
  { label: "More sales-focused", prompt: "Make it a high-converting sales page" },
];

export function VibeCreate({
  siteId,
  document: doc,
  onDocument,
  onApply,
  onEditManually,
}: {
  siteId: string;
  document: PageDocument | null;
  onDocument: (doc: PageDocument) => void;
  onApply: (doc: PageDocument) => void;
  onEditManually: (doc: PageDocument) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [variant, setVariant] = useState(0);
  /* Every change asked for since the draft, so the page can be redrawn from
     the prompt — with a new name, or as another version — without losing
     what the owner asked for along the way. */
  const [asked, setAsked] = useState<PageChange[]>([]);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  const business = doc?.brief?.business;
  const name = business ? displayName(business) : "Your business";
  const named = Boolean(business?.name.trim());
  const facts = previewFacts(business ?? { name: "", offer: "", industry: "", contact: "", location: "" });

  const redraw = (text: string, nextVariant: number, changes: PageChange[], nameOverride?: string) => {
    const drafted = draftFromPrompt(text, siteId, nextVariant, nameOverride);
    const name = displayName(drafted.doc.brief!.business);
    onDocument(applyChanges(drafted.doc, changes, name));
    return drafted;
  };

  const send = (text: string) => {
    if (doc === null || prompt === null) {
      const drafted = redraw(text, 0, []);
      setPrompt(text);
      setVariant(0);
      setAsked([]);
      setMessages((m) => [...m, message("owner", text), message("concierge", drafted.reply, { plan: true })]);
      return;
    }
    const { changes, reply } = interpret(text, doc, name);
    if (changes.length > 0) {
      onDocument(applyChanges(doc, changes, name));
      setAsked((a) => [...a, ...changes]);
    }
    setMessages((m) => [...m, message("owner", text), message("concierge", reply, { changes: changes.map(describeChange) })]);
  };

  const anotherVersion = () => {
    if (prompt === null) return;
    const next = variant + 1;
    /* Style and template are what "another version" changes, so an earlier
       "make it more premium" would only undo it again. */
    redraw(prompt, next, asked.filter((c) => c.kind !== "style" && c.kind !== "template"), business?.name || undefined);
    setVariant(next);
    setMessages((m) => [...m, message("concierge", "Here's another take on the same brief — a different layout and style.")]);
  };

  /* The name is written into the header, the about section and the agent's
     greeting, so it is drawn again rather than patched into one field. */
  const setName = (value: string) => {
    if (prompt === null) return;
    redraw(prompt, variant, asked, value);
  };

  const plan = doc ? planFor(doc) : [];

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)]">
      {/* The conversation ------------------------------------------------------ */}
      <div className="flex min-w-0 flex-col lg:h-[calc(100dvh-var(--topbar-h)-80px)]">
        <header>
          <p className="t-eyebrow text-accent-ink">Vibe Chat</p>
          <h1 className="t-display mt-3">{doc ? "Concierge drafted your page plan" : "Build with Vibe Chat"}</h1>
          <p className="t-body mt-3 text-[13.5px] leading-[1.55] text-text-secondary">
            Describe your business and what you want visitors to do. Concierge builds the page and trains the agent
            on it — then you can switch to manual controls any time.
          </p>
        </header>

        <ChatThread
          messages={messages}
          className="mt-6 min-h-0 flex-1 pr-1"
          renderPlan={() =>
            doc && (
              <div className="cg-enter border border-line-strong bg-surface">
                <ul>
                  {plan.map((item) => (
                    <li key={item.id} className="flex items-start gap-3 border-b border-divider px-4 py-3">
                      <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center bg-accent text-ink">
                        <CheckIcon size={11} strokeWidth={2.8} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[12.5px]">
                          <span className="font-medium">{item.label}:</span> {item.value}
                        </span>
                        <span className="mt-0.5 block text-[11.5px] text-text-tertiary">{item.detail}</span>
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="border-b border-divider px-4 py-3">
                  <Field
                    label="Business name"
                    htmlFor="vibe-name"
                    hint={named ? undefined : "Add it before you apply — it goes in the header and the agent's greeting."}
                  >
                    <Input
                      id="vibe-name"
                      value={business?.name ?? ""}
                      placeholder="Evergreen Landscaping"
                      onChange={(e) => setName(e.target.value)}
                    />
                  </Field>
                </div>

                <div className="flex flex-wrap gap-1.5 border-b border-divider px-4 py-3">
                  {REFINEMENTS.map((r) => (
                    <button
                      key={r.label}
                      type="button"
                      onClick={() => send(r.prompt)}
                      className="flex items-center gap-1.5 border border-line-strong px-2.5 py-1.5 text-[11.5px] font-medium text-text-secondary transition-colors hover:border-ink hover:text-text-primary"
                    >
                      <SparkIcon size={12} />
                      {r.label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-2 p-4">
                  <Button
                    variant="accent"
                    disabled={!named}
                    onClick={() => onApply(doc)}
                    leading={<CheckIcon size={14} strokeWidth={2.4} />}
                    trailing={<ArrowRight size={14} />}
                  >
                    Apply plan
                  </Button>
                  <Button variant="secondary" onClick={() => onEditManually(doc)} leading={<EditIcon size={14} />}>
                    Edit manually
                  </Button>
                  <Button variant="tertiary" onClick={anotherVersion} leading={<RefreshIcon size={14} />}>
                    Another version
                  </Button>
                </div>
              </div>
            )
          }
        />

        <div className="mt-4">
          <ChatComposer
            autoFocus
            onSend={send}
            placeholder={doc ? "Ask for a change — “add a booking button”…" : "Tell Concierge what you want to launch…"}
            suggestions={doc ? [] : STARTERS}
          />
          <p className="mt-2 text-center text-[11px] text-text-tertiary">Your site, your brand, powered by Concierge.</p>
        </div>
      </div>

      {/* The page it is building ---------------------------------------------- */}
      <div className="min-w-0 lg:sticky lg:top-[calc(var(--topbar-h)+24px)] lg:self-start">
        <div className="mb-3 flex items-center justify-between gap-3">
          <SegmentedControl
            label="Preview device"
            value={device}
            onChange={setDevice}
            options={[
              { value: "desktop", label: "Desktop" },
              { value: "mobile", label: "Mobile" },
            ]}
          />
          <AgentIncluded compact />
        </div>

        {doc === null ? (
          <EmptyPreview url={facts.url} />
        ) : device === "desktop" ? (
          <BrowserFrame url={facts.url}>
            <SitePreview document={doc} site={facts} aspect={1280 / 860} agentOpen interactive />
          </BrowserFrame>
        ) : (
          <div className="flex justify-center bg-surface-sunken py-8">
            <PhoneFrame className="w-[320px]">
              <SitePreview document={doc} site={facts} device="mobile" aspect={390 / 780} agentOpen interactive />
            </PhoneFrame>
          </div>
        )}
      </div>
    </div>
  );
}

/** Before the first prompt: the shape of a page, waiting for one. */
function EmptyPreview({ url }: { url: string }) {
  return (
    <BrowserFrame url={url}>
      <div className="relative aspect-[1280/860] bg-surface p-[5%]">
        <div className="flex items-center justify-between">
          <div className="cg-skeleton h-3 w-28" />
          <div className="flex gap-3">
            <div className="cg-skeleton h-2 w-10" />
            <div className="cg-skeleton h-2 w-10" />
            <div className="cg-skeleton h-2 w-10" />
          </div>
        </div>
        <div className="mt-[8%] grid grid-cols-[1.1fr_0.9fr] gap-[6%]">
          <div className="space-y-3">
            <div className="cg-skeleton h-6 w-4/5" />
            <div className="cg-skeleton h-6 w-3/5" />
            <div className="cg-skeleton mt-5 h-2.5 w-full" />
            <div className="cg-skeleton h-2.5 w-4/5" />
            <div className="mt-5 flex gap-2">
              <div className="h-7 w-24 bg-ink/80" />
              <div className="h-7 w-24 border border-line-strong" />
            </div>
          </div>
          <div className="cg-skeleton aspect-[4/3]" />
        </div>
        <div className="mt-[7%] grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="cg-skeleton h-16" />
          ))}
        </div>
        <div className="absolute bottom-4 right-4 flex items-center gap-2.5 border border-line bg-surface px-3 py-2.5 shadow-lg">
          <ConciergeMark size={24} />
          <span className="text-[11.5px] leading-[1.35]">
            Hi! I&apos;m your Concierge agent.
            <br />
            <span className="text-text-tertiary">Describe your business to begin.</span>
          </span>
        </div>
      </div>
    </BrowserFrame>
  );
}
