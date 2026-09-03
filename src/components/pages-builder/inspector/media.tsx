"use client";

import { useId, useRef, useState } from "react";
import { Field, Input } from "@/components/ui";
import { UploadIcon } from "@/components/icons";
import { cx } from "@/lib/cx";
import type { PageImage, SiteIconRef } from "@/lib/types";
import { SITE_ICON_NAMES, SiteIcon, isSiteIconName } from "../site-icons";

/* ============================================================================
   PICTURES AND ICONS
   ----------------------------------------------------------------------------
   Two ways in, because owners arrive with their pictures in two states: a link
   to something already online, or a file on the machine in front of them.
   Asking for a URL alone would exclude most of them.

   An uploaded file is read into a data URI and lives in the document. That is
   deliberately a stopgap and it is labelled as one: it costs roughly a third
   more bytes than the file, and it belongs in an asset store the moment there
   is one to put it in. It is chosen over an object URL because a data URI
   survives being serialised, so nothing an owner adds today is lost when
   persistence arrives.
   ========================================================================== */

/** Generous for a photograph, small enough that a document stays workable. */
const MAX_BYTES = 2_000_000;

const ACCEPT = "image/png,image/jpeg,image/webp,image/gif,image/svg+xml";

const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const prettyBytes = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)} MB` : `${Math.round(n / 1000)} KB`;

export function ImageField({
  label,
  image,
  onChange,
  hint,
  removable = true,
}: {
  label: string;
  image?: PageImage;
  onChange: (image: PageImage | undefined) => void;
  hint?: string;
  removable?: boolean;
}) {
  const id = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const current = image ?? { src: "", alt: "" };

  const pick = async (file: File | undefined) => {
    if (file === undefined) return;
    setError(null);
    if (file.size > MAX_BYTES) {
      setError(`That file is ${prettyBytes(file.size)}. The limit is ${prettyBytes(MAX_BYTES)} for now.`);
      return;
    }
    setBusy(true);
    try {
      const src = await readAsDataUrl(file);
      /* Seed the alt text from the filename so it is never silently empty;
         the owner can write something better, but a bad default beats none. */
      const fallbackAlt = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
      onChange({ src, alt: current.alt || fallbackAlt });
    } catch {
      setError("That file could not be read.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="mb-2 flex items-baseline gap-2">
        <span className="text-[13px] font-medium">{label}</span>
        {image !== undefined && removable && (
          <button
            type="button"
            onClick={() => {
              setError(null);
              onChange(undefined);
            }}
            className="ml-auto text-[11.5px] text-text-tertiary underline underline-offset-2 transition-colors hover:text-text-primary"
          >
            Remove
          </button>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          aria-label={`Upload a picture for ${label}`}
          className={cx(
            "relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden border transition-colors",
            current.src
              ? "border-line"
              : "border-dashed border-line-strong text-text-tertiary hover:border-line-hover hover:text-text-primary",
          )}
        >
          {current.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={current.src} alt="" className="h-full w-full object-cover" />
          ) : (
            <UploadIcon size={17} />
          )}
        </button>

        <div className="min-w-0 flex-1 space-y-2">
          <Input
            id={`${id}-src`}
            value={current.src.startsWith("data:") ? "" : current.src}
            placeholder={current.src.startsWith("data:") ? "Uploaded file" : "Paste an image link"}
            disabled={current.src.startsWith("data:")}
            aria-label={`${label} link`}
            onChange={(e) => onChange(e.target.value === "" ? undefined : { ...current, src: e.target.value })}
          />
          <Input
            id={`${id}-alt`}
            value={current.alt}
            placeholder="Describe the picture"
            aria-label={`${label} description`}
            onChange={(e) => onChange({ ...current, alt: e.target.value })}
          />
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          void pick(e.target.files?.[0]);
          /* Reset so re-picking the same file fires change again. */
          e.target.value = "";
        }}
      />

      {busy && <p className="mt-1.5 text-[11.5px] text-text-tertiary">Reading the file…</p>}
      {error && <p className="mt-1.5 text-[11.5px] text-danger">{error}</p>}
      {!error && !busy && (
        <p className="mt-1.5 text-[12.5px] text-text-tertiary">
          {hint ?? "Upload a file or paste a link. A description is read aloud to visitors who cannot see it."}
        </p>
      )}
    </div>
  );
}

/**
 * A closed grid rather than a search box. There are fewer than thirty, they
 * all read at the same weight, and an owner picking one is making a two-second
 * decision they should not have to type their way through.
 */
export function IconField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: SiteIconRef;
  onChange: (icon: SiteIconRef | undefined) => void;
}) {
  const chosen = value !== undefined && isSiteIconName(value) ? value : undefined;

  return (
    <Field label={label} hint="Optional. Shown above the name.">
      <div className="grid grid-cols-7 gap-1 border border-line p-1.5">
        <button
          type="button"
          aria-label="No icon"
          aria-pressed={chosen === undefined}
          onClick={() => onChange(undefined)}
          className={cx(
            "grid aspect-square place-items-center text-[10px] transition-colors",
            chosen === undefined
              ? "bg-ink text-text-inverse"
              : "text-text-tertiary hover:bg-surface-hover hover:text-text-primary",
          )}
        >
          None
        </button>
        {SITE_ICON_NAMES.map((name) => (
          <button
            key={name}
            type="button"
            aria-label={name}
            aria-pressed={chosen === name}
            onClick={() => onChange(name)}
            className={cx(
              "grid aspect-square place-items-center transition-colors",
              chosen === name
                ? "bg-ink text-text-inverse"
                : "text-text-secondary hover:bg-surface-hover hover:text-text-primary",
            )}
          >
            <SiteIcon name={name} size={17} />
          </button>
        ))}
      </div>
    </Field>
  );
}
