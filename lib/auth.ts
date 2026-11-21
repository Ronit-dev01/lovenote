import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

export function newEditKey(): string {
  return randomBytes(18).toString("base64url");
}

export function hashEditKey(key: string): string {
  return createHash("sha256").update(key.trim()).digest("hex");
}

export function editKeyMatches(key: string | null | undefined, hash: string): boolean {
  if (!key) return false;
  const a = Buffer.from(hashEditKey(key));
  const b = Buffer.from(hash);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
