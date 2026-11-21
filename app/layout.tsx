import type { Metadata, Viewport } from "next";
import { Caveat, Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-caveat",
  display: "swap",
});

const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: {
    default: "lovenote — a little website for someone you love",
    template: "%s · lovenote",
  },
  description:
    "Make a beautiful page for the person you love. Add your photos, write the letter, publish it, and send one link. For apologies, anniversaries, birthdays, or no reason at all.",
  openGraph: {
    title: "lovenote — a little website for someone you love",
    description:
      "A letter, your photos, and everything you've been meaning to say. One link, sent at the right moment.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#fff9f4",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${caveat.variable}`}>
      <body>{children}</body>
    </html>
  );
}
