import type { NewPage, PageFields, PageRecord, PageStatus } from "./types";

export type PagePatch = Partial<PageFields> & { status?: PageStatus };

export interface PageStore {
  readonly mode: "local" | "supabase";
  createPage(page: NewPage, editKeyHash: string): Promise<PageRecord>;
  findBySlug(slug: string): Promise<PageRecord | null>;
  findById(id: string): Promise<PageRecord | null>;
  updatePage(slug: string, patch: PagePatch): Promise<PageRecord | null>;
  deletePage(slug: string): Promise<void>;
  incrementViews(slug: string): Promise<void>;
  slugTaken(slug: string): Promise<boolean>;
  saveImage(key: string, data: Buffer, contentType: string): Promise<string>;
  removeImage(key: string): Promise<void>;
}

/** picks the storage backend based on env vars */
export async function getStore(): Promise<PageStore> {
  const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (process.env.SUPABASE_URL && secret) {
    const { supabaseStore } = await import("./supabase-store");
    return supabaseStore;
  }
  const { localStore } = await import("./local-store");
  return localStore;
}

export function toPublic(page: PageRecord) {
  const { editKeyHash: _hash, ...rest } = page;
  return rest;
}

export function publicSlug(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;
  for (let i = 2; i < 50; i += 1) {
    const candidate = `${base}-${i}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${base}-${Math.random().toString(36).slice(2, 6)}`;
}
