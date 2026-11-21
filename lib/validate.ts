import { MAX_PHOTOS, isValidSlug, slugify } from "./utils";
import type {
  NewPage,
  OccasionId,
  PageFields,
  PageStatus,
  Photo,
  ThemeId,
} from "./types";
import { THEMES } from "./themes";
import { OCCASIONS } from "./occasions";

const OCCASION_IDS = new Set(OCCASIONS.map((o) => o.id));
const THEME_IDS = new Set(THEMES.map((t) => t.id));

function text(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/\r\n/g, "\n").trim().slice(0, max);
}

function isSafeUrl(value: string): boolean {
  return (
    value.startsWith("/api/media/") ||
    /^https:\/\/[a-z0-9.-]+\.supabase\.co\//i.test(value)
  );
}

export function cleanPhotos(input: unknown): Photo[] {
  if (!Array.isArray(input)) return [];
  return input
    .slice(0, MAX_PHOTOS)
    .map((raw): Photo | null => {
      if (!raw || typeof raw !== "object") return null;
      const p = raw as Record<string, unknown>;
      const url = typeof p.url === "string" ? p.url : "";
      if (!isSafeUrl(url)) return null;
      return {
        id: text(p.id, 64) || Math.random().toString(36).slice(2),
        url,
        path: text(p.path, 200) || undefined,
        caption: text(p.caption, 140),
      };
    })
    .filter((p): p is Photo => Boolean(p));
}

/** Validates and normalises anything coming from the browser. */
export function cleanFields(input: unknown): PageFields {
  const raw = (input ?? {}) as Record<string, unknown>;
  const occasion = text(raw.occasion, 32);
  const theme = text(raw.theme, 32);

  return {
    occasion: (OCCASION_IDS.has(occasion as OccasionId) ? occasion : "just-because") as OccasionId,
    theme: (THEME_IDS.has(theme as ThemeId) ? theme : "blush") as ThemeId,
    recipient: text(raw.recipient, 60),
    sender: text(raw.sender, 60),
    title: text(raw.title, 120),
    subtitle: text(raw.subtitle, 160),
    letterTitle: text(raw.letterTitle, 120),
    letterBody: text(raw.letterBody, 6000),
    signature: text(raw.signature, 60),
    ps: text(raw.ps, 400),
    songUrl: safeLink(text(raw.songUrl, 400)),
    songLabel: text(raw.songLabel, 60),
    specialDate: /^\d{4}-\d{2}-\d{2}$/.test(text(raw.specialDate, 10))
      ? text(raw.specialDate, 10)
      : "",
    specialDateLabel: text(raw.specialDateLabel, 40),
    photos: cleanPhotos(raw.photos),
  };
}

function safeLink(value: string): string {
  if (!value) return "";
  try {
    const url = new URL(value);
    if (url.protocol === "http:" || url.protocol === "https:") return url.toString();
  } catch {
    /* not a url */
  }
  return "";
}

export function cleanStatus(value: unknown): PageStatus {
  return value === "published" ? "published" : "draft";
}

export function cleanSlug(input: unknown, fallback: string): string {
  const raw = typeof input === "string" ? input : "";
  const slug = slugify(raw) || slugify(fallback) || "our-story";
  return isValidSlug(slug) ? slug : "our-story";
}

export function cleanId(input: unknown): string | null {
  if (typeof input !== "string") return null;
  return /^[a-zA-Z0-9-]{8,64}$/.test(input) ? input : null;
}

export function buildNewPage(input: unknown): NewPage {
  const raw = (input ?? {}) as Record<string, unknown>;
  const id = cleanId(raw.id);
  if (!id) throw new Error("Invalid page id");
  const fields = cleanFields(raw);
  return {
    ...fields,
    id,
    slug: cleanSlug(raw.slug, fields.recipient || fields.title),
    status: cleanStatus(raw.status),
  };
}
