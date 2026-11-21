"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Editor from "@/components/Editor";
import { getSaved, saveSaved } from "@/lib/browser-store";
import type { PublicPage } from "@/lib/types";
import { Heart, Lock } from "./icons";

type State =
  | { status: "loading" }
  | { status: "ready"; page: PublicPage; key: string; mode: "local" | "supabase" }
  | { status: "locked"; message?: string }
  | { status: "missing" };

export default function EditLoader({ slug }: { slug: string }) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [keyInput, setKeyInput] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(
    async (key: string) => {
      setError("");
      try {
        const res = await fetch(`/api/pages/${slug}`, {
          headers: { "x-edit-key": key },
          cache: "no-store",
        });

        if (res.status === 404) {
          setState({ status: "missing" });
          return;
        }
        if (res.status === 401) {
          setState({ status: "locked", message: "That edit key doesn't match this page." });
          return;
        }
        if (!res.ok) throw new Error("Could not open the page");

        const json = (await res.json()) as {
          page: PublicPage;
          mode: "local" | "supabase";
        };

        saveSaved({
          slug: json.page.slug,
          editKey: key,
          title: json.page.title,
          recipient: json.page.recipient,
          occasion: json.page.occasion,
          theme: json.page.theme,
          status: json.page.status,
          createdAt: json.page.createdAt,
        });

        setState({ status: "ready", page: json.page, key, mode: json.mode });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        setState({ status: "locked" });
      }
    },
    [slug],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("key");
    const saved = getSaved(slug);
    const key = fromUrl || saved?.editKey;
    if (!key) {
      setState({ status: "locked" });
      return;
    }
    load(key);
  }, [load, slug]);

  if (state.status === "ready") {
    return <Editor kind="edit" initial={state.page} editKey={state.key} storeMode={state.mode} />;
  }

  return (
    <div className="grain flex min-h-dvh flex-col items-center justify-center bg-paper px-5 text-center">
      <Link href="/" className="mb-10 flex items-center gap-2">
        <Heart className="h-[18px] w-[18px] text-accent" />
        <span className="font-display text-xl tracking-tight">lovenote</span>
      </Link>

      {state.status === "loading" && (
        <div className="animate-fade">
          <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" />
          <p className="mt-5 text-sm text-ink-soft">Opening your page…</p>
        </div>
      )}

      {state.status === "locked" && (
        <div className="w-full max-w-sm animate-rise">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Lock className="h-5 w-5" />
          </span>
          <h1 className="mt-5 font-display text-2xl">This page is locked</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            {state.message ??
              "Paste your edit key to open the editor. It looks like a long string of letters and numbers."}
          </p>

          <form
            className="mt-6 flex flex-col gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (keyInput.trim()) load(keyInput.trim());
            }}
          >
            <input
              value={keyInput}
              autoFocus
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="your edit key"
              className="field text-center font-mono text-sm"
            />
            {error && <p className="text-xs text-accent">{error}</p>}
            <button type="submit" className="btn btn-primary">
              Open the editor
            </button>
          </form>

          <p className="mt-6 text-xs text-ink-soft">
            Lost the key?{" "}
            <Link href="/dashboard" className="underline decoration-line underline-offset-4">
              Check your pages
            </Link>{" "}
            or start a fresh one.
          </p>
        </div>
      )}

      {state.status === "missing" && (
        <div className="max-w-sm animate-rise">
          <h1 className="font-display text-2xl">We couldn't find that page</h1>
          <p className="mt-2 text-sm text-ink-soft">
            It may have been deleted, or the link might be slightly off.
          </p>
          <Link href="/create" className="btn btn-primary mt-6">
            Make a new page
          </Link>
        </div>
      )}
    </div>
  );
}
