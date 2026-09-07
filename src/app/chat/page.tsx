"use client";

import { useEffect } from "react";
import { useWorkspace } from "@/lib/workspace";

/** /chat is the conversation at full width — Maestro as the whole surface. */
export default function ChatPage() {
  const { setChatMode } = useWorkspace();

  useEffect(() => {
    setChatMode("expanded");
  }, [setChatMode]);

  return null;
}
