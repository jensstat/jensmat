import { timingSafeEqual } from "node:crypto";

// The lock until the real login (5b): the caller must send
//   Authorization: Bearer <POST_SECRET>
// No POST_SECRET set at all? Then nobody gets in ("fail closed").
export function isAllowed(request: Request): boolean {
  const secret = process.env.POST_SECRET;
  if (!secret) return false;

  const sent = request.headers.get("authorization") ?? "";
  return sameText(sent, `Bearer ${secret}`);
}

// Compares in the same time whether the first or the last letter is wrong,
// so no one can guess the password letter by letter by timing the answers
function sameText(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB);
}
