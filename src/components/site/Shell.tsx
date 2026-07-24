import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { to: "/learn", label: "Learn" },
  { to: "/foods", label: "Foods" },
  { to: "/ask", label: "Ask" },
  { to: "/about", label: "About" },
] as const;

export function SiteShell({ children }: { children: ReactNode }) {
  const links = NAV_LINKS;
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink">
      <header className="sticky top-0 z-30 h-16 border-b border-hairline bg-bg">
        <div className="mx-auto flex h-full max-w-[1200px] items-center gap-6 px-4 sm:px-6">
          <Link to="/" className="font-display text-xl font-bold tracking-tight">
            Lishe
          </Link>
          <nav className="hidden flex-1 items-center justify-center gap-8 md:flex">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm text-ink transition-colors hover:text-leaf"
                activeProps={{ className: "text-leaf font-semibold" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto hidden items-center gap-3 md:flex">
            <Link
              to="/ask"
              className="rounded bg-leaf px-4 py-2 text-sm font-semibold text-surface transition-colors hover:bg-ink"
            >
              Ask the helper
            </Link>
          </div>
          <button
            onClick={() => setOpen((v) => !v)}
            className="ml-auto rounded p-2 md:hidden"
            aria-label="Menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {open && (
          <div className="border-t border-hairline bg-bg md:hidden">
            <div className="mx-auto flex max-w-[1200px] flex-col px-4 py-3">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="border-b border-hairline py-3 text-sm"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                to="/ask"
                onClick={() => setOpen(false)}
                className="mt-3 rounded bg-leaf px-4 py-3 text-center text-sm font-semibold text-surface"
              >
                Ask the helper
              </Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-24 border-t border-hairline bg-bg">
        <div className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            <FooterCol
              title="Nutrition"
              items={[
                { to: "/learn", label: "Balanced diet" },
                { to: "/ask", label: "Ask the helper" },
                { to: "/foods", label: "Foods" },
              ]}
            />
            <FooterCol
              title="Company"
              items={[
                { to: "/about", label: "About" },
                { to: "/contact", label: "Contact" },
              ]}
            />
            <FooterCol
              title="Trust"
              items={[
                { to: "/privacy", label: "Privacy" },
                { to: "/terms", label: "Terms" },
              ]}
            />
          </div>
          <p className="mt-10 border-t border-hairline pt-6 text-xs text-muted">
            Nutrition data: Kenya Food Composition Tables 2018 (FAO / Government of Kenya).
            Guidance: WHO healthy diet · Kenya Ministry of Health food-based dietary guidelines.
            Lishe provides general nutrition information, not medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FooterCol({
  title,
  items,
}: {
  title: string;
  items: Array<{ to: string; label: string }>;
}) {
  return (
    <div>
      <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-ink">
        {title}
      </h4>
      <ul className="flex flex-col gap-2">
        {items.map((i) => (
          <li key={i.to}>
            <Link to={i.to} className="text-sm text-muted hover:text-ink">
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
