import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

// og:image has to be an absolute URL for crawlers to resolve it, but no domain
// is committed and every preview gets its own host, so the origin is read from
// the request during SSR (same reasoning as lib/site-files.ts).
export const siteOrigin = createIsomorphicFn()
  .server(() => {
    const request = getRequest();
    const url = new URL(request.url);
    const host = request.headers.get("x-forwarded-host") ?? url.host;
    const proto = request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
    return `${proto}://${host}`;
  })
  .client(() => window.location.origin);
