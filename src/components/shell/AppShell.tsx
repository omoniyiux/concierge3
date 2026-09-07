"use client";

import type { ReactNode } from "react";
import { Sidebar, SidebarRail } from "@/components/shell/Sidebar";
import { MobileNav } from "@/components/shell/MobileNav";
import { ChatSurface } from "@/components/chat/ChatSurface";
import { CommandMenu } from "@/components/shell/CommandMenu";
import { PhoneModal } from "@/components/shell/PhoneModal";
import { useWorkspace } from "@/lib/workspace";

export function AppShell({ children }: { children: ReactNode }) {
  const { sidebarCollapsed, chatMode } = useWorkspace();

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-canvas">
      {/* Desktop navigation ---------------------------------------- */}
      <div className="hidden md:flex">{sidebarCollapsed ? <SidebarRail /> : <Sidebar />}</div>

      {/* Workspace -------------------------------------------------- */}
      <div className="relative flex min-w-0 flex-1">
        <main
          id="workspace"
          className={[
            "sym-scroll min-w-0 flex-1 overflow-y-auto overflow-x-hidden pb-[86px] md:pb-0",
            chatMode === "expanded" ? "hidden" : "",
          ].join(" ")}
        >
          {children}
        </main>

        <ChatSurface />
        <PhoneModal />
      </div>

      <MobileNav />
      <CommandMenu />
    </div>
  );
}

/** Standard page container: 1010px of content, generous gutters. */
export function PageContainer({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1074px] px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
