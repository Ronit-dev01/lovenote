import Link from "next/link";
import { Heart } from "./icons";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Link href="/" className="flex items-center gap-2">
          <Heart className="h-[18px] w-[18px] text-accent" />
          <span className="font-display text-xl tracking-tight">lovenote</span>
        </Link>

        <nav className="hidden items-center gap-7 text-[13px] text-ink-soft md:flex">
          <a href="/#how" className="transition-colors hover:text-ink">
            How it works
          </a>
          <a href="/#looks" className="transition-colors hover:text-ink">
            The look
          </a>
          <Link href="/example" className="transition-colors hover:text-ink">
            Example
          </Link>
          <Link href="/dashboard" className="transition-colors hover:text-ink">
            Your pages
          </Link>
        </nav>

        <Link href="/create" className="btn btn-primary btn-sm">
          Make a page
        </Link>
      </div>
    </header>
  );
}
