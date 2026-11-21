import { NextResponse } from "next/server";
import { editKeyMatches } from "@/lib/auth";
import { getStore } from "@/lib/store";

export const runtime = "nodejs";

const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const pageId = String(form.get("pageId") ?? "");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No photo was sent." }, { status: 400 });
    }
    if (!/^[a-zA-Z0-9-]{8,64}$/.test(pageId)) {
      return NextResponse.json({ error: "Invalid page." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "That photo is too large (max 10MB)." }, { status: 413 });
    }

    const ext = TYPES[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: "Please use a JPEG, PNG, WebP, AVIF or GIF image." },
        { status: 415 },
      );
    }

    const store = await getStore();

    // if this page already exists, only its owner may add photos
    const existing = await store.findById(pageId);
    if (existing) {
      const key = request.headers.get("x-edit-key");
      if (!editKeyMatches(key, existing.editKeyHash)) {
        return NextResponse.json({ error: "Not allowed." }, { status: 401 });
      }
    }

    const name = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const storageKey = `${pageId}/${name}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await store.saveImage(storageKey, buffer, file.type);

    return NextResponse.json({ url, path: storageKey, id: name });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
