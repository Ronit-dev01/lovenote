"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { PageFields } from "@/lib/types";
import { getOccasion } from "@/lib/occasions";
import { cn, daysSince, formatDate, paragraphs } from "@/lib/utils";
import { Calendar, Heart, Music, X } from "./icons";

type Props = {
  page: PageFields;
  preview?: boolean;
  cta?: boolean;
};

const ROTATIONS = [-1.6, 1.1, -0.7, 1.7, -1.1, 0.8];

export default function PageView({ page, preview = false, cta = true }: Props) {
  const [opened, setOpened] = useState(preview);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const occasion = getOccasion(page.occasion);
  const body = paragraphs(page.letterBody);
  const days = daysSince(page.specialDate);
  const accent = "var(--accent)";

  useEffect(() => {
    if (preview) return;
    const previous = document.body.style.overflow;
    if (!opened) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [opened, preview]);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  return (
    <div
      data-theme={page.theme}
      className="grain relative min-h-full overflow-x-hidden bg-paper font-sans text-ink"
    >
      {!opened && (
        <Cover
          recipient={page.recipient}
          occasion={page.occasion}
          onOpen={() => setOpened(true)}
        />
      )}

      <div className="relative z-10">
        <FloatingHearts />

        <main className={opened ? "animate-fade" : "opacity-0"}>
          {/* ── hero ───────────────────────────────────────────── */}
          <section className="relative px-5 pb-12 pt-16 text-center sm:pb-16 sm:pt-24">
            <div className="mx-auto max-w-3xl">
              <p className="eyebrow animate-rise">{occasion.eyebrow}</p>

              <h1
                className="animate-rise mt-7 font-display text-[clamp(2.5rem,8.5vw,4.9rem)] font-normal leading-[1.02] tracking-[-0.025em]"
                style={{ animationDelay: "80ms" }}
              >
                {page.title || `For ${page.recipient || "you"}`}
              </h1>

              {page.subtitle && (
                <p
                  className="animate-rise mx-auto mt-6 max-w-xl font-display text-[1.05rem] italic leading-relaxed text-ink-soft sm:text-xl"
                  style={{ animationDelay: "160ms" }}
                >
                  {page.subtitle}
                </p>
              )}

              <div
                className="animate-rise mt-9 flex flex-col items-center gap-3"
                style={{ animationDelay: "240ms" }}
              >
                <span className="h-10 w-px bg-line" />
                {(page.recipient || page.sender) && (
                  <p className="hand text-2xl text-accent sm:text-[1.7rem]">
                    {page.recipient ? `for ${page.recipient}` : ""}
                    {page.recipient && page.sender ? " · " : ""}
                    {page.sender ? `from ${page.sender}` : ""}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* ── letter ─────────────────────────────────────────── */}
          {body.length > 0 && (
            <section className="px-4 pb-16 sm:px-6 sm:pb-20">
              <article className="relative mx-auto max-w-[40rem] rounded-[1.6rem] border border-line bg-card px-6 py-10 shadow-[0_40px_80px_-50px_rgba(30,10,14,0.45)] sm:px-12 sm:py-14">
                <span
                  className="absolute left-7 top-7 h-2 w-2 rounded-full opacity-70"
                  style={{ background: accent }}
                />
                {page.letterTitle && (
                  <h2 className="mb-6 font-display text-2xl italic leading-snug sm:text-[1.7rem]">
                    {page.letterTitle}
                  </h2>
                )}
                <div className="space-y-5">
                  {body.map((para, i) => (
                    <p key={i} className="whitespace-pre-line text-[1.02rem] leading-[1.9]">
                      {para}
                    </p>
                  ))}
                </div>

                {page.signature && (
                  <p className="hand mt-10 text-3xl leading-none text-accent">
                    {page.signature}
                  </p>
                )}

                {page.ps && (
                  <div className="mt-9 border-t border-line pt-6">
                    <p className="hand text-lg leading-none text-accent">p.s.</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{page.ps}</p>
                  </div>
                )}
              </article>
            </section>
          )}

          {/* ── photos ─────────────────────────────────────────── */}
          {page.photos.length > 0 && (
            <section className="px-4 pb-20 sm:px-6 sm:pb-24">
              <div className="mb-10 text-center">
                <p className="eyebrow">in pictures</p>
                <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">
                  us, lately
                </h2>
              </div>

              <div
                className={cn(
                  "mx-auto grid items-start gap-5",
                  page.photos.length === 1 ? "max-w-md" : "max-w-4xl sm:grid-cols-2",
                )}
              >
                {page.photos.map((photo, i) => (
                  <figure
                    key={photo.id}
                    className={cn(
                      "group rounded-[3px] bg-white p-3 pb-2 shadow-[0_18px_40px_-24px_rgba(30,10,14,0.5)]",
                      page.photos.length > 1 &&
                        page.photos.length % 2 === 1 &&
                        i === page.photos.length - 1 &&
                        "sm:col-span-2 sm:mx-auto sm:w-[calc(50%-0.625rem)]",
                    )}
                    style={{ rotate: `${ROTATIONS[i % ROTATIONS.length]}deg` }}
                  >
                    <button
                      type="button"
                      onClick={() => setLightbox(i)}
                      className="block w-full cursor-zoom-in overflow-hidden bg-[#f0e9e2]"
                      aria-label={photo.caption ? `View photo: ${photo.caption}` : "View photo"}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.url}
                        alt={photo.caption || "A photo from us"}
                        loading="lazy"
                        className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    </button>
                    {photo.caption && (
                      <figcaption className="hand px-2 pb-2 pt-3 text-center text-xl leading-tight text-[#3b2b2e]">
                        {photo.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </section>
          )}

          {/* ── little extras ──────────────────────────────────── */}
          {(page.specialDate || page.songUrl) && (
            <section className="px-4 pb-20 sm:px-6">
              <div className="mx-auto flex max-w-2xl flex-wrap items-stretch justify-center gap-4">
                {page.specialDate && days !== null && (
                  <div className="flex min-w-[15rem] flex-1 items-center gap-4 rounded-2xl border border-line bg-card px-5 py-4">
                    <Calendar className="h-5 w-5 shrink-0 text-accent" />
                    <div>
                      <p className="text-sm font-medium">
                        {page.specialDateLabel || "since"} {formatDate(page.specialDate, false)}
                      </p>
                      <p className="text-xs text-ink-soft">
                        {days >= 0
                          ? `${days.toLocaleString("en-GB")} days and counting`
                          : `${Math.abs(days).toLocaleString("en-GB")} days to go`}
                      </p>
                    </div>
                  </div>
                )}

                {page.songUrl && (
                  <a
                    href={page.songUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex min-w-[15rem] flex-1 items-center gap-4 rounded-2xl border border-line bg-card px-5 py-4 transition-colors hover:border-accent"
                  >
                    <Music className="h-5 w-5 shrink-0 text-accent" />
                    <div>
                      <p className="text-sm font-medium">{page.songLabel || "our song"}</p>
                      <p className="text-xs text-ink-soft">open the link</p>
                    </div>
                  </a>
                )}
              </div>
            </section>
          )}

          {/* ── footer ─────────────────────────────────────────── */}
          <footer className="border-t border-line px-6 py-12 text-center">
            <Heart className="mx-auto h-5 w-5 text-accent" />
            <p className="hand mt-3 text-2xl">made with love{page.sender ? `, ${page.sender}` : ""}</p>
            {preview ? (
              <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-ink-soft">
                end of preview
              </p>
            ) : (
              cta && (
                <div className="mt-6 flex flex-col items-center gap-2">
                  <p className="text-xs text-ink-soft">a lovenote page</p>
                  <Link
                    href="/create"
                    className="text-xs text-ink-soft underline decoration-line underline-offset-4 transition-colors hover:text-accent"
                  >
                    make one for someone you love
                  </Link>
                </div>
              )
            )}
          </footer>
        </main>
      </div>

      {lightbox !== null && page.photos[lightbox] && (
        <div
          className="fixed inset-0 z-[60] flex animate-fade flex-col items-center justify-center gap-4 bg-black/88 px-4 py-10 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className="absolute right-5 top-5 rounded-full border border-white/20 p-2 text-white/80 hover:bg-white/10"
            onClick={() => setLightbox(null)}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={page.photos[lightbox].url}
            alt={page.photos[lightbox].caption || "Photo"}
            className="max-h-[78vh] max-w-full rounded-sm object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          {page.photos[lightbox].caption && (
            <p className="hand text-center text-2xl text-white/90">
              {page.photos[lightbox].caption}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Cover({
  recipient,
  occasion,
  onOpen,
}: {
  recipient: string;
  occasion: string;
  onOpen: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex animate-fade flex-col items-center justify-center bg-paper px-6 text-center">
      <FloatingHearts />
      <button
        type="button"
        onClick={onOpen}
        className="group relative outline-none"
        aria-label="Open your letter"
      >
        <div className="relative h-40 w-64 rounded-[10px] border border-line bg-card shadow-[0_30px_70px_-30px_rgba(30,10,14,0.5)] transition-transform duration-500 group-hover:-translate-y-1 sm:h-48 sm:w-80">
          <div
            className="absolute inset-x-0 top-0 h-20 rounded-t-[10px] border-b border-line bg-paper-2 sm:h-24"
            style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
          />
          <div className="absolute left-1/2 top-[29%] flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-accent shadow-lg transition-transform duration-500 group-hover:scale-105 sm:h-14 sm:w-14">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <div className="absolute inset-x-0 bottom-4 px-6 sm:bottom-5">
            <p className="hand text-xl text-ink-soft sm:text-2xl">
              {recipient ? `for ${recipient}` : "for you"}
            </p>
          </div>
        </div>
      </button>

      <p className="eyebrow mt-10">{getOccasion(occasion).eyebrow}</p>
      <p className="animate-pulse-soft mt-3 text-[10px] uppercase tracking-[0.32em] text-ink-soft">
        tap to open
      </p>
    </div>
  );
}

function FloatingHearts() {
  const bits = [
    { left: "8%", top: "18%", size: 14, delay: "0s", dur: "16s" },
    { left: "88%", top: "12%", size: 10, delay: "1.2s", dur: "19s" },
    { left: "78%", top: "62%", size: 16, delay: "2.4s", dur: "17s" },
    { left: "14%", top: "72%", size: 11, delay: "0.6s", dur: "21s" },
    { left: "46%", top: "8%", size: 9, delay: "3s", dur: "18s" },
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {bits.map((b, i) => (
        <Heart
          key={i}
          className="animate-drift absolute text-accent"
          style={{
            left: b.left,
            top: b.top,
            width: b.size,
            height: b.size,
            opacity: 0.16,
            animationDelay: b.delay,
            animationDuration: b.dur,
          }}
        />
      ))}
    </div>
  );
}
