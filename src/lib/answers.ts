import type { KnowledgeItem, OpeningHours, Site } from "./types";
import { CATEGORY_LABEL } from "./format";

/* ============================================================================
   THE ANSWER LAYER
   ----------------------------------------------------------------------------
   Concierge already holds an owner-approved, structured, current account of
   the business. These build the machine-readable versions of it.

   One rule governs all of them: only `approved` items are ever published.
   Anything the owner has not read stays inside the workspace, and anything
   marked `restricted` never leaves at all — the same guarantee the agent
   makes to a visitor, made to every assistant on the internet.
   ========================================================================== */

/** Everything safe to publish. Not a filter to be relaxed for convenience. */
export function publishable(items: KnowledgeItem[]): KnowledgeItem[] {
  return items.filter((i) => i.status === "approved");
}

const DAY_SCHEMA = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function hhmm(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

/**
 * schema.org opening hours, in the shape search engines and assistants
 * actually parse. Closed days are omitted rather than sent as empty ranges.
 */
export function openingHoursSchema(hours: OpeningHours) {
  return hours.days
    .map((d, i) =>
      d
        ? {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: `https://schema.org/${DAY_SCHEMA[i]}`,
            opens: hhmm(d.opens),
            closes: hhmm(d.closes),
          }
        : null,
    )
    .filter(Boolean);
}

/**
 * The JSON-LD the script tag emits on every page of the site. Built from the
 * same approved items the agent answers from, so the two can never drift.
 */
export function buildJsonLd(site: Site, items: KnowledgeItem[]) {
  const ok = publishable(items);
  const faqs = ok.filter(
    (i) => i.category === "faqs" || i.category === "pricing" || i.category === "policies",
  );

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": `https://${site.url}/#business`,
        name: site.name,
        url: `https://${site.url}`,
        openingHoursSpecification: openingHoursSchema(site.openingHours),
      },
      {
        "@type": "FAQPage",
        "@id": `https://${site.url}/#faq`,
        mainEntity: faqs.map((i) => ({
          "@type": "Question",
          name: i.title,
          acceptedAnswer: { "@type": "Answer", text: i.body },
        })),
      },
    ],
  };
}

/**
 * The llms.txt index. Deliberately plain: a heading, one line of orientation,
 * and the approved answers grouped the way the owner filed them.
 */
export function buildLlmsTxt(site: Site, items: KnowledgeItem[]): string {
  const ok = publishable(items);
  const groups = new Map<string, KnowledgeItem[]>();
  for (const item of ok) {
    const key = CATEGORY_LABEL[item.category] ?? item.category;
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }

  const lines: string[] = [
    `# ${site.name}`,
    "",
    `> Answers published by ${site.name} and kept current by Concierge. Every entry below has been`,
    `> read and approved by the business. Last updated ${new Date(site.updatedAt)
      .toISOString()
      .slice(0, 10)}.`,
    "",
  ];

  for (const [group, entries] of groups) {
    lines.push(`## ${group}`, "");
    for (const e of entries) {
      const summary = e.body.replace(/\s+/g, " ").trim();
      lines.push(
        `- [${e.title}](https://${site.url}/answers/${e.id}.md): ${
          summary.length > 150 ? `${summary.slice(0, 150).trimEnd()}…` : summary
        }`,
      );
    }
    lines.push("");
  }

  return lines.join("\n").trimEnd();
}

/**
 * What this business can be asked to do, at a well-known address. Actions are
 * only listed once they are genuinely ready — an assistant that offers a
 * booking which then fails is worse than one that never offered it.
 */
export function buildAgentCard(site: Site, readyActions: { name: string; description: string }[]) {
  return {
    name: site.name,
    url: `https://${site.url}`,
    description: `Answers and actions published by ${site.name}.`,
    knowledge: `https://${site.url}/llms.txt`,
    capabilities: readyActions.map((a) => ({ name: a.name, description: a.description })),
  };
}
