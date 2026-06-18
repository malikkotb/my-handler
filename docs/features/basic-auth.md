# Basic Authentication

HTTP Basic Auth uses **one username and password from the deployment environment** (`BASIC_AUTH_USERNAME`, `BASIC_AUTH_PASSWORD` in `~/env`). Sanity only stores **toggles**:

1. **Site → Security** — **Protect entire site** gates every public page (except Studio, APIs, and static assets).
2. **Per page or article** — When the site is **not** fully protected, **Password protect** on that document gates its URL only. The same env credentials apply to site-wide and per-URL protection.

## How it works

1. Set `BASIC_AUTH_USERNAME` and `BASIC_AUTH_PASSWORD` in your deployment environment (and locally in `.env` when testing).
2. **Site-wide:** **Site** → **Security** → **HTTP Basic Auth** → enable **Protect entire site**.
3. **Per URL:** Leave **Protect entire site** off. On a **Page** or **Article**, turn on **Password protect**.
4. At runtime, `proxy.ts` reads the **published** toggles via `getSanityBasicAuthState()` (see **Proxy runs often; Sanity calls do not** below). If you use **draft** content, publish first — unpublished changes are not visible to the proxy.

If Basic Auth is enabled in the CMS but env credentials are missing, the proxy responds with **503** and a short message so you can fix deployment config.

Draft Mode (preview) bypasses Basic Auth so editors can use **Draft Mode** / Visual Editing without entering credentials on every request.

## Proxy runs often; Sanity calls do not

In Next.js, **`proxy.ts` runs once per incoming request** that matches the [`matcher`](https://nextjs.org/docs/app/api-reference/file-conventions/proxy#matcher) (minus paths we skip in code: Studio, `/api/*`, `/_next/*`, favicon, RSC prefetches, etc.). That is expected: each run is cheap (pathname checks and auth logic).

The proxy uses several layers of optimization to avoid hitting Sanity on most requests:

1. **Authenticated requests skip Sanity entirely.** Once a user passes the 401 challenge, the browser sends the `Authorization` header on every subsequent request. The proxy validates that header against env credentials first; if it matches, the request passes through without ever reading Sanity.
2. **Per-instance hot cache (5 minutes).** Skips the Next.js data-cache deserialize cost on hot paths within a single Vercel function instance.
3. **Next.js data cache (indefinite).** The auth-state fetch uses `revalidate: false` and is shared across instances; the **webhook** is the invalidation path (not a TTL).
4. **In-flight deduplication.** If many requests land at once on a cold instance, they await a single shared fetch instead of each issuing their own query.
5. **Tag-based invalidation.** The `/api/revalidate` webhook busts the auth state cache when `site`, `page`, or `article` documents change (`SANITY_BASIC_AUTH_STATE_SOURCE_TYPES` in `sanity/constants.ts`), so toggle changes propagate within seconds.

## Static Generation (ISR) and Proxy

Proxy runs before a response is returned. It does **not** set `dynamic = "force-dynamic"` on your routes and does **not** opt out of **ISR** or `generateStaticParams`. Pages remain statically generated; `proxy.ts` only adds an authentication gate for matching requests. (In Next.js 16, Proxy uses the **Node.js** runtime by default.)

## Excluded From Basic Auth

- Sanity Studio at the public path from `NEXT_PUBLIC_SANITY_STUDIO_BASE_PATH` (see [Studio public URL and rewrites](../sanity/studio-and-structure.md#public-url-rewrites-and-reserved-paths))
- API routes under `/api/*` (for example `/api/revalidate` and `/api/draft-mode/*`)
- Next.js internals under `/_next/*` (including `/_next/data`)
- Static assets (paths that look like files with extensions)
- Requests that include the Draft Mode `__prerender_bypass` cookie
- RSC prefetches and Next.js router prefetches (these are follow-ups to a page request that already passed auth)

## Sitemap

URLs with **Password protect** (HTTP Basic Auth) on **page** / **article** entries are **omitted** from the generated sitemap (alongside `noIndex`) via the GROQ filter in `app/sitemap.ts` (`passwordProtected != true`). Site-wide Basic Auth does not by itself remove URLs from the sitemap; use `noIndex` or per-entry flags as needed for SEO.

## Implementation reference

| Concern | Location |
| --- | --- |
| Next.js Proxy | [`proxy.ts`](../../proxy.ts) — `matcher` (with prefetch/RSC skip), Studio/API/static exclusions, Draft Mode bypass (`__prerender_bypass`), early exit on valid `Authorization` header, calls `getSanityBasicAuthState()` |
| Sanity toggles + cache | [`features/auth/sanity-basic-auth-proxy.ts`](../../features/auth/sanity-basic-auth-proxy.ts) — direct GROQ HTTP request to Sanity CDN (`apicdn.sanity.io`), uses `SANITY_API_VIEW_TOKEN`, hot cache + Next data cache, tagged for webhook invalidation |
| Webhook invalidation | [`app/api/revalidate/route.ts`](../../app/api/revalidate/route.ts) — `revalidateTag(_type)`; auth cache listens on tags from `SANITY_BASIC_AUTH_STATE_SOURCE_TYPES` |
| Environment | [`env.ts`](../../env.ts) — `BASIC_AUTH_USERNAME`, `BASIC_AUTH_PASSWORD` |
| CMS fields | **Site** → `basicAuth.siteWideEnabled`; **Page** / **Article** → `passwordProtected` + `uri` |

### GROQ query used by the proxy

Published documents only (drafts are not visible to this request):

```groq
{
  "basicAuth": *[_type == "site"][0].basicAuth{
    siteWideEnabled
  },
  "protectedPaths": *[passwordProtected == true && defined(uri.current)].uri.current
}
```

(`_type == "site"` matches `SANITY_SINGLETON_SITE_ID` in code.)

## Related repositories

The **blink** and **WASL** starters and **Aspen Search** mirror this stack: root `proxy.ts`, `features/auth/sanity-basic-auth-proxy.ts`, the same env variables, and the same Site / per-entry CMS toggles. Repos without **`article`** documents use a shorter `SANITY_BASIC_AUTH_STATE_SOURCE_TYPES` (site + page only). When you change Basic Auth behavior in one repository, align the others so staging and per-URL gates stay consistent.

## Where this is documented in the repo

- Root **[`README.md`](../../README.md)** — listed under **Features**, optional env subsection, and **Docs**
- **[`docs/README.md`](../README.md)** — **Security and access**, Common tasks, Feature docs
- **[`AGENTS.md`](../../AGENTS.md)** — **Project structure** (`proxy.ts`, `features/auth/sanity-basic-auth-proxy.ts`)
- **[`features/auth/sanity-basic-auth-proxy.ts`](../../features/auth/sanity-basic-auth-proxy.ts)** — GROQ fetch, hot + data cache, in-flight dedupe, tagged invalidation
- **[`docs/sanity/schema-and-content-model.md`](../sanity/schema-and-content-model.md)** — `site.basicAuth`, `passwordProtected` on routable documents
- **[`docs/sanity/project-setup.md`](../sanity/project-setup.md)** — wizard does not set `BASIC_AUTH_*` (add manually if needed)
