"use client";

import { use } from "react";
import { notFound, useRouter } from "next/navigation";
import { CrawlProgress } from "@/components/onboarding/CrawlProgress";
import {
  AgentStep,
  InstallStep,
  PreviewStep,
  ReviewStep,
  RoutingStep,
  WebsiteStep,
} from "@/components/onboarding/steps";
import { DEFAULT_SITE_ID } from "@/lib/demo-data";
import { isStepKey, nextStep, prevStep, stepHref, type StepKey } from "@/lib/onboarding";
import { clearWizard, useWizard } from "@/lib/onboarding-state";

/**
 * One step, one URL. Forward moves push — Back should walk the flow backwards,
 * which is the whole reason these are routes now.
 */
export default function OnboardingStepPage({ params }: { params: Promise<{ step: string }> }) {
  const { step } = use(params);
  if (!isStepKey(step)) notFound();
  return <Step step={step} />;
}

function Step({ step }: { step: StepKey }) {
  const router = useRouter();
  const { url, setUrl, authorized, setAuthorized, items, setStatus, setBody } = useWizard();

  const go = (key: StepKey | null) => {
    if (key) router.push(stepHref(key));
  };
  const onNext = () => go(nextStep(step));
  const onBack = () => go(prevStep(step));

  function finish() {
    clearWizard();
    router.push(`/sites/${DEFAULT_SITE_ID}/overview`);
  }

  switch (step) {
    case "website":
      return (
        <WebsiteStep
          url={url}
          setUrl={setUrl}
          authorized={authorized}
          setAuthorized={setAuthorized}
          onNext={onNext}
        />
      );

    case "learning":
      return <CrawlProgress url={url || "northlanedental.com"} onComplete={onNext} />;

    case "review":
      return (
        <ReviewStep items={items} onStatus={setStatus} onBody={setBody} onNext={onNext} onBack={onBack} />
      );

    case "agent":
      return <AgentStep onNext={onNext} onBack={onBack} />;

    case "routing":
      return <RoutingStep onNext={onNext} onBack={onBack} />;

    case "preview":
      return <PreviewStep onNext={onNext} onBack={onBack} />;

    case "install":
      return <InstallStep onDone={finish} onBack={onBack} />;
  }
}
