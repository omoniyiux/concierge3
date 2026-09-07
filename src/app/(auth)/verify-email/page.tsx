"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Card } from "@/components/ui";
import { CheckIcon, MailIcon } from "@/components/icons";

export default function VerifyEmailPage() {
  const [resent, setResent] = useState(false);

  return (
    <>
      <span className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-surface-subtle text-text-secondary">
        <MailIcon size={19} />
      </span>
      <h1 className="t-page mt-5">Check your email</h1>
      <p className="t-body mt-2.5 text-text-tertiary">
        We sent a verification link to your inbox. Open it and Concierge will pick up exactly where you left off —
        your website is already queued to be learned.
      </p>

      <Card className="mt-6 p-4">
        <p className="flex items-center gap-2 text-[15px] font-medium">
          <CheckIcon size={14} className="text-success" strokeWidth={2.4} />
          What happens after you verify
        </p>
        <ul className="mt-2.5 space-y-1.5 text-[13.5px] leading-[1.5] text-text-secondary">
          <li>· Concierge starts reading your public pages.</li>
          <li>· Your email becomes the first routing destination.</li>
          <li>· You approve what Concierge is allowed to say.</li>
        </ul>
      </Card>

      <Button
        variant="secondary"
        block
        size="lg"
        className="mt-6"
        disabled={resent}
        onClick={() => setResent(true)}
      >
        {resent ? "Link sent again" : "Resend the link"}
      </Button>

      <p className="mt-7 border-t border-divider pt-6 text-[14px] text-text-tertiary">
        Wrong address?{" "}
        <Link href="/create-account" className="font-medium text-text-primary underline underline-offset-2">
          Start again
        </Link>
      </p>
    </>
  );
}
