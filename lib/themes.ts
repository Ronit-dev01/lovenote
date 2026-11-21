import type { ThemeId } from "./types";

export type Theme = {
  id: ThemeId;
  name: string;
  note: string;
  /** page background / ink / accent, used for swatches and previews */
  swatch: [string, string, string];
};

export const THEMES: Theme[] = [
  {
    id: "blush",
    name: "Blush",
    note: "warm paper, rose ink",
    swatch: ["#FFF8F3", "#2B1B1E", "#C2586B"],
  },
  {
    id: "midnight",
    name: "Midnight",
    note: "dark room, candlelight",
    swatch: ["#101425", "#F3EDE2", "#E2B872"],
  },
  {
    id: "sage",
    name: "Garden",
    note: "morning light, green stems",
    swatch: ["#F7F5EC", "#26332B", "#6F9375"],
  },
  {
    id: "ink",
    name: "Ink & bone",
    note: "quiet, classic, timeless",
    swatch: ["#FAF7F1", "#1B1815", "#9A6A3C"],
  },
];

export const DEFAULT_THEME: ThemeId = "blush";

export function getTheme(id: string | undefined): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
