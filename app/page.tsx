import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { ArrowRight, Calendar, Envelope, Flower, Heart, ImageIcon, Lock, Sparkle } from "@/components/icons";
import { OCCASIONS } from "@/lib/occasions";
import { THEMES } from "@/lib/themes";

export default function Home() {
  return (
    <div className="grain min-h-dvh bg-paper text-ink">
      <SiteHeader />

      <main className="relative z-10">
        {/* ── hero ─────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-5 pb-20 pt-14 sm:pt-20 lg:pb-28">
          <div className="grid items-center gap-14 lg:grid-cols-[1.03fr_0.97fr] lg:gap-10">
            <div>
              <p className="eyebrow animate-rise">a little corner of the internet for two</p>

              <h1
                className="animate-rise mt-6 font-display text-[clamp(2.7rem,7.2vw,4.7rem)] font-normal leading-[0.97] tracking-[-0.03em]"
                style={{ animationDelay: "60ms" }}
              >
                Some things deserve
                <span className="mt-1 block italic text-accent">more than a text.</span>
              </h1>

              <p
                className="animate-rise mt-7 max-w-lg text-[1.05rem] leading-[1.75] text-ink-soft"
                style={{ animationDelay: "140ms" }}
              >
                Make a small website for the person you love. Your photos, a proper letter, and
                everything you've been meaning to say — on one quiet page, behind one link.
              </p>

              <div
                className="animate-rise mt-9 flex flex-wrap items-center gap-3"
                style={{ animationDelay: "220ms" }}
              >
                <Link href="/create" className="btn btn-primary">
                  Make your page <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/example" className="btn btn-ghost">
                  See an example
                </Link>
              </div>

              <div
                className="animate-rise mt-9 flex flex-wrap gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.18em] text-ink-soft"
                style={{ animationDelay: "300ms" }}
              >
                <span>free</span>
                <span className="text-line">·</span>
                <span>no account</span>
                <span className="text-line">·</span>
                <span>two minutes</span>
              </div>
            </div>

            <HeroCollage />
          </div>
        </section>

        {/* ── occasions ────────────────────────────────────────── */}
        <section className="border-y border-line bg-paper-2/40">
          <div className="mx-auto max-w-6xl px-5 py-7">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              <p className="eyebrow shrink-0">for the moments that matter</p>
              <div className="no-scrollbar -mx-5 flex w-full gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:w-auto sm:flex-wrap sm:justify-end sm:overflow-visible sm:px-0 sm:pb-0">
                {OCCASIONS.map((occasion) => (
                  <Link
                    key={occasion.id}
                    href="/create"
                    className="chip shrink-0 whitespace-nowrap !px-3.5 !py-1.5 !text-[12px]"
                  >
                    {occasion.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── quote ────────────────────────────────────────────── */}
        <section className="mx-auto max-w-3xl px-6 py-20 text-center sm:py-28">
          <Sparkle className="mx-auto h-6 w-6 text-accent" />
          <p className="mt-8 font-display text-[clamp(1.5rem,3.6vw,2.2rem)] leading-[1.35] tracking-[-0.01em]">
            For the apology you keep drafting and deleting. For the anniversary you almost forgot.
            For the Tuesday that needs{" "}
            <em className="italic text-accent">no reason at all.</em>
          </p>
        </section>

        {/* ── how it works ─────────────────────────────────────── */}
        <section id="how" className="scroll-mt-24 border-t border-line bg-paper-2/30">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
            <div className="max-w-xl">
              <p className="eyebrow">how it works</p>
              <h2 className="mt-4 font-display text-[clamp(1.9rem,4.4vw,2.8rem)] leading-[1.1] tracking-[-0.02em]">
                Three steps, then one link.
              </h2>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                {
                  n: "01",
                  icon: <Calendar className="h-5 w-5" />,
                  title: "Pick the occasion",
                  body: "An apology, a birthday, an anniversary, or nothing at all. Each one starts you off with the right words — you just make them yours.",
                },
                {
                  n: "02",
                  icon: <ImageIcon className="h-5 w-5" />,
                  title: "Write it, add the photos",
                  body: "A letter in paragraphs, a handful of photos with captions, a date that matters, your song. Watch it come together as you type.",
                },
                {
                  n: "03",
                  icon: <Envelope className="h-5 w-5" />,
                  title: "Publish and send",
                  body: "One click gives you a link. They open it, tap the envelope, and read. No sign-ups, no apps, nothing to install.",
                },
              ].map((step) => (
                <div key={step.n} className="card p-6 sm:p-7">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
                      {step.icon}
                    </span>
                    <span className="font-display text-sm text-ink-soft/60">{step.n}</span>
                  </div>
                  <h3 className="mt-5 font-display text-xl">{step.title}</h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── themes ───────────────────────────────────────────── */}
        <section id="looks" className="scroll-mt-24">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:py-24">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div className="max-w-lg">
                <p className="eyebrow">the look</p>
                <h2 className="mt-4 font-display text-[clamp(1.9rem,4.4vw,2.8rem)] leading-[1.1] tracking-[-0.02em]">
                  Four moods. <span className="italic">Yours to pick.</span>
                </h2>
              </div>
              <p className="max-w-xs text-[13.5px] leading-relaxed text-ink-soft">
                Every page is set in real type, on warm paper, with room to breathe. No templates
                that look like everyone else's.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {THEMES.map((theme) => (
                <div
                  key={theme.id}
                  data-theme={theme.id}
                  className="grain overflow-hidden rounded-2xl border border-line bg-paper p-5 text-ink transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between">
                    <Heart className="h-4 w-4 text-accent" />
                    <span className="eyebrow !text-[9px]">{theme.name}</span>
                  </div>
                  <p className="mt-8 font-display text-[1.35rem] leading-[1.15] tracking-tight">
                    I'm sorry,
                    <br />
                    <span className="italic">properly this time.</span>
                  </p>
                  <p className="mt-3 text-[11.5px] leading-relaxed text-ink-soft">
                    A letter, some photos, and everything I should have said last week.
                  </p>
                  <div className="mt-6 flex items-center justify-between border-t border-line pt-3">
                    <span className="hand text-lg text-accent">always, R.</span>
                    <span className="flex h-1.5 w-1.5 rounded-full bg-accent" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── little details ───────────────────────────────────── */}
        <section className="border-y border-line bg-paper-2/30">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 py-16 sm:grid-cols-3 sm:py-20">
            {[
              {
                icon: <Lock className="h-5 w-5" />,
                title: "Private by default",
                body: "Drafts stay hidden. Published pages are only visible to people with the link, and only you hold the edit key.",
              },
              {
                icon: <Flower className="h-5 w-5" />,
                title: "Made to be kept",
                body: "No feed, no likes, no algorithm. A page that stays exactly where you left it, for as long as you want it.",
              },
              {
                icon: <Heart className="h-5 w-5" />,
                title: "Yours, not ours",
                body: "Write in your own voice. The templates only help you start — every word on the page is yours.",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <span className="mt-0.5 text-accent">{item.icon}</span>
                <div>
                  <h3 className="text-sm font-semibold">{item.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── final cta ────────────────────────────────────────── */}
        <section className="mx-auto max-w-3xl px-5 py-24 text-center sm:py-32">
          <p className="eyebrow">start with their name</p>
          <h2 className="mt-5 font-display text-[clamp(2.2rem,5.6vw,3.6rem)] leading-[1.05] tracking-[-0.025em]">
            Someone is going to read this
            <span className="block italic text-accent">more than once.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-ink-soft">
            It takes about two minutes. It will probably take them a lot longer than that.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/create" className="btn btn-primary">
              Make your page <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/example" className="btn btn-ghost">
              Read the example
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-10 text-xs text-ink-soft sm:flex-row">
          <div className="flex items-center gap-2">
            <Heart className="h-3.5 w-3.5 text-accent" />
            <span className="font-display text-sm text-ink">lovenote</span>
            <span className="text-line">·</span>
            <span>made with love, for love</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/create" className="transition-colors hover:text-ink">
              Make a page
            </Link>
            <Link href="/example" className="transition-colors hover:text-ink">
              Example
            </Link>
            <Link href="/dashboard" className="transition-colors hover:text-ink">
              Your pages
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HeroCollage() {
  return (
    <div className="relative mx-auto h-[24rem] w-full max-w-[26rem] sm:h-[27rem]">
      <div className="absolute inset-8 rounded-full bg-accent-soft opacity-70 blur-3xl" />

      {/* polaroid behind */}
      <div className="absolute left-0 top-16 w-[11.5rem] -rotate-[7deg] rounded-[3px] bg-white p-2.5 pb-8 shadow-[0_25px_50px_-20px_rgba(30,10,14,0.45)] sm:w-56 sm:pb-9">
        <div
          className="relative aspect-[4/5] overflow-hidden rounded-[2px]"
          style={{
            background:
              "radial-gradient(130% 110% at 25% 15%, #FFE0C9 0%, #F2AE9B 32%, #D07E7E 58%, #8E5468 82%, #5C3B50 100%)",
          }}
        >
          <div className="absolute -left-6 top-1/3 h-24 w-24 rounded-full bg-white/25 blur-2xl" />
          <div className="absolute right-2 top-8 h-14 w-14 rounded-full bg-[#FFD9A8]/70 blur-xl" />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#3A2437]/50 to-transparent" />
          <Heart className="absolute bottom-4 left-1/2 h-5 w-5 -translate-x-1/2 text-white/80" />
        </div>
        <p className="hand mt-2 text-center text-lg leading-none text-[#3b2b2e]">us, last summer</p>
      </div>

      {/* letter in front */}
      <div className="absolute right-1 top-0 w-[15rem] rotate-[2.5deg] rounded-2xl border border-line bg-card p-5 shadow-[0_30px_60px_-25px_rgba(30,10,14,0.45)] sm:right-0 sm:w-[19rem] sm:p-7">
        <div className="flex items-center justify-between">
          <Heart className="h-4 w-4 text-accent" />
          <span className="text-[9px] uppercase tracking-[0.25em] text-ink-soft">an apology</span>
        </div>
        <p className="mt-5 font-display text-[1.25rem] leading-tight">For you, Ananya</p>
        <p className="mt-3 text-[12.5px] leading-relaxed text-ink-soft">
          I know last week was hard, and I know some of that was me. I made this instead of saying
          nothing.
        </p>
        <p className="hand mt-4 text-2xl leading-none text-accent">I'm sorry.</p>
        <div className="mt-6 flex items-center justify-between border-t border-line pt-3">
          <span className="text-[9px] uppercase tracking-[0.2em] text-ink-soft">tap to open</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-line">
            <ArrowRight className="h-3 w-3 text-ink-soft" />
          </span>
        </div>
      </div>

      {/* seal */}
      <div className="absolute bottom-6 right-10 flex h-16 w-16 rotate-[8deg] items-center justify-center rounded-full bg-accent shadow-[0_14px_30px_-12px_rgba(188,80,100,0.8)]">
        <Heart className="h-6 w-6 text-white" />
      </div>
    </div>
  );
}
