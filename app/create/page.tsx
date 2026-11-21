import type { Metadata } from "next";
import Editor from "@/components/Editor";

export const metadata: Metadata = {
  title: "Make a page",
  description: "Write the letter, add the photos, pick a mood. Then send one link.",
};

export default function CreatePage() {
  const live =
    Boolean(process.env.SUPABASE_URL) &&
    Boolean(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);

  return <Editor kind="create" storeMode={live ? "supabase" : "local"} />;
}
