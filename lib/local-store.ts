import fs from "node:fs/promises";
import path from "node:path";
import type { NewPage, PageRecord } from "./types";
import type { PagePatch, PageStore } from "./store";
import { publicSlug } from "./store";

const ROOT = path.join(process.cwd(), ".data");
const DB_FILE = path.join(ROOT, "pages.json");
const TMP_FILE = path.join(ROOT, "pages.json.tmp");
const UPLOAD_DIR = path.join(ROOT, "uploads");

/**
 * One writer at a time. Without this, two rapid saves could read the same
 * file and the second would overwrite the first.
 */
let tail: Promise<unknown> = Promise.resolve();
function locked<T>(work: () => Promise<T>): Promise<T> {
  const run = tail.then(work, work);
  tail = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readAll(): Promise<PageRecord[]> {
  try {
    const raw = await fs.readFile(DB_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PageRecord[]) : [];
  } catch {
    return [];
  }
}

async function writeAll(pages: PageRecord[]): Promise<void> {
  await fs.mkdir(ROOT, { recursive: true });
  const payload = JSON.stringify(pages, null, 2);
  await fs.writeFile(TMP_FILE, payload, "utf8");
  await fs.rename(TMP_FILE, DB_FILE);
}

function safeKey(key: string): string {
  const cleaned = key
    .replace(/\\/g, "/")
    .split("/")
    .filter((part) => part && part !== ".." && part !== ".");
  if (!cleaned.length) throw new Error("Invalid image key");
  return cleaned.join("/");
}

export const localStore: PageStore = {
  mode: "local",

  async createPage(page: NewPage, editKeyHash: string) {
    return locked(async () => {
      const pages = await readAll();
      const taken = new Set(pages.map((p) => p.slug));
      const slug = publicSlug(page.slug, taken);
      const now = new Date().toISOString();
      const record: PageRecord = {
        ...page,
        slug,
        editKeyHash,
        views: 0,
        createdAt: now,
        updatedAt: now,
      };
      await writeAll([...pages, record]);
      return record;
    });
  },

  async findBySlug(slug: string) {
    const pages = await readAll();
    return pages.find((p) => p.slug === slug) ?? null;
  },

  async findById(id: string) {
    const pages = await readAll();
    return pages.find((p) => p.id === id) ?? null;
  },

  async updatePage(slug: string, patch: PagePatch) {
    return locked(async () => {
      const pages = await readAll();
      const index = pages.findIndex((p) => p.slug === slug);
      if (index === -1) return null;
      const next: PageRecord = {
        ...pages[index],
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      const copy = [...pages];
      copy[index] = next;
      await writeAll(copy);
      return next;
    });
  },

  async deletePage(slug: string) {
    return locked(async () => {
      const pages = await readAll();
      await writeAll(pages.filter((p) => p.slug !== slug));
    });
  },

  async incrementViews(slug: string) {
    return locked(async () => {
      const pages = await readAll();
      const index = pages.findIndex((p) => p.slug === slug);
      if (index === -1) return;
      const copy = [...pages];
      copy[index] = { ...pages[index], views: (pages[index].views ?? 0) + 1 };
      await writeAll(copy);
    });
  },

  async slugTaken(slug: string) {
    const pages = await readAll();
    return pages.some((p) => p.slug === slug);
  },

  async saveImage(key: string, data: Buffer) {
    const clean = safeKey(key);
    const target = path.join(UPLOAD_DIR, clean);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, data);
    return `/api/media/${clean}`;
  },

  async removeImage(key: string) {
    try {
      await fs.unlink(path.join(UPLOAD_DIR, safeKey(key)));
    } catch {
      /* already gone */
    }
  },
};
