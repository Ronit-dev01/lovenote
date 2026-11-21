import Link from "next/link";
import { Heart } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="grain flex min-h-dvh flex-col items-center justify-center bg-paper px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
        <Heart className="h-6 w-6" />
      </span>
      <p className="eyebrow mt-6">lost, a little</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight">This page isn't here</h1>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
        But the person you were thinking of still is. Maybe start there.
      </p>
      <Link href="/" className="btn btn-primary mt-8">
        Back to lovenote
      </Link>
    </div>
  );
}
