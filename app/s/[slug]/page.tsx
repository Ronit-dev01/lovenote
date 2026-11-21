import type { Metadata } from "next";
import Link from "next/link";
import PageView from "@/components/PageView";
import { getStore, toPublic } from "@/lib/store";
import { getOccasion } from "@/lib/occasions";
import { Heart } from "@/components/icons";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  const store = await getStore();
  return store.findBySlug(slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await load(slug);
  if (!page || page.status !== "published") {
    return { title: "A page for someone" };
  }

  const title = page.title || `For ${page.recipient || "you"}`;
  const description =
    page.subtitle ||
    `${getOccasion(page.occasion).eyebrow} — ${page.letterBody.replace(/\s+/g, " ").slice(0, 150)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: page.photos[0]?.url ? [{ url: page.photos[0].url }] : undefined,
      type: "article",
    },
    robots: { index: false, follow: false },
  };
}

export default async function PublicPage({ params }: Props) {
  const { slug } = await params;
  const record = await load(slug);

  if (!record || record.status !== "published") {
    return <NotReady exists={Boolean(record)} />;
  }

  // count the visit; never let it break the page
  await getStore()
    .then((store) => store.incrementViews(slug))
    .catch(() => {});

  return <PageView page={toPublic(record)} />;
}

function NotReady({ exists }: { exists: boolean }) {
  return (
    <div className="grain flex min-h-dvh flex-col items-center justify-center bg-paper px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
        <Heart className="h-6 w-6" />
      </span>
      <h1 className="mt-6 font-display text-3xl tracking-tight">
        {exists ? "Not quite ready" : "This page doesn't exist"}
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
        {exists
          ? "The person making this page is still writing. Come back in a little while."
          : "The link may be mistyped, or the page may have been taken down."}
      </p>
      <Link href="/" className="btn btn-ghost mt-8">
        Go to lovenote
      </Link>
    </div>
  );
}
