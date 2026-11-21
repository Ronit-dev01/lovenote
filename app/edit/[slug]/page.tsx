import type { Metadata } from "next";
import EditLoader from "@/components/EditLoader";

export const metadata: Metadata = {
  title: "Edit your page",
  robots: { index: false, follow: false },
};

export default async function EditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <EditLoader slug={slug} />;
}
