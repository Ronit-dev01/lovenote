import type { Metadata } from "next";
import Link from "next/link";
import PageView from "@/components/PageView";
import type { PageFields } from "@/lib/types";
import { ArrowRight } from "@/components/icons";

export const metadata: Metadata = {
  title: "I'm sorry, Ananya — an example",
  description: "A sample lovenote page: an apology, a letter, and a few photos.",
  robots: { index: false, follow: false },
};

const sample: PageFields = {
  occasion: "sorry",
  theme: "blush",
  recipient: "Ananya",
  sender: "Rohan",
  title: "I'm sorry, Ananya",
  subtitle: "For the hundred small things I should have said out loud.",
  letterTitle: "I've been thinking about last Tuesday",
  letterBody: `I've started this about forty times in my head, and every version sounded smaller than what I actually mean. So I'm writing it down properly, where I can't rush it or take it back.

You were right. I was quiet when I should have been honest, and then I was sharp when you were only asking me to talk to you. I know that silence doesn't feel like space to you. It feels like a door closing.

What I should have said is: I was scared I'd disappoint you, so I said nothing and disappointed you anyway. That's on me, not on you.

So here it is, plainly. I'm sorry. I'm going to do better at saying the hard thing early, instead of letting it sit between us until it gets heavy. And I'd like to start by asking how Tuesday felt from your side — I want to know, even the parts that are hard to hear.`,
  signature: "always yours, Rohan",
  ps: "I still have your blue umbrella. I think I was waiting for a reason to bring it back.",
  songUrl: "https://open.spotify.com",
  songLabel: "the song from that night",
  specialDate: "2022-03-12",
  specialDateLabel: "together since",
  photos: [
    {
      id: "sample-1",
      url: "/demo/sunset.svg",
      caption: "the first weekend",
    },
    {
      id: "sample-2",
      url: "/demo/flowers.svg",
      caption: "the flowers you kept alive",
    },
    {
      id: "sample-3",
      url: "/demo/coffee.svg",
      caption: "two coffees, one long conversation",
    },
  ],
};

export default function ExamplePage() {
  return (
    <>
      <PageView page={sample} cta={false} />
      <Link
        href="/create"
        className="btn btn-primary fixed bottom-5 left-1/2 z-[55] -translate-x-1/2 shadow-2xl sm:bottom-6 sm:left-6 sm:translate-x-0 sm:btn-sm"
      >
        This is a sample — make yours <ArrowRight className="h-4 w-4" />
      </Link>
    </>
  );
}
