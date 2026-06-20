import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { env } from "~/env";
import { getSanityBasicAuthState } from "~/features/auth/sanity-basic-auth-proxy";
import { routing } from "~/i18n/routing";
import { SANITY_STUDIO_APP_BASE_PATH } from "~/sanity/constants";

const intlMiddleware = createIntlMiddleware(routing);

function normalizePathname(pathname: string): string {
  if (pathname === "/") {
    return "/";
  }

  return pathname.replace(/\/$/, "");
}

function decodeBasicAuthHeader(header: string | null): { username: string; password: string } | null {
  if (!header?.startsWith("Basic ")) {
    return null;
  }

  const b64 = header.slice(6).trim();

  try {
    const decoded = atob(b64);
    const colon = decoded.indexOf(":");

    if (colon === -1) {
      return null;
    }

    return {
      username: decoded.slice(0, colon),
      password: decoded.slice(colon + 1),
    };
  } catch {
    return null;
  }
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let out = 0;

  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return out === 0;
}

function unauthorizedResponse(): NextResponse {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Protected"',
    },
  });
}

function normalizePublicSanityStudioBasePath(): string {
  const t = env.NEXT_PUBLIC_SANITY_STUDIO_BASE_PATH.replace(/\/$/, "");
  return t || "/";
}

function isPublicStudioPath(pathname: string): boolean {
  const base = normalizePublicSanityStudioBasePath();
  return pathname === base || pathname.startsWith(`${base}/`);
}

function isSanityStudioAppPath(pathname: string): boolean {
  return pathname === SANITY_STUDIO_APP_BASE_PATH || pathname.startsWith(`${SANITY_STUDIO_APP_BASE_PATH}/`);
}

function isExcludedPath(pathname: string): boolean {
  if (isPublicStudioPath(pathname)) {
    return true;
  }

  if (pathname.startsWith("/api/") || pathname.startsWith("/_next/") || pathname === "/favicon.ico") {
    return true;
  }

  return false;
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Sanity Studio app path → canonical public path redirect.
  if (isSanityStudioAppPath(pathname)) {
    const publicBase = normalizePublicSanityStudioBasePath();
    const suffix = pathname === SANITY_STUDIO_APP_BASE_PATH ? "" : pathname.slice(SANITY_STUDIO_APP_BASE_PATH.length);

    return NextResponse.redirect(new URL(`${publicBase}${suffix}`, request.url), 308);
  }

  if (isExcludedPath(pathname)) {
    return NextResponse.next();
  }

  // Draft Mode / Sanity preview: Next sets `__prerender_bypass` when draft mode is enabled — Basic Auth must not run.
  if (request.cookies.has("__prerender_bypass")) {
    return intlMiddleware(request);
  }

  // Early exit: if Basic Auth env vars aren't configured, no auth can run.
  // Skip the Sanity fetch entirely.
  const username = env.BASIC_AUTH_USERNAME?.trim() ?? "";
  const password = env.BASIC_AUTH_PASSWORD ?? "";
  const configured = username.length > 0 && password.length > 0;

  // Early exit: if the request already carries a valid Authorization header, the user
  // is authenticated. Browsers send this header on every request after the first 401,
  // so this covers ~all traffic from logged-in users — no need to hit Sanity.
  // Note: we still need to check Sanity if env vars are missing, to return the 503
  // explaining the misconfiguration; otherwise we'd silently let unauthenticated
  // requests through on protected sites.
  if (configured) {
    const creds = decodeBasicAuthHeader(request.headers.get("authorization"));
    const hasValidCreds = creds && timingSafeEqual(creds.username, username) && timingSafeEqual(creds.password, password);

    if (hasValidCreds) {
      return intlMiddleware(request);
    }
  }

  try {
    // Cached Sanity read (`getSanityBasicAuthState`: Next data cache + per-instance hot cache + dedupe).
    const { basicAuth, protectedPaths } = await getSanityBasicAuthState();
    const siteWideEnabled = basicAuth?.siteWideEnabled === true;
    const paths = protectedPaths ?? [];

    // Fast path: nothing protected at all → skip everything.
    if (!siteWideEnabled && paths.length === 0) {
      return intlMiddleware(request);
    }

    const normalizedPath = normalizePathname(pathname);
    const isEntryProtected = !siteWideEnabled && paths.some((p) => normalizePathname(p) === normalizedPath);
    const needsAuth = siteWideEnabled || isEntryProtected;

    if (!needsAuth) {
      return intlMiddleware(request);
    }

    if (!configured) {
      return new NextResponse(
        "Basic Auth is enabled in the CMS but BASIC_AUTH_USERNAME and BASIC_AUTH_PASSWORD are not set in the deployment environment.",
        { status: 503 }
      );
    }

    // Path requires auth and creds were either missing or invalid (we already validated above).
    return unauthorizedResponse();
  } catch (error) {
    console.error("proxy: Sanity basic auth fetch failed", error);

    return intlMiddleware(request);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - /api (API routes)
     * - /_next (Next.js internals, including data, static, image)
     * - Static files with extensions
     *
     * NOTE: must run on RSC/prefetch requests too — next-intl rewrites the locale on
     * EVERY navigation (including client-side RSC fetches). Excluding `rsc`/prefetch here
     * skips the locale rewrite during client navigation, which leaves the new route
     * unresolved and freezes the View Transition. Basic-auth early-exits keep this cheap.
     *
     * Public Studio path (`NEXT_PUBLIC_SANITY_STUDIO_BASE_PATH`) and `sanity-studio` app
     * path are handled inside `proxy()` (skip auth / canonical redirect) — the matcher is
     * not env-aware so the segment is not hardcoded here.
     */
    "/((?!api|_next/static|_next/image|_next/data|_next/webpack-hmr|favicon.ico|.*\\.).*)",
  ],
};
