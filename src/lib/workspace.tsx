"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/** How the Maestro conversation is presented right now. */
export type ChatMode = "closed" | "bubble" | "docked" | "expanded";

type WorkspaceValue = {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  chatMode: ChatMode;
  setChatMode: (mode: ChatMode) => void;
  activeThread: string;
  setActiveThread: (id: string) => void;
  phoneModalOpen: boolean;
  setPhoneModalOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
};

const Ctx = createContext<WorkspaceValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>("bubble");
  const [activeThread, setActiveThread] = useState("business-space-setup");
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const toggleSidebar = useCallback(() => setSidebarCollapsed((v) => !v), []);

  // Global command surface. ⌘K / Ctrl K, as the header hints.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setPhoneModalOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo(
    () => ({
      sidebarCollapsed,
      toggleSidebar,
      chatMode,
      setChatMode,
      activeThread,
      setActiveThread,
      phoneModalOpen,
      setPhoneModalOpen,
      searchOpen,
      setSearchOpen,
    }),
    [sidebarCollapsed, toggleSidebar, chatMode, activeThread, phoneModalOpen, searchOpen],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return ctx;
}
