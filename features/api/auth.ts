import { env } from "~/env";

function getSiteOrigin() {
  return new URL(env.NEXT_PUBLIC_URL).origin;
}

function getStudioBasePath() {
  const raw = env.NEXT_PUBLIC_SANITY_STUDIO_BASE_PATH.trim();
  const withLeading = raw.startsWith("/") ? raw : `/${raw}`;
  return withLeading.replace(/\/$/, "");
}

export function isApiAuthorized(request: Request) {
  const referer = request.headers.get("referer");
  const origin = request.headers.get("origin");
  const siteOrigin = getSiteOrigin();
  const studioBasePath = getStudioBasePath();

  if (referer) {
    try {
      const refererUrl = new URL(referer);

      if (refererUrl.origin === siteOrigin && refererUrl.pathname.startsWith(studioBasePath)) {
        return true;
      }
    } catch {
      // Ignore malformed referer.
    }
  }

  if (!origin) {
    return true;
  }

  if (origin === siteOrigin) {
    return true;
  }

  return false;
}

export function unauthorizedResponse() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
