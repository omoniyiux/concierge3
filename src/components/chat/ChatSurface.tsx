"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDownIcon,
  ChatIcon,
  ChevronRight,
  CloseIcon,
  CopyIcon,
  EmojiPlusIcon,
  MaximiseIcon,
  MicIcon,
  MinimiseIcon,
  MoreVerticalIcon,
  PlusIcon,
  ReplyIcon,
  SendIcon,
  WaveformIcon,
} from "@/components/icons";
import { GmailMark } from "@/components/icons/brands";
import { Button, IconButton, WorkingState } from "@/components/ui";
import { CONVERSATION } from "@/lib/conversation";
import { THREADS } from "@/lib/data";
import { useWorkspace } from "@/lib/workspace";

/* ==================================================================
   The Maestro conversation. It is never "just another page" — it
   follows the user across the workspace as a bubble, a dock, or the
   whole surface.
   ================================================================== */

export function ChatSurface() {
  const { chatMode, setChatMode, activeThread } = useWorkspace();
  const title = THREADS.find((t) => t.id === activeThread)?.title ?? "New chat";

  if (chatMode === "closed") return null;

  if (chatMode === "bubble") {
    return (
      <button
        type="button"
        onClick={() => setChatMode("docked")}
        aria-label="Open Maestro"
        className="fixed bottom-[86px] right-6 z-40 flex h-[54px] w-[54px] items-center justify-center rounded-full bg-surface shadow-lg ring-1 ring-black/[0.04] transition-transform duration-[180ms] ease-[var(--ease-out-symphony)] hover:scale-[1.04] active:scale-95 md:bottom-7 md:right-7"
      >
        <ChatIcon size={26} className="text-text-primary" strokeWidth={1.9} />
      </button>
    );
  }

  const expanded = chatMode === "expanded";

  return (
    <section
      aria-label="Maestro conversation"
      className={[
        // Mobile keeps Maestro full-screen in both modes; the dock only
        // exists once there is a workspace to sit beside.
        "fixed inset-0 z-40 flex flex-col overflow-hidden bg-canvas border-line",
        expanded
          ? "md:static md:inset-auto md:z-auto md:min-w-0 md:flex-1"
          : "md:static md:inset-auto md:z-auto md:w-[var(--chat-dock)] md:shrink-0 md:border-l",
      ].join(" ")}
    >
      <ChatHeader title={title} expanded={expanded} />
      <ChatTranscript expanded={expanded} />
      <Composer expanded={expanded} />
    </section>
  );
}

function ChatHeader({ title, expanded }: { title: string; expanded: boolean }) {
  const { setChatMode } = useWorkspace();
  return (
    <header
      className={`flex h-[68px] shrink-0 items-center gap-1 px-4 md:h-[84px] ${
        expanded ? "md:px-7" : ""
      }`}
    >
      <h1 className="mr-auto truncate text-[13.5px] font-medium">{title}</h1>
      <IconButton label="Conversation options" size={34}>
        <MoreVerticalIcon size={19} />
      </IconButton>
      <IconButton
        label={expanded ? "Dock conversation" : "Expand conversation"}
        size={34}
        onClick={() => setChatMode(expanded ? "docked" : "expanded")}
      >
        {expanded ? <MinimiseIcon size={19} /> : <MaximiseIcon size={19} />}
      </IconButton>
      <IconButton label="Close conversation" size={34} onClick={() => setChatMode("bubble")}>
        <CloseIcon size={19} />
      </IconButton>
    </header>
  );
}

function ChatTranscript({ expanded }: { expanded: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [atBottom, setAtBottom] = useState(true);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () =>
      setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 48);
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={scrollRef}
        className={`sym-scroll h-full overflow-y-auto overflow-x-hidden px-4 ${expanded ? "md:px-7" : ""}`}
      >
        <div className={`mx-auto w-full min-w-0 break-words pb-6 ${expanded ? "md:max-w-[638px]" : ""}`}>
          {CONVERSATION.map((m) =>
            m.role === "user" ? (
              <UserBubble key={m.id} text={m.text} time={m.time} />
            ) : (
              <AssistantTurn key={m.id} message={m} expanded={expanded} />
            ),
          )}
          <div className="pt-2">
            <WorkingState agent="Maestro" task="is reading your reply" />
          </div>
        </div>
      </div>

      {!atBottom && (
        <button
          type="button"
          onClick={() =>
            scrollRef.current?.scrollTo({
              top: scrollRef.current.scrollHeight,
              behavior: "smooth",
            })
          }
          aria-label="Jump to latest message"
          className="absolute bottom-3 left-1/2 z-10 flex h-9 w-9 -translate-x-1/2 items-center justify-center rounded-full bg-surface shadow-md ring-1 ring-black/[0.04] transition-transform hover:scale-105"
        >
          <ArrowDownIcon size={18} />
        </button>
      )}
    </div>
  );
}

