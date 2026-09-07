import { Card } from "@/components/ui";
import { cx } from "@/lib/cx";
import { InstallSticker, KnowledgeSticker, LiveSticker, RoutingSticker } from "@/components/stickers";
import type { Site, SiteBrain, Destination } from "@/lib/types";

/**
 * The four facts that describe the system's state, told as sentences rather
 * than as labelled values: a sticker, a coloured figure, what it means, then
 * the detail. Split by rules instead of boxed into four separate cards, so it
 * reads as one statement about the site.
 */
export function StatusStrip({
  site,
  brain,
  destinations,
}: {
  site: Site;
  brain: SiteBrain;
  destinations: Destination[];
}) {
  const failing = destinations.filter((d) => d.status === "failing").length;
  const live = site.status === "live";
  const installed = site.installState === "detected";

  const cells = [
    {
      Sticker: LiveSticker,
      value: live ? "Live" : "Not live",
      tone: live ? "text-success" : "text-text-muted",
      label: live ? "and answering" : "not answering yet",
      detail: live
        ? `Concierge is handling visitors on ${site.url}.`
        : "Finish setup and Concierge will start answering.",
    },
    {
      Sticker: KnowledgeSticker,
      value: `${brain.approvedCount} of ${brain.itemCount}`,
      tone: "text-text-primary",
      label: "facts approved",
      detail: brain.ready
        ? "Site Brain has everything it needs to answer."
        : "Approve the required items to let Concierge answer.",
    },
    {
      Sticker: InstallSticker,
      value: installed ? "Installed" : "Not installed",
      tone: installed ? "text-success" : "text-warning",
      label: installed ? "on your site" : "on your site yet",
      detail: installed
        ? "The script is loading on every page."
        : "Add one line of script and Concierge goes live.",
    },
    {
      Sticker: RoutingSticker,
      value: failing ? `${failing} route` : `${destinations.length} routes`,
      tone: failing ? "text-danger" : "text-success",
      label: failing ? (failing === 1 ? "is failing" : "are failing") : "delivering",
      detail: failing
        ? "Your team is not being told about new requests."
        : "Every handoff is reaching a person.",
    },
  ];

  return (
    <Card className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {cells.map(({ Sticker, value, tone, label, detail }, i) => (
        <div
          key={label}
          className={cx(
            "px-6 py-7",
            // Rules between cells, never around the group.
            i > 0 && "lg:border-l lg:border-divider",
            i % 2 === 1 && "sm:border-l sm:border-divider lg:border-l",
            i > 1 && "sm:border-t sm:border-divider lg:border-t-0",
          )}
        >
          <Sticker size={40} />
          <p className="mt-4 text-[19px] font-semibold leading-[1.2] tracking-[-0.02em]">
            <span className={tone}>{value}</span>
            <br />
            {label}
          </p>
          <p className="mt-2.5 text-[13px] leading-[1.5] text-text-tertiary">{detail}</p>
        </div>
      ))}
    </Card>
  );
}
