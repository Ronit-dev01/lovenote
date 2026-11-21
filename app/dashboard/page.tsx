"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import {
  ArrowRight,
  Check,
  Copy,
  Eye,
  Heart,
  LinkIcon,
  Lock,
  Pencil,
  Plus,
  Trash,
} from "@/components/icons";
import { getTheme } from "@/lib/themes";
import { getOccasion } from "@/lib/occasions";
import { formatDate } from "@/lib/utils";
import { listSaved, removeSaved, saveSaved, updateSaved, type SavedPage } from "@/lib/browser-store";

type Row = SavedPage & {
  views?: number;
  broken?: boolean;
  loading?: boolean;
};

export default function DashboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState("");
  const [restore, setRestore] = useState("");
  const [restoreError, setRestoreError] = useState("");

  useEffect(() => {
    const saved = listSaved();
    setRows(saved.map((p) => ({ ...p, loading: true })));
    setReady(true);

    saved.forEach(async (page) => {
      try {
        const res = await fetch(`/api/pages/${page.slug}`, {
          headers: { "x-edit-key": page.editKey },
          cache: "no-store",
        });
        if (res.status === 404) {
          setRows((current) =>
            current.map((r) => (r.slug === page.slug ? { ...r, loading: false, broken: true } : r)),
          );
          return;
        }
        if (!res.ok) {
          setRows((current) =>
            current.map((r) => (r.slug === page.slug ? { ...r, loading: false } : r)),
          );
          return;
        }
        const json = await res.json();
        updateSaved(page.slug, {
          title: json.page.title,
          recipient: json.page.recipient,
          status: json.page.status,
          theme: json.page.theme,
        });
        setRows((current) =>
          current.map((r) =>
            r.slug === page.slug
              ? {
                  ...r,
                  title: json.page.title,
                  recipient: json.page.recipient,
                  status: json.page.status,
                  theme: json.page.theme,
                  views: json.page.views,
                  loading: false,
                }
              : r,
          ),
        );
      } catch {
        setRows((current) =>
          current.map((r) => (r.slug === page.slug ? { ...r, loading: false } : r)),
        );
      }
    });
  }, []);

  async function copyText(text: string, tag: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(tag);
      setTimeout(() => setCopied(""), 1600);
    } catch {
      /* noop */
    }
  }

  async function remove(row: Row) {
    if (!window.confirm(`Delete “${row.title || row.slug}”? The link will stop working.`)) return;
    const res = await fetch(`/api/pages/${row.slug}`, {
      method: "DELETE",
      headers: { "x-edit-key": row.editKey },
    });
    if (res.ok) {
      removeSaved(row.slug);
      setRows((current) => current.filter((r) => r.slug !== row.slug));
    }
  }

  function handleRestore(event: React.FormEvent) {
    event.preventDefault();
    setRestoreError("");
    const value = restore.trim();
    if (!value) return;

    try {
      const url = new URL(value);
      const match = url.pathname.match(/\/edit\/([a-z0-9-]+)/i);
      const key = url.searchParams.get("key") ?? url.searchParams.get("edit");
      if (!match || !key) throw new Error("missing");
      saveSaved({
        slug: match[1],
        editKey: key,
        title: "",
        recipient: "",
        occasion: "just-because",
        status: "draft",
        createdAt: new Date().toISOString(),
      });
      window.location.href = `/edit/${match[1]}`;
    } catch {
      setRestoreError("Paste the full edit link, including the key after ?key=");
    }
  }

  return (
    <div className="grain min-h-dvh bg-paper text-ink">
      <SiteHeader />

      <main className="relative z-10 mx-auto max-w-5xl px-5 py-12 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">your pages</p>
            <h1 className="mt-3 font-display text-[clamp(2rem,5vw,2.9rem)] leading-tight tracking-[-0.02em]">
              Everything you've made
            </h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-soft">
              Saved in this browser. Open a page to edit, or copy its link to share.
            </p>
          </div>
          <Link href="/create" className="btn btn-primary btn-sm">
            <Plus className="h-4 w-4" /> New page
          </Link>
        </div>

        {ready && rows.length === 0 && (
          <div className="mt-12 rounded-[1.75rem] border border-dashed border-line bg-paper-2/30 px-6 py-16 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
              <Heart className="h-6 w-6" />
            </span>
            <h2 className="mt-5 font-display text-2xl">Nothing here yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
              Your pages will appear here once you publish one. It takes about two minutes to make
              the first.
            </p>
            <Link href="/create" className="btn btn-primary mt-7">
              Make your first page <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {rows.length > 0 && (
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {rows.map((row) => {
              const theme = getTheme(row.theme);
              const origin = typeof window !== "undefined" ? window.location.origin : "";
              const shareUrl = `${origin}/s/${row.slug}`;
              const editUrl = `${origin}/edit/${row.slug}?key=${row.editKey}`;

              return (
                <article
                  key={row.slug}
                  className="group overflow-hidden rounded-[1.4rem] border border-line bg-card transition-shadow hover:shadow-[0_30px_60px_-45px_rgba(30,10,14,0.5)]"
                >
                  <div
                    data-theme={theme.id}
                    className="grain relative flex h-32 items-center justify-between overflow-hidden bg-paper px-5"
                  >
                    <div>
                      <p className="eyebrow !text-[9px]">{getOccasion(row.occasion).label}</p>
                      <p className="mt-2 line-clamp-2 font-display text-xl leading-tight">
                        {row.title || `For ${row.recipient || "you"}`}
                      </p>
                    </div>
                    <Heart className="h-7 w-7 shrink-0 text-accent opacity-60" />
                    <span
                      className="absolute bottom-0 left-0 h-1 w-full"
                      style={{ background: theme.swatch[2] }}
                    />
                  </div>

                  <div className="p-5">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-soft">
                      <span
                        className={
                          row.status === "published"
                            ? "rounded-full bg-accent-soft px-2 py-0.5 font-medium text-accent"
                            : "rounded-full border border-line px-2 py-0.5"
                        }
                      >
                        {row.loading ? "checking…" : row.status}
                      </span>
                      {row.recipient && <span>for {row.recipient}</span>}
                      {typeof row.views === "number" && row.status === "published" && (
                        <span className="inline-flex items-center gap-1">
                          <Eye className="h-3 w-3" /> {row.views}
                        </span>
                      )}
                      <span className="ml-auto text-[10px]">
                        {row.createdAt ? formatDate(row.createdAt.slice(0, 10)) : ""}
                      </span>
                    </div>

                    {row.broken ? (
                      <p className="mt-3 text-xs text-accent">
                        This page no longer exists on the server.
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Link href={`/edit/${row.slug}`} className="btn btn-primary btn-sm">
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Link>
                      {row.status === "published" && (
                        <a
                          href={`/s/${row.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-ghost btn-sm"
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => copyText(shareUrl, `link-${row.slug}`)}
                        className="btn btn-ghost btn-sm"
                        disabled={row.status !== "published"}
                      >
                        {copied === `link-${row.slug}` ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                        Link
                      </button>
                      <button
                        type="button"
                        onClick={() => copyText(editUrl, `edit-${row.slug}`)}
                        className="btn btn-ghost btn-sm"
                        title="Copy the private edit link"
                      >
                        {copied === `edit-${row.slug}` ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Lock className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(row)}
                        className="ml-auto rounded-full p-2 text-ink-soft transition-colors hover:bg-accent-soft hover:text-accent"
                        aria-label="Delete page"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* restore */}
        <section className="mt-12 rounded-[1.4rem] border border-line bg-paper-2/40 p-6">
          <div className="flex items-start gap-3">
            <LinkIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <div className="flex-1">
              <h2 className="text-sm font-semibold">Made a page on another device?</h2>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
                Paste its private edit link here to bring it into this browser.
              </p>
              <form onSubmit={handleRestore} className="mt-4 flex flex-col gap-2 sm:flex-row">
                <input
                  value={restore}
                  onChange={(e) => setRestore(e.target.value)}
                  placeholder="https://…/edit/our-story?key=…"
                  className="field flex-1 text-sm"
                />
                <button type="submit" className="btn btn-ghost btn-sm shrink-0">
                  Open it
                </button>
              </form>
              {restoreError && <p className="mt-2 text-xs text-accent">{restoreError}</p>}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
