export type OccasionId =
  | "sorry"
  | "anniversary"
  | "birthday"
  | "just-because"
  | "miss-you"
  | "thank-you"
  | "long-distance"
  | "congrats";

export type ThemeId = "blush" | "midnight" | "sage" | "ink";

export type PageStatus = "draft" | "published";

export type Photo = {
  id: string;
  url: string;
  /** storage path, used when deleting the image */
  path?: string;
  caption: string;
};

export type PageFields = {
  occasion: OccasionId;
  theme: ThemeId;
  recipient: string;
  sender: string;
  title: string;
  subtitle: string;
  letterTitle: string;
  letterBody: string;
  signature: string;
  ps: string;
  songUrl: string;
  songLabel: string;
  specialDate: string;
  specialDateLabel: string;
  photos: Photo[];
};

export type PageRecord = PageFields & {
  id: string;
  slug: string;
  status: PageStatus;
  editKeyHash: string;
  views: number;
  createdAt: string;
  updatedAt: string;
};

/** Everything the browser is allowed to see. */
export type PublicPage = Omit<PageRecord, "editKeyHash">;

export type NewPage = PageFields & {
  id: string;
  slug: string;
  status: PageStatus;
};

export type Draft = PageFields & {
  id: string;
  slug: string;
  status: PageStatus;
};
