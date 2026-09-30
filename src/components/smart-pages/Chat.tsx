"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { ConciergeMark } from "@/components/shell/ConciergeMark";
import { CheckIcon, RefreshIcon, SendIcon } from "@/components/icons";
import { Button, IconButton } from "@/components/ui";
import { cx } from "@/lib/cx";
import { canUndo, dispatch, useEditor } from "@/lib/pages-editor";
import { applyChanges, describeChange, interpret } from "@/lib/vibe";
import type { PageDocument } from "@/lib/types";

/* ============================================================================
   THE CONVERSATION
   ----------------------------------------------------------------------------
   One shape for Vibe Chat wherever it appears. Concierge's replies carry the
   list of changes they made, in words — never just "done" — because an owner
   who cannot see what changed cannot trust that the right thing did.
   ========================================================================== */

export interface ChatMessage {
  id: string;
  from: "owner" | "concierge";
  text: string;
  /** What was changed, one line each. */
  changes?: string[];
  /** Marks the reply the page plan hangs off, so it can be drawn live. */
  plan?: boolean;
}

export const message = (from: ChatMessage["from"], text: string, extra: Partial<ChatMessage> = {}): ChatMessage => ({
  id: crypto.randomUUID(),
  from,
  text,
  ...extra,
});

export function ChatThread({
  messages,
  working = false,
  footer,
  renderPlan,
  className,
}: {
  messages: ChatMessage[];
  working?: boolean;
  footer?: ReactNode;
  /** Drawn under the message marked `plan`, from the current document rather
      than a copy frozen when the message was sent. */
  renderPlan?: () => ReactNode;
  className?: string;
}) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [messages.length, working]);

  return (
    <div className={cx("cg-scroll space-y-4 overflow-y-auto", className)}>
      {messages.map((m) => (
        <div key={m.id} className="cg-enter flex items-start gap-2.5">
          {m.from === "owner" ? (
            <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-surface-sunken text-[9.5px] font-semibold">
              You
            </span>
          ) : (
            <ConciergeMark size={28} className="shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <p
              className={cx(
                "px-3.5 py-2.5 text-[12.5px] leading-[1.55]",
                m.from === "owner" ? "bg-surface-sunken" : "border border-line bg-surface",
              )}
            >
              {m.text}
            </p>
            {m.changes && m.changes.length > 0 && <ChangeCard changes={m.changes} />}
            {m.plan && renderPlan?.()}
          </div>
        </div>
      ))}
      {working && (
        <div className="flex items-center gap-2.5">
          <ConciergeMark size={28} className="shrink-0" />
          <span className="flex items-center gap-2 text-[11.5px] text-text-tertiary">
            <RefreshIcon size={13} className="animate-spin" />
            Updating your page and agent…
          </span>
        </div>
      )}
      {footer}
      <div ref={endRef} />
    </div>
  );
}

export function ChangeCard({ changes }: { changes: string[] }) {
  return (
    <div className="mt-2 border border-line bg-surface">
      <p className="flex items-center gap-2 border-b border-divider px-3.5 py-2.5 text-[12.5px] font-medium">
        <span className="flex h-4 w-4 items-center justify-center bg-success text-white">
          <CheckIcon size={10} strokeWidth={3} />
        </span>
        {changes.length === 1 ? "1 change applied" : `${changes.length} changes applied`}
      </p>
      <ul className="space-y-1.5 px-3.5 py-3">
        {changes.map((c) => (
          <li key={c} className="flex items-start gap-2 text-[12px] leading-[1.45]">
            <CheckIcon size={12} strokeWidth={2.4} className="mt-0.5 shrink-0 text-success" />
            {c}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ChatComposer({
  onSend,
  placeholder = "Tell Concierge what to change…",
  suggestions = [],
  disabled,
  autoFocus,
}: {
  onSend: (text: string) => void;
  placeholder?: string;
  suggestions?: string[];
  disabled?: boolean;
  autoFocus?: boolean;
}) {
  const [text, setText] = useState("");

  const send = (value: string) => {
    const v = value.trim();
    if (!v || disabled) return;
    onSend(v);
    setText("");
  };

  return (
    <div>
      <form
        className="flex items-end gap-2 border border-line-strong bg-surface p-2 focus-within:border-ink"
        onSubmit={(e) => {
          e.preventDefault();
          send(text);
        }}
      >
        <textarea
          value={text}
          rows={2}
          autoFocus={autoFocus}
          placeholder={placeholder}
          aria-label={placeholder}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(text);
            }
          }}
          className="min-h-[40px] flex-1 resize-none bg-transparent px-1.5 py-1 text-[12.5px] leading-[1.5] outline-none placeholder:text-text-muted"
        />
        <IconButton
          label="Send"
          type="submit"
          size={34}
          disabled={disabled || text.trim().length === 0}
          className="bg-accent-solid text-white hover:bg-accent-pressed hover:text-white disabled:bg-surface-sunken"
        >
          <SendIcon size={15} />
        </IconButton>
      </form>
      {suggestions.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              disabled={disabled}
              onClick={() => send(s)}
              className="border border-line-strong bg-surface px-2.5 py-1 text-left text-[11.5px] text-text-secondary transition-colors hover:border-ink hover:text-text-primary disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   ASK CONCIERGE — Vibe Chat inside the editor
   ========================================================================== */

/* Kept outside React, per site, for the same reason as the editor's own store:
   moving between pages is a route change, and the conversation should still
   be there when the owner comes back to it. */
const threads = new Map<string, ChatMessage[]>();
const listeners = new Set<() => void>();
const EMPTY: ChatMessage[] = [];

const setThread = (siteId: string, next: ChatMessage[]) => {
  threads.set(siteId, next);
  for (const l of listeners) l();
};

function useThread(siteId: string): ChatMessage[] {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => threads.get(siteId) ?? EMPTY,
    () => EMPTY,
  );
}

export const EDITOR_SUGGESTIONS = [
  "Make this more premium",
  "Add a booking button",
  "Make the hero shorter",
  "Add a summer promotion and collect phone numbers",
  "Train the agent to answer pricing questions",
  "Turn this into a restaurant page",
];

export function AskConcierge({ document, siteName }: { document: PageDocument; siteName: string }) {
  const messages = useThread(document.siteId);
  const editor = useEditor();
  const [lastChangedAt, setLastChangedAt] = useState<number | null>(null);

  const send = (text: string) => {
    const { changes, reply } = interpret(text, document, siteName);
    const next = [...messages, message("owner", text)];
    if (changes.length > 0) {
      dispatch({ type: "apply", doc: applyChanges(document, changes, siteName) });
      setLastChangedAt(next.length + 1);
    }
    setThread(document.siteId, [
      ...next,
      message("concierge", reply, { changes: changes.map(describeChange) }),
    ]);
  };

  /* Undo is offered on the last reply only, and only while it is still the
     last thing that happened — otherwise it would reverse something else. */
  const undoable = lastChangedAt === messages.length && canUndo(editor);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 px-4 py-4">
        {messages.length === 0 ? (
          <div className="space-y-3">
            <p className="text-[12.5px] font-medium">Change the page and the agent by describing it.</p>
            <p className="text-[11.5px] leading-[1.55] text-text-tertiary">
              Every instruction becomes a list of specific changes, shown to you before you move on — and
              Undo reverses the whole instruction at once.
            </p>
          </div>
        ) : (
          <ChatThread
            messages={messages}
            className="h-full"
            footer={
              undoable ? (
                <div className="flex items-center gap-2 pl-[38px]">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      dispatch({ type: "undo" });
                      setLastChangedAt(null);
                      setThread(document.siteId, [
                        ...messages,
                        message("concierge", "Undone. The page and agent are back to how they were."),
                      ]);
                    }}
                  >
                    Undo that
                  </Button>
                  <span className="text-[11.5px] text-text-tertiary">Anything else you&apos;d like to adjust?</span>
                </div>
              ) : null
            }
          />
        )}
      </div>
      <div className="border-t border-divider p-3">
        <ChatComposer onSend={send} suggestions={messages.length === 0 ? EDITOR_SUGGESTIONS : EDITOR_SUGGESTIONS.slice(0, 3)} />
      </div>
    </div>
  );
}
