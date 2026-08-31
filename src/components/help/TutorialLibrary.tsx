"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge, Card, SegmentedControl, cx } from "@/components/ui";
import { ArrowRight, ClockIcon, ExternalIcon, PlayIcon } from "@/components/icons";
import { DOC_BY_SLUG } from "@/lib/docs";
import {
  FEATURED_TUTORIAL,
  TUTORIALS,
  TUTORIAL_CHAPTERS,
  thumbnail,
  watchUrl,
  type Tutorial,
} from "@/lib/tutorials";

type Filter = "all" | (typeof TUTORIAL_CHAPTERS)[number];

/**
 * The real YouTube cover for the video. maxres is not generated for every
 * upload, so a failed load falls back to hq rather than leaving a hole.
 */
function Cover({ tutorial, large }: { tutorial: Tutorial; large?: boolean }) {
  const [quality, setQuality] = useState<"maxres" | "hq">("maxres");
  return (
    <div className="relative aspect-video w-full overflow-hidden bg-surface-sunken">
      <Image
        src={thumbnail(tutorial, quality)}
        alt=""
        fill
        sizes={large ? "(max-width: 1024px) 100vw, 620px" : "(max-width: 640px) 100vw, 320px"}
        className="object-cover"
        priority={large}
        onError={() => setQuality("hq")}
      />
      {/* The ink foot the duration sits on, so it stays legible over any frame. */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1/3"
        style={{ background: "linear-gradient(to top, rgb(0 0 0 / 45%), transparent)" }}
      />
      <span className="t-meta absolute bottom-2.5 right-2.5 bg-ink px-1.5 py-0.5 font-medium text-text-inverse tabular-nums">
        {tutorial.duration}
      </span>
    </div>
  );
}

export function TutorialLibrary() {
  const [selected, setSelected] = useState<Tutorial>(FEATURED_TUTORIAL);
  const [playing, setPlaying] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const theatre = useRef<HTMLDivElement>(null);

  const shown = filter === "all" ? TUTORIALS : TUTORIALS.filter((t) => t.chapter === filter);
  const guide = selected.doc ? DOC_BY_SLUG.get(selected.doc) : undefined;

  const play = (t: Tutorial) => {
    setSelected(t);
    setPlaying(true);
    if (t.id !== selected.id) theatre.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="mx-auto w-full max-w-[1080px] px-5 pb-24 pt-14 lg:px-8">
      <div className="max-w-[60ch]">
        <p className="t-eyebrow text-accent-ink">Video tutorials</p>
        <h1 className="t-display mt-3">Short and practical</h1>
        <p className="t-body mt-4 leading-[19px] text-text-secondary">
          Find it, watch it, keep moving. Every video has a written guide covering the same ground, for when
          reading is faster.
        </p>
      </div>

      {/* ---- Theatre ------------------------------------------------------ */}
      <section
        ref={theatre}
        aria-label="Now playing"
        className="mt-10 scroll-mt-[76px] border border-line-strong bg-surface"
      >
        <div className="grid lg:grid-cols-[1.4fr_1fr]">
          {playing ? (
            <div className="aspect-video w-full bg-ink">
              <iframe
                key={selected.youtubeId}
                src={`https://www.youtube-nocookie.com/embed/${selected.youtubeId}?autoplay=1&rel=0`}
                title={selected.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full border-0"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => play(selected)}
              aria-label={`Play ${selected.title}, ${selected.duration}`}
              className="group relative block w-full text-left"
            >
              <Cover tutorial={selected} large />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-16 w-16 items-center justify-center bg-ink text-text-inverse transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-cg)] group-hover:scale-105">
                  <PlayIcon size={24} />
                </span>
              </span>
            </button>
          )}

          <div className="flex min-w-0 flex-col p-6 lg:p-7">
            <div className="flex flex-wrap items-center gap-2">
              {selected.featured && <Badge tone="accent">Start here</Badge>}
              <Badge tone="neutral">{selected.chapter}</Badge>
              <span className="t-meta inline-flex items-center gap-1.5 text-text-muted">
                <ClockIcon size={12} />
                {selected.duration}
              </span>
            </div>
            <h2 className="t-feature mt-3.5">{selected.title}</h2>
            <p className="t-body mt-2.5 leading-[19px] text-text-secondary">{selected.summary}</p>

            {selected.chapters && (
              <ol className="mt-6 border-t border-divider">
                {selected.chapters.map((c) => (
                  <li key={c.at} className="flex items-baseline gap-3.5 border-b border-divider py-2.5">
                    <span className="t-num w-9 shrink-0 text-[11.5px] tabular-nums text-text-muted">
                      {c.at}
                    </span>
                    <span className="t-body-sm text-text-secondary">{c.label}</span>
                  </li>
                ))}
              </ol>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              {guide && (
                <Link
                  href={`/help/docs/${guide.slug}`}
                  className="inline-flex h-9 items-center gap-1.5 border border-line-strong bg-surface px-3.5 text-[11.5px] font-medium transition-colors duration-[var(--dur-micro)] hover:border-ink"
                >
                  Read the guide
                  <ArrowRight size={13} />
                </Link>
              )}
              <a
                href={watchUrl(selected)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-9 items-center gap-1.5 px-2 text-[11.5px] font-medium text-text-tertiary transition-colors duration-[var(--dur-micro)] hover:text-text-primary"
              >
                Watch on YouTube
                <ExternalIcon size={13} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Library ------------------------------------------------------ */}
      <section className="mt-16" aria-labelledby="library">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div>
            <h2 id="library" className="t-section">
              The library
            </h2>
            <p className="t-body-sm mt-2 text-text-tertiary">
              {TUTORIALS.length} videos. New ones appear here automatically.
            </p>
          </div>
          <SegmentedControl<Filter>
            label="Filter videos by chapter"
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "All" },
              ...TUTORIAL_CHAPTERS.map((c) => ({ value: c as Filter, label: c })),
            ]}
          />
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((t) => {
            const active = t.id === selected.id;
            return (
              <Card
                key={t.id}
                id={t.id}
                interactive
                className={cx("group relative flex scroll-mt-[76px] flex-col", active && "border-ink")}
              >
                <div className="relative">
                  <Cover tutorial={t} />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-11 w-11 items-center justify-center bg-ink text-text-inverse opacity-0 transition-opacity duration-[var(--dur-micro)] group-hover:opacity-100">
                      <PlayIcon size={17} />
                    </span>
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col p-4">
                  <p className="t-meta text-text-muted">{t.chapter}</p>
                  <h3 className="t-card mt-2">
                    <button
                      type="button"
                      onClick={() => play(t)}
                      aria-label={`Play ${t.title}, ${t.duration}`}
                      className="text-left after:absolute after:inset-0"
                    >
                      {t.title}
                    </button>
                  </h3>
                  <p className="t-body-sm mt-2 leading-[16px] text-text-tertiary">{t.summary}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ---- Read instead ------------------------------------------------- */}
      <section className="mt-16" aria-labelledby="read">
        <Card className="flex flex-wrap items-center gap-x-8 gap-y-5 p-6">
          <div className="min-w-[240px] flex-1">
            <h2 id="read" className="t-section">
              Prefer to read?
            </h2>
            <p className="t-body-sm mt-2 max-w-[52ch] leading-[16px] text-text-tertiary">
              Every video above has a written guide, and the documentation covers the parts that are quicker
              to scan than to watch.
            </p>
          </div>
          <Link
            href="/help/docs"
            className="inline-flex h-9 items-center gap-1.5 bg-ink px-3.5 text-[11.5px] font-medium text-text-inverse transition-colors duration-[var(--dur-micro)] hover:bg-ink-hover"
          >
            Browse all documentation
            <ArrowRight size={13} />
          </Link>
        </Card>
      </section>
    </main>
  );
}
