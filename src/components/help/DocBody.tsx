import { AlertIcon, CheckIcon, InfoIcon } from "@/components/icons";
import { cx } from "@/lib/cx";
import type { DocBlock } from "@/lib/docs";

const NOTE = {
  info: { Icon: InfoIcon, wrap: "border-info-line bg-info-soft", ink: "text-info" },
  warning: { Icon: AlertIcon, wrap: "border-warning-line bg-warning-soft", ink: "text-warning" },
  success: { Icon: CheckIcon, wrap: "border-success-line bg-success-soft", ink: "text-success" },
} as const;

/**
 * Guides render from blocks rather than markup: the same content feeds the
 * index, search and the article, and the typography stays in one place.
 */
export function DocBody({ blocks }: { blocks: DocBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, i) => {
        switch (block.kind) {
          case "h":
            return (
              <h2 key={i} className="t-section pt-4 first:pt-0">
                {block.text}
              </h2>
            );

          case "p":
            return (
              <p key={i} className="t-body max-w-[68ch] leading-[19px] text-text-secondary">
                {block.text}
              </p>
            );

          case "steps":
            return (
              <ol key={i} className="space-y-0 border-t border-divider">
                {block.items.map((item, n) => (
                  <li
                    key={item.title}
                    className="flex gap-4 border-b border-divider py-4 last:border-b-0 last:pb-0"
                  >
                    <span className="t-num mt-px w-5 shrink-0 text-[13px] text-text-muted">
                      {String(n + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <p className="t-card">{item.title}</p>
                      <p className="t-body mt-1.5 max-w-[62ch] leading-[19px] text-text-tertiary">
                        {item.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            );

          case "list":
            return (
              <ul key={i} className="space-y-3">
                {block.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span aria-hidden className="mt-[7px] h-[3px] w-[9px] shrink-0 bg-accent" />
                    <span className="t-body max-w-[64ch] leading-[19px] text-text-secondary">{item}</span>
                  </li>
                ))}
              </ul>
            );

          case "note": {
            const { Icon, wrap, ink } = NOTE[block.tone];
            return (
              <div key={i} className={cx("flex gap-3.5 border p-4.5", wrap)}>
                <Icon size={16} className={cx("mt-px shrink-0", ink)} />
                <div className="min-w-0">
                  <p className="t-card">{block.title}</p>
                  <p className="t-body mt-1.5 max-w-[60ch] leading-[19px] text-text-secondary">
                    {block.body}
                  </p>
                </div>
              </div>
            );
          }

          case "code":
            return (
              <figure key={i} className="border border-line-strong bg-surface">
                {block.caption && (
                  <figcaption className="t-meta border-b border-divider px-3.5 py-2 text-text-muted">
                    {block.caption}
                  </figcaption>
                )}
                <pre className="cg-scroll overflow-x-auto px-4 py-3.5 leading-[19px]">
                  <code className="t-mono whitespace-pre text-text-primary">{block.code}</code>
                </pre>
              </figure>
            );
        }
      })}
    </div>
  );
}
