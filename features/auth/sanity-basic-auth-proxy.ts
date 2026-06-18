/**
 * Sanity query for HTTP Basic Auth toggles (Next.js `proxy.ts`).
 * Credentials come from BASIC_AUTH_USERNAME / BASIC_AUTH_PASSWORD (see `~/env`).
 * Does not import `~/features/sanity/client` (server-only).
 *
 * **Strategy**: cache forever, invalidate via webhook.
 *
 * - Next.js data cache: `revalidate: false` keeps the response indefinitely, shared
 *   across all Vercel function instances. The fetch is tagged with every Sanity
 *   document type that contributes to the auth state, so the existing webhook (which
 *   calls `revalidateTag(_type)` on every change) automatically busts this cache when
 *   any relevant document changes — no special-case logic needed in the webhook.
 * - Per-instance hot cache: skips the data-cache deserialize cost on every request
 *   within a single function instance. Cleared when the instance recycles.
 * - In-flight dedupe: if many requests land at once on a cold instance, they await
 *   the same single in-flight fetch instead of each starting their own query.
 *
 * **Invalidation**: relies on the existing `/api/revalidate` webhook firing on every
 * document change. If the webhook is misconfigured, the cache lives forever — verify
 * it's healthy before deploying.
 */

import { run } from "~/features/utils/common";
import { SANITY_BASIC_AUTH_STATE_SOURCE_TYPES, SANITY_SINGLETON_SITE_ID } from "~/sanity/constants";

type BasicAuthPayload = {
  basicAuth: {
    siteWideEnabled?: boolean | null;
  } | null;
  protectedPaths: string[] | null;
};

export const SANITY_BASIC_AUTH_STATE_TAG = "sanity-basic-auth-state";

/** GROQ for auth state; fetch tags include `SANITY_BASIC_AUTH_STATE_SOURCE_TYPES` (`~/sanity/constants`). */
const SANITY_BASIC_AUTH_STATE_QUERY = `{
  "basicAuth": *[_type == "${SANITY_SINGLETON_SITE_ID}"][0].basicAuth{
    siteWideEnabled
  },
  "protectedPaths": *[passwordProtected == true && defined(uri.current)].uri.current
}`;

/**
 * Per-instance hot cache TTL. Caps how long a stale read can survive within one
 * instance after a webhook invalidation (since `revalidateTag` only busts the Next.js
 * data cache, not in-memory state). 5 minutes is a sensible safety net — long enough
 * to skip pointless data-cache reads on hot paths, short enough that webhook-busted
 * entries don't linger across the entire instance lifetime.
 */
const HOT_CACHE_TTL_MS = 5 * 60 * 1000;

let hot: { value: BasicAuthPayload; expiresAt: number } | null = null;
let inflight: Promise<BasicAuthPayload> | null = null;

async function sanityFetchJson<T>(query: string): Promise<T> {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION;
  const token = process.env.SANITY_API_VIEW_TOKEN;

  if (!projectId || !dataset || !apiVersion || !token) {
    throw new Error("Missing Sanity environment for proxy");
  }

  // Sanity CDN endpoint: edge-cached, faster than the regular API endpoint.
  const url = new URL(`https://${projectId}.apicdn.sanity.io/v${apiVersion}/data/query/${dataset}`);
  url.searchParams.set("query", query);

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    next: {
      // Cache forever; the webhook is the only invalidation path.
      revalidate: false,
      tags: [SANITY_BASIC_AUTH_STATE_TAG, ...SANITY_BASIC_AUTH_STATE_SOURCE_TYPES],
    },
  });

  if (!res.ok) {
    throw new Error(`Sanity proxy fetch failed: ${res.status}`);
  }

  const body = (await res.json()) as { result: T };
  return body.result;
}

export async function getSanityBasicAuthState(): Promise<BasicAuthPayload> {
  const now = Date.now();

  if (hot && hot.expiresAt > now) {
    return hot.value;
  }

  if (inflight) {
    return inflight;
  }

  inflight = run(async () => {
    try {
      const value = await sanityFetchJson<BasicAuthPayload>(SANITY_BASIC_AUTH_STATE_QUERY);

      hot = { value, expiresAt: Date.now() + HOT_CACHE_TTL_MS };

      return value;
    } finally {
      inflight = null;
    }
  });

  return inflight;
}
