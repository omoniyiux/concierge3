"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { KNOWLEDGE } from "@/lib/demo-data";
import type { KnowledgeItem, KnowledgeStatus } from "@/lib/types";

/* ============================================================================
   WIZARD STATE
   Split from `onboarding.ts` because that module is imported by Server
   Components: a "use client" module hands them a client reference rather than
   the value, so `STEPS[0]` came back undefined at build time.
   ========================================================================== */

type WizardValue = {
  url: string;
  setUrl: (v: string) => void;
  authorized: boolean;
  setAuthorized: (v: boolean) => void;
  items: KnowledgeItem[];
  setStatus: (id: string, status: KnowledgeStatus) => void;
  setBody: (id: string, body: string) => void;
};

const Ctx = createContext<WizardValue | null>(null);

/**
 * Lives in the wizard layout, so it survives moving between step routes —
 * layouts do not remount when their children change.
 *
 * Deliberately in memory only. A reload starts the wizard's answers over; the
 * URL still says which step you were on. Persisting the draft belongs with the
 * real backend rather than in sessionStorage, where it would have to be kept
 * in step with the server's idea of the same half-finished site.
 */
export function WizardProvider({ children }: { children: ReactNode }) {
  const [url, setUrl] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [items, setItems] = useState<KnowledgeItem[]>(KNOWLEDGE);

  const setStatus = useCallback((id: string, status: KnowledgeStatus) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  }, []);

  const setBody = useCallback((id: string, body: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, body } : i)));
  }, []);

  const value = useMemo(
    () => ({ url, setUrl, authorized, setAuthorized, items, setStatus, setBody }),
    [url, authorized, items, setStatus, setBody],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWizard() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWizard must be used inside WizardProvider");
  return ctx;
}
