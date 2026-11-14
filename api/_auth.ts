import { timingSafeEqual } from "node:crypto";
import { createRemoteJWKSet, jwtVerify } from "jose";

// Google's public keys for Firebase logins. jose fetches them when needed and keeps them
const googleKeys = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
  ),
);

// The lock. The caller must send Authorization: Bearer <something>, where something is
// - your Firebase login (an ID token for ADMIN_UID), from the site, or
// - POST_SECRET, the key for scripts like npm run test:api.
// Nothing set up? Then nobody gets in ("fail closed").
export async function isAllowed(request: Request): Promise<boolean> {
  const sent = request.headers.get("authorization") ?? "";
  if (!sent.startsWith("Bearer ")) return false;
  const token = sent.slice("Bearer ".length);

  const secret = process.env.POST_SECRET;
  if (secret && sameText(token, secret)) return true;

  return isAdminLogin(token);
}

// Checks the stamp, that it's for our project, that it hasn't expired, and that it's you
async function isAdminLogin(token: string): Promise<boolean> {
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
  const adminUid = process.env.ADMIN_UID;
  if (!projectId || !adminUid) return false;

  try {
    const { payload } = await jwtVerify(token, googleKeys, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });
    return payload.sub === adminUid;
  } catch {
    return false; // a fake, a wrong project or an expired token: no entry
  }
}

// Compares in the same time whether the first or the last letter is wrong,
// so no one can guess the password letter by letter by timing the answers
function sameText(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB);
}
