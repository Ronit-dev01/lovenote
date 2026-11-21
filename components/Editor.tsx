"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageView from "./PageView";
import { OCCASIONS } from "@/lib/occasions";
import { THEMES } from "@/lib/themes";
import { saveSaved, updateSaved } from "@/lib/browser-store";
import type { PublicPage, Photo, Draft } from "@/lib/types";
import { MAX_PHOTOS, cn, slugify, uid } from "@/lib/utils";
import {
  ArrowRight,
  Check,
  Copy,
  Eye,
  Heart,
  ImageIcon,
  LinkIcon,
  Lock,
  Plus,
  Trash,
  X,
} from "./icons";

type Props = {
  kind: "create" | "edit";
  initial?: PublicPage;
  editKey?: string;
  storeMode?: "local" | "supabase";
};

function emptyDraft(): Draft {
  return {
    id: uid(),
    slug: "",
    status: "draft",
    occasion: "just-because",
    theme: "blush",
    recipient: "",
    sender: "",
    title: "",
    subtitle: "",
    letterTitle: "",
    letterBody: "",
    signature: "",
    ps: "",
    songUrl: "",
    songLabel: "",
    specialDate: "",
    specialDateLabel: "",
    photos: [],
  };
}

export default function Editor({ kind, initial, editKey: initialKey, storeMode = "local" }: Props) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(() =>
    initial ? { ...initial } : emptyDraft(),
  );
  const [editKey, setEditKey] = useState(initialKey ?? "");
  const [showPreview, setShowPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [busy, setBusy] = useState(false);
  const [published, setPublished] = useState<{ slug: string; editKey: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [editLinkCopied, setEditLinkCopied] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);

  const dirty = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    dirty.current = true;
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const patch = (changes: Partial<Draft>) => {
    dirty.current = true;
    setDraft((current) => ({ ...current, ...changes }));
  };

  /* ── autosave (edit mode) ─────────────────────────────────────── */
  useEffect(() => {
    if (kind !== "edit" || !dirty.current) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);

    setSaveState("saving");
    const snapshot = draft;
    saveTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/pages/${snapshot.slug}`, {
          method: "PATCH",
          headers: { "content-type": "application/json", "x-edit-key": editKey },
          body: JSON.stringify(snapshot),
        });
        if (!res.ok) throw new Error("save failed");
        setSaveState("saved");
        updateSaved(snapshot.slug, {
          title: snapshot.title,
          recipient: snapshot.recipient,
          status: snapshot.status,
          occasion: snapshot.occasion,
          theme: snapshot.theme,
        });
      } catch {
        setSaveState("error");
      }
    }, 900);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  /* ── photos ───────────────────────────────────────────────────── */
  async function addFiles(files: FileList | File[]) {
    const room = MAX_PHOTOS - draft.photos.length;
    if (room <= 0) {
      setError(`You can add up to ${MAX_PHOTOS} photos.`);
      return;
    }
    setError("");
    setUploading(true);

    for (const original of Array.from(files).slice(0, room)) {
      if (!original.type.startsWith("image/")) continue;
      try {
        const file = await shrink(original);
        const data = new FormData();
        data.append("file", file);
        data.append("pageId", draft.id);

        const res = await fetch("/api/upload", {
          method: "POST",
          headers: editKey ? { "x-edit-key": editKey } : undefined,
          body: data,
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Upload failed");

        dirty.current = true;
        setDraft((current) => ({
          ...current,
          photos: [
            ...current.photos,
            { id: json.id, url: json.url, path: json.path, caption: "" },
          ],
        }));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not upload that photo.");
      }
    }
    setUploading(false);
  }

  function removePhoto(id: string) {
    patch({ photos: draft.photos.filter((p) => p.id !== id) });
  }

  function caption(id: string, value: string) {
    patch({
      photos: draft.photos.map((p) => (p.id === id ? { ...p, caption: value } : p)),
    });
  }

  function move(id: string, direction: -1 | 1) {
    const index = draft.photos.findIndex((p) => p.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= draft.photos.length) return;
    const next = [...draft.photos];
    [next[index], next[target]] = [next[target], next[index]];
    patch({ photos: next });
  }

  /* ── publish / save ───────────────────────────────────────────── */
  function validate(nextStatus: "draft" | "published"): boolean {
    if (!draft.recipient.trim() && !draft.title.trim()) {
      setError("Add who this is for, or a headline for the page.");
      return false;
    }
    if (nextStatus === "published" && draft.letterBody.trim().length < 8 && draft.photos.length === 0) {
      setError("Write a few lines of letter, or add at least one photo, before publishing.");
      return false;
    }
    setError("");
    return true;
  }

  async function publish(nextStatus: "draft" | "published") {
    if (!validate(nextStatus)) return;
    setBusy(true);
    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...draft, status: nextStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not publish");

      const page = json.page as PublicPage;
      const key = json.editKey as string;
      setEditKey(key);
      setDraft((current) => ({ ...current, slug: page.slug, status: page.status }));
      saveSaved({
        slug: page.slug,
        editKey: key,
        title: page.title,
        recipient: page.recipient,
        occasion: page.occasion,
        theme: page.theme,
        status: page.status,
        createdAt: page.createdAt,
      });

      if (nextStatus === "draft") {
        router.push(`/edit/${page.slug}`);
      } else {
        setPublished({ slug: page.slug, editKey: key });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function changeStatus(status: "draft" | "published") {
    if (kind === "create") return publish(status);
    setBusy(true);
    try {
      const res = await fetch(`/api/pages/${draft.slug}`, {
        method: "PATCH",
        headers: { "content-type": "application/json", "x-edit-key": editKey },
        body: JSON.stringify({ ...draft, status }),
      });
      if (!res.ok) throw new Error("Could not update the page");
      setDraft((current) => ({ ...current, status }));
      updateSaved(draft.slug, { status });
      if (status === "published") setPublished({ slug: draft.slug, editKey });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function deletePage() {
    if (!window.confirm("Delete this page for good? The link will stop working.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/pages/${draft.slug}`, {
        method: "DELETE",
        headers: { "x-edit-key": editKey },
      });
      if (!res.ok) throw new Error("Could not delete the page");
      const { removeSaved } = await import("@/lib/browser-store");
      removeSaved(draft.slug);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = `${origin}/s/${draft.slug}`;
  const editUrl = `${origin}/edit/${draft.slug}?key=${editKey}`;

  async function copyEditLink() {
    try {
      await navigator.clipboard.writeText(editUrl);
      setEditLinkCopied(true);
      setTimeout(() => setEditLinkCopied(false), 1800);
    } catch {
      /* noop */
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* noop */
    }
  }

  const suggestedSlug = slugify(draft.recipient || draft.title) || "our-story";

  return (
    <div className="min-h-dvh bg-paper text-ink">
      {/* ── top bar ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[92rem] items-center gap-3 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-accent" />
            <span className="font-display text-lg tracking-tight">lovenote</span>
          </Link>

          <span className="ml-1 hidden text-xs text-ink-soft sm:block">
            {kind === "create" ? "/ new page" : `/ editing “${draft.title || draft.slug}”`}
          </span>

          <div className="ml-auto flex items-center gap-2">
            {kind === "edit" && (
              <span className="mr-1 hidden items-center gap-1.5 text-xs text-ink-soft sm:flex">
                {saveState === "saving" && "saving…"}
                {saveState === "saved" && (
                  <>
                    <Check className="h-3.5 w-3.5" /> saved
                  </>
                )}
                {saveState === "error" && <span className="text-accent">not saved</span>}
                {saveState === "idle" && "draft"}
              </span>
            )}

            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="btn btn-ghost btn-sm lg:hidden"
            >
              <Eye className="h-4 w-4" /> Preview
            </button>

            {kind === "edit" && draft.status === "published" ? (
              <a href={`/s/${draft.slug}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                <Eye className="h-4 w-4" />
                <span className="hidden sm:inline">View page</span>
              </a>
            ) : null}

            {kind === "create" ? (
              <>
                <button
                  type="button"
                  onClick={() => publish("draft")}
                  disabled={busy}
                  className="btn btn-ghost btn-sm hidden sm:inline-flex"
                >
                  Save draft
                </button>
                <button
                  type="button"
                  onClick={() => publish("published")}
                  disabled={busy}
                  className="btn btn-primary btn-sm"
                >
                  {busy ? "Publishing…" : "Publish"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => changeStatus(draft.status === "published" ? "draft" : "published")}
                disabled={busy}
                className={cn("btn btn-sm", draft.status === "published" ? "btn-primary" : "btn-accent")}
              >
                {busy ? "Saving…" : draft.status === "published" ? "Update page" : "Publish page"}
              </button>
            )}
          </div>
        </div>

        {storeMode === "local" && (
          <div className="border-t border-line bg-paper-2/60 px-4 py-1.5 text-center text-[11px] text-ink-soft">
            Demo mode · pages are saved on this computer. Add Supabase keys in{" "}
            <code className="font-mono">.env.local</code> to put them online.
          </div>
        )}
      </header>

      <div className="mx-auto grid max-w-[92rem] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,42%)] lg:py-10">
        {/* ── form ──────────────────────────────────────────────── */}
        <div className="min-w-0 space-y-6">
          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent-soft px-4 py-3 text-sm">
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              <p className="flex-1">{error}</p>
              <button type="button" onClick={() => setError("")} aria-label="Dismiss">
                <X className="h-4 w-4 opacity-60" />
              </button>
            </div>
          )}

          {/* 1 — occasion + names */}
          <Section step="01" title="The two of you" desc="Who is it for, and what's the occasion?">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {OCCASIONS.map((occasion) => (
                <button
                  key={occasion.id}
                  type="button"
                  data-active={draft.occasion === occasion.id}
                  onClick={() => {
                    const changes: Partial<Draft> = { occasion: occasion.id };
                    if (!draft.title.trim()) {
                      changes.title = occasion.title(draft.recipient);
                    }
                    if (!draft.letterBody.trim()) {
                      changes.letterBody = occasion.opening(draft.recipient);
                    }
                    patch(changes);
                  }}
                  className="chip justify-center py-2.5 text-[13px]"
                >
                  {occasion.label}
                </button>
              ))}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Their name" hint="Appears on the opening envelope">
                <input
                  value={draft.recipient}
                  onChange={(e) => {
                    update("recipient", e.target.value);
                    if (!slugEdited) patch({ slug: slugify(e.target.value) });
                  }}
                  placeholder="Ananya"
                  className="field"
                  maxLength={60}
                />
              </Field>
              <Field label="Your name" hint="Signed at the bottom">
                <input
                  value={draft.sender}
                  onChange={(e) => update("sender", e.target.value)}
                  placeholder="Rohan"
                  className="field"
                  maxLength={60}
                />
              </Field>
            </div>

            <div className="mt-4">
              <Field label="Big headline" hint="Keep it short — it's set in large type">
                <input
                  value={draft.title}
                  onChange={(e) => update("title", e.target.value)}
                  placeholder="I'm sorry, Ananya"
                  className="field font-display text-lg"
                  maxLength={120}
                />
              </Field>
            </div>

            <div className="mt-4">
              <Field label="A line underneath" hint="Optional">
                <input
                  value={draft.subtitle}
                  onChange={(e) => update("subtitle", e.target.value)}
                  placeholder="For the hundred small things I should have said out loud."
                  className="field"
                  maxLength={160}
                />
              </Field>
            </div>
          </Section>

          {/* 2 — letter */}
          <Section
            step="02"
            title="The letter"
            desc="Write it like you'd say it. Blank lines become paragraphs."
          >
            <Field label="Letter title" hint="Optional — a small heading above the letter">
              <input
                value={draft.letterTitle}
                onChange={(e) => update("letterTitle", e.target.value)}
                placeholder="I've been thinking about last Tuesday"
                className="field"
                maxLength={120}
              />
            </Field>

            <div className="mt-4">
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="label mb-0">Your letter</span>
                <span className="text-[11px] text-ink-soft">{draft.letterBody.length} / 6000</span>
              </div>
              <textarea
                value={draft.letterBody}
                onChange={(e) => update("letterBody", e.target.value)}
                rows={12}
                maxLength={6000}
                placeholder={
                  "Start anywhere. What happened, what you noticed, what you wish you'd said.\n\nThen a second paragraph, if it helps.\n\nEnd with the thing you actually mean."
                }
                className="field resize-y leading-relaxed"
              />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Sign off" hint="Your handwriting, at the end">
                <input
                  value={draft.signature}
                  onChange={(e) => update("signature", e.target.value)}
                  placeholder="always yours, Rohan"
                  className="field"
                  maxLength={60}
                />
              </Field>
              <Field label="P.S." hint="Optional — the thing you almost forgot">
                <input
                  value={draft.ps}
                  onChange={(e) => update("ps", e.target.value)}
                  placeholder="I still have your blue umbrella."
                  className="field"
                  maxLength={400}
                />
              </Field>
            </div>
          </Section>

          {/* 3 — photos */}
          <Section
            step="03"
            title="Photos"
            desc="A few favourites, with a caption each. They appear as polaroids."
            action={
              <span className="text-xs text-ink-soft">
                {draft.photos.length}/{MAX_PHOTOS}
              </span>
            }
          >
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
              }}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-paper px-6 py-9 text-center transition-colors hover:border-accent hover:bg-paper-2/50",
                uploading && "pointer-events-none opacity-60",
              )}
            >
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
                {uploading ? <Plus className="h-5 w-5 animate-spin" /> : <ImageIcon className="h-5 w-5" />}
              </span>
              <span className="text-sm font-medium">
                {uploading ? "Uploading…" : "Drop photos here, or choose files"}
              </span>
              <span className="hint">JPEG, PNG, WebP · resized automatically</span>
            </label>

            {draft.photos.length > 0 && (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {draft.photos.map((photo, index) => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    index={index}
                    total={draft.photos.length}
                    onCaption={caption}
                    onRemove={removePhoto}
                    onMove={move}
                  />
                ))}
              </div>
            )}
          </Section>

          {/* 4 — details */}
          <Section step="04" title="Little extras" desc="Optional, but these are the bits people remember.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="A date that matters" hint="We'll count the days for you">
                <input
                  type="date"
                  value={draft.specialDate}
                  onChange={(e) => update("specialDate", e.target.value)}
                  className="field"
                />
              </Field>
              <Field label="What the date is" hint="e.g. the day we met">
                <input
                  value={draft.specialDateLabel}
                  onChange={(e) => update("specialDateLabel", e.target.value)}
                  placeholder="together since"
                  className="field"
                  maxLength={40}
                />
              </Field>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Our song (link)" hint="Spotify, YouTube, anything with a URL">
                <input
                  value={draft.songUrl}
                  onChange={(e) => update("songUrl", e.target.value)}
                  placeholder="https://open.spotify.com/track/…"
                  className="field"
                />
              </Field>
              <Field label="Song label" hint="Shown on the button">
                <input
                  value={draft.songLabel}
                  onChange={(e) => update("songLabel", e.target.value)}
                  placeholder="the song from that night"
                  className="field"
                  maxLength={60}
                />
              </Field>
            </div>
          </Section>

          {/* 5 — theme */}
          <Section step="05" title="The look" desc="Four moods. You can change this any time.">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => update("theme", theme.id)}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border p-3 text-left transition-all",
                    draft.theme === theme.id
                      ? "border-accent ring-2 ring-accent/20"
                      : "border-line hover:border-accent/50",
                  )}
                >
                  <span
                    className="flex h-16 flex-col justify-between rounded-xl px-2.5 py-2"
                    style={{
                      background: theme.swatch[0],
                      border: `1px solid ${theme.swatch[2]}22`,
                    }}
                  >
                    <span
                      className="font-display text-lg leading-none"
                      style={{ color: theme.swatch[1] }}
                    >
                      Aa
                    </span>
                    <span className="flex items-center gap-1">
                      <span
                        className="h-1 w-8 rounded-full"
                        style={{ background: theme.swatch[2] }}
                      />
                      <span
                        className="h-1 w-4 rounded-full"
                        style={{ background: theme.swatch[1], opacity: 0.3 }}
                      />
                    </span>
                  </span>
                  <span className="mt-2 block text-sm font-medium">{theme.name}</span>
                  <span className="block text-[11px] leading-tight text-ink-soft">{theme.note}</span>
                  {draft.theme === theme.id && (
                    <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-white">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </Section>

          {/* 6 — link */}
          {kind === "create" ? (
            <Section step="06" title="Your link" desc="Where the page will live. Short and sweet is best.">
              <div className="flex items-center gap-1 rounded-xl border border-line bg-paper px-3 py-2.5">
                <LinkIcon className="h-4 w-4 shrink-0 text-ink-soft" />
                <span className="ml-1 shrink-0 text-sm text-ink-soft">/s/</span>
                <input
                  value={draft.slug}
                  onChange={(e) => {
                    setSlugEdited(true);
                    update("slug", slugify(e.target.value));
                  }}
                  placeholder={suggestedSlug}
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                  maxLength={60}
                />
              </div>
              <p className="hint mt-2">
                We'll add a number if it's taken. You can't change it after publishing.
              </p>
              <button
                type="button"
                onClick={() => publish("draft")}
                disabled={busy}
                className="btn btn-ghost btn-sm mt-4 sm:hidden"
              >
                Save as a draft instead
              </button>
            </Section>
          ) : (
            <Section step="06" title="Share & manage" desc="Send the link. Keep the edit key to yourself.">
              <div className="flex flex-col gap-2 sm:flex-row">
                <input readOnly value={shareUrl} className="field flex-1 text-sm" onFocus={(e) => e.target.select()} />
                <button type="button" onClick={copy} className="btn btn-primary btn-sm shrink-0">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy link"}
                </button>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-soft">
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" /> edit key saved in this browser
                </span>
                <button
                  type="button"
                  onClick={copyEditLink}
                  className="inline-flex items-center gap-1.5 underline decoration-line underline-offset-4 transition-colors hover:text-accent"
                >
                  {editLinkCopied ? <Check className="h-3.5 w-3.5" /> : <LinkIcon className="h-3.5 w-3.5" />}
                  {editLinkCopied ? "edit link copied" : "copy edit link"}
                </button>
                <button
                  type="button"
                  onClick={deletePage}
                  className="inline-flex items-center gap-1.5 text-ink-soft underline decoration-line underline-offset-4 transition-colors hover:text-accent"
                >
                  <Trash className="h-3.5 w-3.5" /> delete page
                </button>
              </div>
              <p className="hint mt-2">
                The edit link includes your secret key — keep it for yourself. It's the only way back
                in from another device.
              </p>
            </Section>
          )}

          <div className="pb-24 pt-2 text-center text-[11px] text-ink-soft lg:pb-4">
            made with <span className="text-accent">♥</span> · lovenote
          </div>
        </div>

        {/* ── live preview ──────────────────────────────────────── */}
        <div className="hidden lg:block">
          <div className="sticky top-28">
            <div className="mb-3 flex items-center justify-between px-1">
              <p className="eyebrow">live preview</p>
              <span className="text-[11px] text-ink-soft">updates as you type</span>
            </div>
            <div className="overflow-hidden rounded-[1.6rem] border border-line bg-card shadow-[0_40px_80px_-50px_rgba(30,10,14,0.5)]">
              <div className="flex items-center gap-2 border-b border-line bg-paper-2/70 px-4 py-2.5">
                <span className="h-2 w-2 rounded-full bg-accent/50" />
                <span className="h-2 w-2 rounded-full bg-accent/30" />
                <span className="h-2 w-2 rounded-full bg-accent/20" />
                <span className="ml-2 truncate rounded-md bg-paper px-2 py-1 text-[10px] text-ink-soft">
                  /s/{draft.slug || suggestedSlug}
                </span>
              </div>
              <div className="no-scrollbar h-[calc(100dvh-11rem)] overflow-y-auto">
                <PageView page={draft} preview cta={false} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* mobile preview */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex flex-col bg-paper lg:hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="eyebrow">preview</p>
            <button type="button" onClick={() => setShowPreview(false)} className="btn btn-ghost btn-sm">
              <X className="h-4 w-4" /> Close
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <PageView page={draft} preview cta={false} />
          </div>
        </div>
      )}

      {/* success */}
      {published && (
        <PublishedDialog
          slug={published.slug}
          url={shareUrl}
          onClose={() => {
            setPublished(null);
            if (kind === "create") router.push(`/edit/${published.slug}`);
          }}
          onKeepEditing={() => {
            const slug = published.slug;
            setPublished(null);
            router.push(`/edit/${slug}`);
          }}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */

function Section({
  step,
  title,
  desc,
  action,
  children,
}: {
  step: string;
  title: string;
  desc: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-5 sm:p-7">
      <div className="mb-5 flex items-start gap-3">
        <span className="mt-0.5 font-display text-xs text-accent">{step}</span>
        <div className="flex-1">
          <h2 className="font-display text-xl leading-tight">{title}</h2>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{desc}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-[11px] text-ink-soft">{hint}</span>}
    </label>
  );
}

function PhotoCard({
  photo,
  index,
  total,
  onCaption,
  onRemove,
  onMove,
}: {
  photo: Photo;
  index: number;
  total: number;
  onCaption: (id: string, value: string) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
}) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-line bg-paper">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.url} alt="" className="aspect-[4/3] w-full object-cover" />
        <div className="absolute right-2 top-2 flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onMove(photo.id, -1)}
            disabled={index === 0}
            aria-label="Move photo earlier"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition-opacity disabled:opacity-25"
          >
            <ArrowRight className="h-3.5 w-3.5 -rotate-90" />
          </button>
          <button
            type="button"
            onClick={() => onMove(photo.id, 1)}
            disabled={index === total - 1}
            aria-label="Move photo later"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition-opacity disabled:opacity-25"
          >
            <ArrowRight className="h-3.5 w-3.5 rotate-90" />
          </button>
          <button
            type="button"
            onClick={() => onRemove(photo.id)}
            aria-label="Remove photo"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="p-2.5">
        <input
          value={photo.caption}
          onChange={(e) => onCaption(photo.id, e.target.value)}
          placeholder="Add a caption…"
          maxLength={140}
          className="w-full rounded-lg bg-transparent px-1.5 py-1 text-[13px] outline-none placeholder:text-ink-soft/60 focus:bg-paper-2"
        />
      </div>
    </div>
  );
}

