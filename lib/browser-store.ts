"use client";

import type { OccasionId, PageStatus, ThemeId } from "./types";

export type SavedPage = {
  slug: string;
  editKey: string;
  title: string;
  recipient: string;
  occasion: OccasionId;
  theme?: ThemeId;
  status: PageStatus;
  createdAt: string;
};

const KEY = "lovenote.pages.v1";

export function listSaved(): SavedPage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as SavedPage[]) : [];
  } catch {
    return [];
  }
}

function write(pages: SavedPage[]) {
  window.localStorage.setItem(KEY, JSON.stringify(pages));
}

export function saveSaved(page: SavedPage) {
  if (typeof window === "undefined") return;
  const pages = listSaved().filter((p) => p.slug !== page.slug);
  write([page, ...pages]);
}

export function getSaved(slug: string): SavedPage | null {
  return listSaved().find((p) => p.slug === slug) ?? null;
}

export function updateSaved(slug: string, patch: Partial<SavedPage>) {
  if (typeof window === "undefined") return;
  const pages = listSaved().map((p) => (p.slug === slug ? { ...p, ...patch } : p));
  write(pages);
}

export function removeSaved(slug: string) {
  if (typeof window === "undefined") return;
  write(listSaved().filter((p) => p.slug !== slug));
}
