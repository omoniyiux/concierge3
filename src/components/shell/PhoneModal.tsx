"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, CloseIcon } from "@/components/icons";
import { useWorkspace } from "@/lib/workspace";

const COUNTRIES = [
  { code: "+234", flag: "🇳🇬", name: "Nigeria" },
  { code: "+1", flag: "🇺🇸", name: "United States" },
  { code: "+44", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+27", flag: "🇿🇦", name: "South Africa" },
  { code: "+254", flag: "🇰🇪", name: "Kenya" },
  { code: "+233", flag: "🇬🇭", name: "Ghana" },
  { code: "+91", flag: "🇮🇳", name: "India" },
];

export function PhoneModal() {
  const { phoneModalOpen, setPhoneModalOpen } = useWorkspace();
  const [country, setCountry] = useState(COUNTRIES[0].code);
  const [phone, setPhone] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const ready = phone.replace(/\D/g, "").length >= 7;

  useEffect(() => {
    if (phoneModalOpen) inputRef.current?.focus();
  }, [phoneModalOpen]);

  // Dialogs trap focus.
  useEffect(() => {
    if (!phoneModalOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input, select, [href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [phoneModalOpen]);

  if (!phoneModalOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={() => setPhoneModalOpen(false)}
        className="absolute inset-0 bg-canvas/60 backdrop-blur-[6px]"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="phone-modal-title"
        className="sym-enter relative w-full max-w-[512px] rounded-[20px] bg-surface px-11 pb-10 pt-9 shadow-xl"
      >
        <button
          type="button"
          onClick={() => setPhoneModalOpen(false)}
          aria-label="Close"
          className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-lg text-text-primary transition-colors hover:bg-surface-hover"
        >
          <CloseIcon size={19} />
        </button>

        <h2 id="phone-modal-title" className="type-display text-center text-[27px] leading-[1.15]">
          Enter your phone number
        </h2>
        <p className="mx-auto mt-3 max-w-[42ch] text-center text-[15px] leading-[1.5]">
          This is how we&rsquo;ll stay in touch over text and WhatsApp. We&rsquo;ll text you a code
          to verify your number.
        </p>

        <div className="mt-7 flex gap-3">
          <div className="relative">
            <label htmlFor="country" className="sr-only">
              Country calling code
            </label>
            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="h-[52px] w-[142px] appearance-none rounded-[10px] border border-line-strong bg-surface pl-11 pr-9 text-[16px] transition-colors focus:border-ink focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[16px]" aria-hidden>
              {COUNTRIES.find((c) => c.code === country)?.flag}
            </span>
            <ChevronDown
              size={18}
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
            />
          </div>

          <div className="flex-1">
            <label htmlFor="phone" className="sr-only">
              Phone number
            </label>
            <input
              id="phone"
              ref={inputRef}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-[52px] w-full rounded-[10px] border border-line-strong bg-surface px-4 text-[16px] placeholder:text-text-muted focus:border-ink focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10"
            />
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <ModalAction disabled={!ready}>Send code via SMS</ModalAction>
          <ModalAction disabled={!ready}>Send code via WhatsApp</ModalAction>
        </div>
      </div>
    </div>
  );
}

function ModalAction({ disabled, children }: { disabled: boolean; children: string }) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={[
        "h-[52px] w-full rounded-[10px] text-[16px] font-medium transition-colors duration-[120ms]",
        disabled
          ? "cursor-not-allowed bg-[#ebebeb] text-[#a5a5a5]"
          : "bg-ink text-white hover:bg-ink-hover",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
