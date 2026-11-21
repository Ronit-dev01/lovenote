import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { NewPage, PageRecord } from "./types";
import type { PagePatch, PageStore } from "./store";
import { publicSlug } from "./store";

const BUCKET = "lovenote-photos";

function client(): SupabaseClient {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

type Row = Record<string, unknown>;

function toRecord(row: Row): PageRecord {
  return {
    id: String(row.id),
    slug: String(row.slug),
    editKeyHash: String(row.edit_key_hash),
    status: row.status === "published" ? "published" : "draft",
    occasion: String(row.occasion ?? "just-because") as PageRecord["occasion"],
    theme: String(row.theme ?? "blush") as PageRecord["theme"],
    recipient: String(row.recipient ?? ""),
    sender: String(row.sender ?? ""),
    title: String(row.title ?? ""),
    subtitle: String(row.subtitle ?? ""),
    letterTitle: String(row.letter_title ?? ""),
    letterBody: String(row.letter_body ?? ""),
    signature: String(row.signature ?? ""),
    ps: String(row.ps ?? ""),
    songUrl: String(row.song_url ?? ""),
    songLabel: String(row.song_label ?? ""),
    specialDate: String(row.special_date ?? ""),
    specialDateLabel: String(row.special_date_label ?? ""),
    photos: Array.isArray(row.photos) ? (row.photos as PageRecord["photos"]) : [],
    views: Number(row.views ?? 0),
    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  };
}

function toColumns(page: NewPage, editKeyHash: string): Row {
  return {
    id: page.id,
    slug: page.slug,
    edit_key_hash: editKeyHash,
    status: page.status,
    occasion: page.occasion,
    theme: page.theme,
    recipient: page.recipient,
    sender: page.sender,
    title: page.title,
    subtitle: page.subtitle,
    letter_title: page.letterTitle,
    letter_body: page.letterBody,
    signature: page.signature,
    ps: page.ps,
    song_url: page.songUrl,
    song_label: page.songLabel,
    special_date: page.specialDate || null,
    special_date_label: page.specialDateLabel,
    photos: page.photos,
  };
}

function patchColumns(patch: PagePatch): Row {
  const map: Record<string, string> = {
    occasion: "occasion",
    theme: "theme",
    status: "status",
    recipient: "recipient",
    sender: "sender",
    title: "title",
    subtitle: "subtitle",
    letterTitle: "letter_title",
    letterBody: "letter_body",
    signature: "signature",
    ps: "ps",
    songUrl: "song_url",
    songLabel: "song_label",
    specialDate: "special_date",
    specialDateLabel: "special_date_label",
    photos: "photos",
  };
  const out: Row = { updated_at: new Date().toISOString() };
  for (const [key, column] of Object.entries(map)) {
    if (!(key in patch)) continue;
    const value = (patch as Record<string, unknown>)[key];
    if (key === "specialDate") out[column] = value || null;
    else out[column] = value;
  }
  return out;
}

export const supabaseStore: PageStore = {
  mode: "supabase",

  async createPage(page: NewPage, editKeyHash: string) {
    const db = client();
    const { data: neighbours } = await db
      .from("pages")
      .select("slug")
      .like("slug", `${page.slug}%`);
    const taken = new Set(((neighbours ?? []) as Row[]).map((row) => String(row.slug)));
    const slug = publicSlug(page.slug, taken);

    const { data, error } = await db
      .from("pages")
      .insert(toColumns({ ...page, slug }, editKeyHash))
      .select("*")
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? "Could not create the page");
    }
    return toRecord(data as Row);
  },

  async findBySlug(slug: string) {
    const db = client();
    const { data, error } = await db.from("pages").select("*").eq("slug", slug).maybeSingle();
    if (error || !data) return null;
    return toRecord(data as Row);
  },

  async findById(id: string) {
    const db = client();
    const { data, error } = await db.from("pages").select("*").eq("id", id).maybeSingle();
    if (error || !data) return null;
    return toRecord(data as Row);
  },

  async updatePage(slug: string, patch: PagePatch) {
    const db = client();
    const { data, error } = await db
      .from("pages")
      .update(patchColumns(patch))
      .eq("slug", slug)
      .select("*")
      .maybeSingle();
    if (error || !data) return null;
    return toRecord(data as Row);
  },

  async deletePage(slug: string) {
    const db = client();
    await db.from("pages").delete().eq("slug", slug);
  },

  async incrementViews(slug: string) {
    const db = client();
    const { data } = await db.from("pages").select("views").eq("slug", slug).maybeSingle();
    if (!data) return;
    await db
      .from("pages")
      .update({ views: Number((data as Row).views ?? 0) + 1 })
      .eq("slug", slug);
  },

  async slugTaken(slug: string) {
    const db = client();
    const { data } = await db.from("pages").select("slug").eq("slug", slug).maybeSingle();
    return Boolean(data);
  },

  async saveImage(key: string, data: Buffer, contentType: string) {
    const db = client();
    const { error } = await db.storage.from(BUCKET).upload(key, data, {
      contentType,
      cacheControl: "31536000",
      upsert: true,
    });
    if (error) throw new Error(error.message);
    const { data: pub } = db.storage.from(BUCKET).getPublicUrl(key);
    return pub.publicUrl;
  },

  async removeImage(key: string) {
    const db = client();
    await db.storage.from(BUCKET).remove([key]);
  },
};
