import { NextResponse } from "next/server";
import { hashEditKey, newEditKey } from "@/lib/auth";
import { getStore, toPublic } from "@/lib/store";
import { buildNewPage } from "@/lib/validate";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const page = buildNewPage(body);

    if (!page.title && !page.recipient) {
      return NextResponse.json(
        { error: "Give your page a name or a headline first." },
        { status: 400 },
      );
    }

    const store = await getStore();
    const editKey = newEditKey();
    const record = await store.createPage(page, hashEditKey(editKey));

    return NextResponse.json({ editKey, page: toPublic(record) }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
