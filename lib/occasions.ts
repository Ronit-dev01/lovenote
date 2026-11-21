import type { OccasionId } from "./types";

export type Occasion = {
  id: OccasionId;
  label: string;
  eyebrow: string;
  /** suggestion for the big headline */
  title: (name: string) => string;
  /** suggestion for the first line of the letter */
  opening: (name: string) => string;
};

export const OCCASIONS: Occasion[] = [
  {
    id: "sorry",
    label: "I'm sorry",
    eyebrow: "an apology",
    title: (name) => (name ? `I'm sorry, ${name}` : "I'm sorry"),
    opening: () =>
      "I've started this a hundred times in my head. I'd rather say it properly, so here it is.",
  },
  {
    id: "anniversary",
    label: "Anniversary",
    eyebrow: "happy anniversary",
    title: (name) => (name ? `One more year with you, ${name}` : "One more year with you"),
    opening: () =>
      "Another year of you. I wanted to put a few of my favourite moments somewhere they'd last.",
  },
  {
    id: "birthday",
    label: "Birthday",
    eyebrow: "happy birthday",
    title: (name) => (name ? `Happy birthday, ${name}` : "Happy birthday"),
    opening: () =>
      "Today is about you, which is my favourite kind of day. Here's a small something, made slowly.",
  },
  {
    id: "just-because",
    label: "Just because",
    eyebrow: "no reason at all",
    title: (name) => (name ? `For you, ${name}` : "For you"),
    opening: () =>
      "There's no occasion. I just wanted you to have something that says: I noticed. I remember. I'm glad it's you.",
  },
  {
    id: "miss-you",
    label: "Missing you",
    eyebrow: "wish you were here",
    title: (name) => (name ? `Missing you, ${name}` : "Missing you"),
    opening: () =>
      "The distance is doing its thing again. So I'm sending you this instead of staring at the ceiling.",
  },
  {
    id: "thank-you",
    label: "Thank you",
    eyebrow: "a thank you",
    title: (name) => (name ? `Thank you, ${name}` : "Thank you"),
    opening: () =>
      "You probably don't know how much you did. I do. I didn't want to leave it unsaid.",
  },
  {
    id: "long-distance",
    label: "Far away",
    eyebrow: "from far away",
    title: (name) => (name ? `From here to you, ${name}` : "From here to you"),
    opening: () =>
      "Different time zones, same thought at the end of every day. This is what I'd say if you were on the other side of the couch.",
  },
  {
    id: "congrats",
    label: "Proud of you",
    eyebrow: "so proud of you",
    title: (name) => (name ? `Look at you, ${name}` : "Look at you"),
    opening: () =>
      "You did the thing. I watched you do it, quietly, on the hard days too. I hope you're proud of yourself.",
  },
];

export function getOccasion(id: string | undefined): Occasion {
  return OCCASIONS.find((o) => o.id === id) ?? OCCASIONS[3];
}
