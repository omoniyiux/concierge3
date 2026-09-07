"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Field, Input } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  return (
    <>
      <h1 className="t-page">Reset your password</h1>
      <p className="t-body mt-2.5 text-text-tertiary">
        {sent
          ? "If that address has an account, a reset link is on its way. It expires in an hour."
          : "Enter the email you signed up with and we will send you a link."}
      </p>

      {!sent && (
        <form
          className="mt-5 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <Field label="Email" htmlFor="email">
            <Input id="email" type="email" autoComplete="email" placeholder="you@company.com" className="h-11" required />
          </Field>
          <Button type="submit" block size="lg">
            Send reset link
          </Button>
        </form>
      )}

      <p className="mt-7 border-t border-divider pt-6 text-[14px] text-text-tertiary">
        <Link href="/sign-in" className="font-medium text-text-primary underline underline-offset-2">
          Back to sign in
        </Link>
      </p>
    </>
  );
}
