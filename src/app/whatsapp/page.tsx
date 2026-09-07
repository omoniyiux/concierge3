"use client";

import { useEffect } from "react";
import { WhatsAppBrandMark } from "@/components/icons/brands";
import { Button } from "@/components/ui";
import { useWorkspace } from "@/lib/workspace";

export default function WhatsAppPage() {
  const { setPhoneModalOpen } = useWorkspace();

  useEffect(() => {
    setPhoneModalOpen(true);
  }, [setPhoneModalOpen]);

  return (
    <div className="flex min-h-full items-center justify-center px-6 py-16">
      <div className="max-w-[46ch] text-center">
        <WhatsAppBrandMark size={56} className="mx-auto" />
        <h1 className="type-display mt-6 text-[26px] leading-[1.15]">Run your business from WhatsApp</h1>
        <p className="mt-3 text-[15px] leading-[1.55] text-text-tertiary">
          Verify your number and your agents can reach you — and you can reach them — without opening
          Symphony at all.
        </p>
        <Button size="lg" className="mt-6" onClick={() => setPhoneModalOpen(true)}>
          Connect WhatsApp
        </Button>
      </div>
    </div>
  );
}
