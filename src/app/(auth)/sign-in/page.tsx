"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Field, Input } from "@/components/ui";
import { MailIcon } from "@/components/icons";
import { DEFAULT_SITE_ID } from "@/lib/demo-data";

export default function SignInPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <>
      <h1 className="t-page">Sign in</h1>
      <p className="t-body mt-2.5 text-text-tertiary">Pick up where you left off.</p>

      <div className="mt-7 space-y-2.5">
        <Button variant="secondary" block size="lg" leading={<GoogleMark />}>
          Continue with Google
        </Button>
        <Button variant="secondary" block size="lg" leading={<MailIcon size={16} />}>
          Email me a sign-in link
        </Button>
      </div>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="text-[12px] text-text-muted">or</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setBusy(true);
          setTimeout(() => router.push(`/sites/${DEFAULT_SITE_ID}/overview`), 700);
        }}
      >
        <Field label="Email" htmlFor="email">
          <Input id="email" type="email" autoComplete="email" placeholder="you@company.com" className="h-11" required />
        </Field>
        <Field label="Password" htmlFor="password">
          <Input id="password" type="password" autoComplete="current-password" className="h-11" required />
        </Field>
        <Button type="submit" block size="lg" loading={busy}>
          Sign in
        </Button>
      </form>

      <p className="mt-5 text-[13px] text-text-tertiary">
        <Link href="/forgot-password" className="text-text-primary underline underline-offset-2">
          Forgot your password?
        </Link>
      </p>
      <p className="mt-7 border-t border-line pt-6 text-[13px] text-text-tertiary">
        New to Concierge?{" "}
        <Link href="/create-account" className="font-medium text-text-primary underline underline-offset-2">
          Create an account
        </Link>
      </p>
    </>
  );
}

function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
      <path d="M44 24c0-1.4-.1-2.7-.4-4H24v8h11.3a9.7 9.7 0 0 1-4.2 6.3v5.2h6.8C41.9 35.8 44 30.4 44 24Z" fill="#4285F4" />
      <path d="M24 45c5.7 0 10.4-1.9 13.9-5.1l-6.8-5.2A12.6 12.6 0 0 1 24 36.5c-5.5 0-10.1-3.7-11.8-8.6H5.2v5.4A21 21 0 0 0 24 45Z" fill="#34A853" />
      <path d="M12.2 27.9a12.5 12.5 0 0 1 0-7.9v-5.4H5.2a21 21 0 0 0 0 18.7l7-5.4Z" fill="#FBBC05" />
      <path d="M24 11.5c3.1 0 5.9 1.1 8.1 3.2l6-6A21 21 0 0 0 5.2 14.6l7 5.4c1.7-4.9 6.3-8.5 11.8-8.5Z" fill="#EA4335" />
    </svg>
  );
}
