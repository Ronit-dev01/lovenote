import { NextResponse } from "next/server";
import { editKeyMatches } from "@/lib/auth";
import { getStore, toPublic } from "@/lib/store";
import type { Photo } from "@/lib/types";
import { cleanFields, cleanStatus } from "@/lib/validate";

export const runtime = "nodejs";

type Params = { params: Promise<{ slug: string }> };

function keyFrom(request: Request, url: URL): string | null {
  return request.headers.get("x-edit-key") || url.searchParams.get("key");
}

export async function GET(request: Request, { params }: Params) {
  const { slug } = await params;
  const url = new URL(request.url);
  const store = await getStore();
  const record = await store.findBySlug(slug);

  if (!record) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }
  if (!editKeyMatches(keyFrom(request, url), record.editKeyHash)) {
    return NextResponse.json({ error: "That edit key doesn't match." }, { status: 401 });
  }

  return NextResponse.json({ page: toPublic(record), mode: store.mode });
}

export async function PATCH(request: Request, { params }: Params) {
  const { slug } = await params;
  const url = new URL(request.url);
  const store = await getStore();
  const record = await store.findBySlug(slug);

  if (!record) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }
  if (!editKeyMatches(keyFrom(request, url), record.editKeyHash)) {
    return NextResponse.json({ error: "That edit key doesn't match." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const fields = cleanFields(body);
    const updated = await store.updatePage(slug, {
      ...fields,
      status: cleanStatus(body.status),
    });
    if (!updated) throw new Error("Could not save");
    return NextResponse.json({ page: toPublic(updated) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const { slug } = await params;
  const url = new URL(request.url);
  const store = await getStore();
  const record = await store.findBySlug(slug);

  if (!record) {
    return NextResponse.json({ error: "Page not found" }, { status: 404 });
  }
  if (!editKeyMatches(keyFrom(request, url), record.editKeyHash)) {
    return NextResponse.json({ error: "That edit key doesn't match." }, { status: 401 });
  }

  await Promise.allSettled(
    record.photos.map((photo: Photo) => {
      const key = photo.path || photo.url.replace("/api/media/", "");
      return store.removeImage(key);
    }),
  );
  await store.deletePage(slug);

  return NextResponse.json({ ok: true });
}
