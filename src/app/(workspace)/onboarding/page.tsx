import { redirect } from "next/navigation";
import { STEPS } from "@/lib/onboarding";

/** The flow starts at its first step, which now has a URL of its own. */
export default function OnboardingIndex() {
  redirect(`/onboarding/${STEPS[0].key}`);
}
