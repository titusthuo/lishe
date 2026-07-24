import {
  Outlet,
  Link,
  createRootRoute,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { type ReactNode } from "react";

import appCss from "../styles.css?url";
import { SiteShell } from "../components/site/Shell";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <p className="num font-display text-7xl font-extrabold text-leaf">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold">Page not found</h1>
        <p className="mt-2 text-sm text-muted">
          That page doesn't exist or has moved. Try the nutrition basics, or ask the helper a
          question.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/learn"
            className="rounded bg-leaf px-5 py-2.5 text-sm font-semibold text-surface transition-colors hover:bg-ink"
          >
            Learn the basics
          </Link>
          <Link
            to="/"
            className="rounded border border-hairline bg-surface px-5 py-2.5 text-sm font-semibold transition-colors hover:border-ink"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl font-bold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted">
          Something went wrong on our end. You can try again or head back home.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded bg-leaf px-5 py-2.5 text-sm font-semibold text-surface transition-colors hover:bg-ink"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded border border-hairline bg-surface px-5 py-2.5 text-sm font-semibold transition-colors hover:border-ink"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lishe — Eat a balanced diet on a Kenyan budget" },
      {
        name: "description",
        content:
          "Learn what a balanced plate looks like with local Kenyan foods, look up nutrients from the Kenya Food Composition Tables 2018, and ask a nutrition helper your questions.",
      },
      { property: "og:title", content: "Lishe — Eat a balanced diet on a Kenyan budget" },
      {
        property: "og:description",
        content:
          "Nutrition education and a friendly helper, built around the food Kenyans actually eat. General nutrition information, not medical advice.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Lishe" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <SiteShell>
      <Outlet />
    </SiteShell>
  );
}