function PublishedDialog({
  slug,
  url,
  onClose,
  onKeepEditing,
}: {
  slug: string;
  url: string;
  onClose: () => void;
  onKeepEditing: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* noop */
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex animate-fade items-center justify-center bg-ink/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md animate-rise rounded-[1.75rem] border border-line bg-card p-7 text-center shadow-2xl">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Heart className="h-6 w-6" />
        </span>
        <h2 className="mt-5 font-display text-2xl">It's live.</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Send this link to the person it's for. They don't need an account — it just opens.
        </p>

        <div className="mt-5 flex items-center gap-2 rounded-xl border border-line bg-paper p-2 pl-3">
          <span className="min-w-0 flex-1 truncate text-left text-xs text-ink-soft">{url}</span>
          <button type="button" onClick={copy} className="btn btn-primary btn-sm shrink-0">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <div className="mt-5 grid gap-2">
          <a href={`/s/${slug}`} target="_blank" rel="noreferrer" className="btn btn-accent">
            Open the page <ArrowRight className="h-4 w-4" />
          </a>
          <button type="button" onClick={onKeepEditing} className="btn btn-ghost">
            Keep editing
          </button>
        </div>

        <p className="mt-5 flex items-start gap-2 text-left text-[11px] leading-relaxed text-ink-soft">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Your page is managed from this browser. To edit it from somewhere else, use your edit key
            — open <span className="font-mono">/dashboard</span> to copy it. Keep it private.
          </span>
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-3 text-[11px] text-ink-soft underline decoration-line underline-offset-4"
        >
          close
        </button>
      </div>
    </div>
  );
}

/* client-side resize so phone photos upload fast and stay sharp */
async function shrink(file: File): Promise<File> {
  if (file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const max = 1800;
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size <= 1_600_000) return file;

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.86),
    );
    if (!blob) return file;
    return new File([blob], "photo.jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}
