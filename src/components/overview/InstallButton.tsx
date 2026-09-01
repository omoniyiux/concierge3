"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { InstallIcon } from "@/components/icons";
import { InstallModal } from "@/components/settings/InstallModal";

/**
 * A client island on an otherwise server-rendered Overview, so the one
 * interactive thing on the page does not drag the whole page onto the client.
 *
 * Orange because this is the single moment on the surface where Concierge is
 * being switched on, which is exactly what the accent is reserved for. It uses
 * the deepened accent rather than the brand orange: white on #FF6200 is 2.6:1
 * and fails AA, while the same white on #C85200 clears it at 4.5:1.
 */
export function InstallButton({ siteId, siteName }: { siteId: string; siteName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="accent" leading={<InstallIcon size={15} />} onClick={() => setOpen(true)}>
        Install Concierge
      </Button>
      <InstallModal open={open} onClose={() => setOpen(false)} siteId={siteId} siteName={siteName} />
    </>
  );
}
