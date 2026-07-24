// robots.txt and sitemap.xml need the site's absolute origin, which isn't known
// at build time (no domain is committed, and previews get their own host), so
// they're derived from the incoming request instead of hardcoded.

const ROUTES: Array<{ path: string; changefreq: string; priority: string }> = [
  { path: "/", changefreq: "monthly", priority: "1.0" },
  { path: "/learn", changefreq: "monthly", priority: "0.9" },
  { path: "/foods", changefreq: "yearly", priority: "0.8" },
  { path: "/ask", changefreq: "monthly", priority: "0.8" },
  { path: "/about", changefreq: "yearly", priority: "0.5" },
  { path: "/contact", changefreq: "yearly", priority: "0.3" },
  { path: "/privacy", changefreq: "yearly", priority: "0.2" },
  { path: "/terms", changefreq: "yearly", priority: "0.2" },
];

function originOf(request: Request): string {
  const url = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") ?? url.host;
  const proto = request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  return `${proto}://${host}`;
}

// Preview and branch deployments shouldn't compete with production in search.
function isIndexable(origin: string): boolean {
  return !/\.vercel\.app$/.test(new URL(origin).hostname);
}

function robotsTxt(origin: string): string {
  if (!isIndexable(origin)) {
    return "User-agent: *\nDisallow: /\n";
  }
  return `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`;
}

function sitemapXml(origin: string): string {
  const urls = ROUTES.map(
    (r) =>
      `  <url><loc>${origin}${r.path}</loc><changefreq>${r.changefreq}</changefreq>` +
      `<priority>${r.priority}</priority></url>`,
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function handleSiteFile(request: Request): Response | undefined {
  const { pathname } = new URL(request.url);
  if (pathname !== "/robots.txt" && pathname !== "/sitemap.xml") return undefined;

  const origin = originOf(request);
  const isRobots = pathname === "/robots.txt";

  return new Response(isRobots ? robotsTxt(origin) : sitemapXml(origin), {
    headers: {
      "content-type": isRobots ? "text/plain; charset=utf-8" : "application/xml; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}
