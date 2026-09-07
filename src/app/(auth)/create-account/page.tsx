"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Field, Input } from "@/components/ui";
import { GlobeIcon } from "@/components/icons";

export default function CreateAccountPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <>
      <h1 className="t-page">Create your account</h1>
      <p className="t-body mt-2.5 text-text-tertiary">
        One account covers every website you add. Setup takes about five minutes.
      </p>

      <form
        className="mt-5 space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          setBusy(true);
          setTimeout(() => router.push("/verify-email"), 700);
        }}
      >
        <Field label="Your website" htmlFor="site" hint="Concierge will learn this once your email is verified.">
          <div className="relative">
            <GlobeIcon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input id="site" placeholder="yourbusiness.com" className="h-11 pl-9" required />
          </div>
        </Field>
        <Field label="Work email" htmlFor="email">
          <Input id="email" type="email" autoComplete="email" placeholder="you@company.com" className="h-11" required />
        </Field>
        <Field label="Password" htmlFor="password" hint="At least 10 characters.">
          <Input id="password" type="password" autoComplete="new-password" className="h-11" minLength={10} required />
        </Field>
        <Button type="submit" block size="lg" loading={busy}>
          Create account
        </Button>
      </form>

      <p className="mt-4 text-[14px] leading-[1.55] text-text-tertiary">
        By creating an account you agree to our{" "}
        <Link href="/legal/terms" className="underline underline-offset-2">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/legal/privacy" className="underline underline-offset-2">
          Privacy Policy
        </Link>
        .
      </p>

      <p className="mt-7 border-t border-divider pt-6 text-[14px] text-text-tertiary">
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-text-primary underline underline-offset-2">
          Sign in
        </Link>
      </p>
    </>
  );
}