function UserBubble({ text, time }: { text: string; time: string }) {
  return (
    <div className="mb-7 flex justify-end pt-2">
      <div className="max-w-[86%] rounded-2xl bg-surface px-[18px] pb-3 pt-4">
        <p className="text-[15px] leading-[1.45]">{text}</p>
        <p className="mt-2 text-right text-[12px] text-text-tertiary">{time}</p>
      </div>
    </div>
  );
}

function AssistantTurn({
  message,
  expanded,
}: {
  message: Extract<(typeof CONVERSATION)[number], { role: "assistant" }>;
  expanded: boolean;
}) {
  return (
    <article className="mb-2">
      <div
        className={`space-y-3 leading-[26px] [&_p]:text-[15.5px] ${
          expanded ? "" : "[&_p]:text-[14.5px] [&_p]:leading-[24px]"
        }`}
      >
        {message.body}
      </div>

      {message.card === "gmail" && <GmailConnectCard />}

      <MessageActions time={message.time} />
    </article>
  );
}

function MessageActions({ time }: { time: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-3 flex items-center gap-1 pb-5">
      <IconButton label="Reply to this message" size={32}>
        <ReplyIcon size={19} />
      </IconButton>
      <IconButton
        label={copied ? "Copied" : "Copy message"}
        size={32}
        onClick={() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1400);
        }}
      >
        <CopyIcon size={18} />
      </IconButton>
      <IconButton label="Add reaction" size={32}>
        <EmojiPlusIcon size={19} />
      </IconButton>
      <span className="ml-auto text-[12px] text-text-tertiary">{time}</span>
    </div>
  );
}

/**
 * An action Maestro is asking for, shown inline. The user always knows
 * who is asking, what for, and that nothing happens until they act.
 */
function GmailConnectCard() {
  const [state, setState] = useState<"idle" | "connecting" | "connected">("idle");

  return (
    <div className="mt-5 max-w-[398px] rounded-2xl bg-surface p-4">
      <div className="flex items-start gap-3">
        <GmailMark size={30} className="mt-0.5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-bold leading-tight">Gmail</p>
          <p className="mt-1 text-[12.5px] leading-[1.4] text-text-secondary">
            Read, send and organize email in your Gmail inbox.
          </p>
        </div>
        <Button
          size="md"
          className="shrink-0"
          loading={state === "connecting"}
          disabled={state === "connected"}
          onClick={() => {
            setState("connecting");
            setTimeout(() => setState("connected"), 1200);
          }}
        >
          {state === "connected" ? "Connected" : "Connect"}
        </Button>
      </div>
      <button
        type="button"
        className="mt-4 inline-flex items-center gap-1 text-[13.5px] font-bold transition-opacity hover:opacity-70"
      >
        Browse all connectors
        <ChevronRight size={17} />
      </button>
    </div>
  );
}

function Composer({ expanded }: { expanded: boolean }) {
  const [value, setValue] = useState("");
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const hasText = value.trim().length > 0;

  useEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
  }, [value]);

  return (
    <div className={`shrink-0 px-3 pb-5 ${expanded ? "md:px-7" : ""}`}>
      <div className={`mx-auto w-full min-w-0 ${expanded ? "md:max-w-[716px]" : ""}`}>
        <div className="rounded-[22px] bg-surface p-5 shadow-sm ring-1 ring-black/[0.03] transition-shadow focus-within:shadow-md">
          <label htmlFor="ask-maestro" className="sr-only">
            Ask Maestro
          </label>
          <textarea
            id="ask-maestro"
            ref={areaRef}
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                setValue("");
              }
            }}
            placeholder="Ask Maestro"
            className={`sym-no-scrollbar w-full resize-none bg-transparent text-[15px] leading-[1.45] outline-none placeholder:text-text-muted ${
              expanded ? "min-h-[62px]" : "min-h-[44px]"
            }`}
          />

          <div className="mt-2 flex items-center">
            <IconButton label="Add an attachment" size={32}>
              <PlusIcon size={21} />
            </IconButton>

            <div className="ml-auto flex items-center gap-2">
              <IconButton label="Dictate a message" size={32}>
                <MicIcon size={20} />
              </IconButton>
              {hasText ? (
                <Button pill size="md" className="h-[38px] px-4 text-[13.5px]" aria-label="Send message" onClick={() => setValue("")}>
                  <SendIcon size={17} />
                  Send
                </Button>
              ) : (
                <Button pill size="md" className="h-[38px] px-4 text-[13.5px]" leading={<WaveformIcon size={16} />}>
                  Speak
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
