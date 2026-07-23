import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/employers")({
  head: () => ({
    meta: [
      { title: "For employers & SACCOs — Lishe" },
      { name: "description", content: "Cut diet-related NCD costs with a workplace nutrition programme." },
      { property: "og:title", content: "For employers & SACCOs — Lishe" },
      { property: "og:description", content: "Team dashboards, canteen guidance, anonymous risk screening." },
    ],
  }),
  component: Employers,
});

function Employers() {
  const [sent, setSent] = useState(false);
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6">
      <h1 className="font-display text-5xl font-extrabold tracking-tight">Employers & SACCOs</h1>
      <p className="mt-4 max-w-[680px] text-lg text-muted">
        Diet-related NCDs — diabetes, hypertension, heart disease — are the top absenteeism drivers in Kenyan workplaces.
      </p>

      <div className="mt-16 grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="font-display text-2xl font-bold">What a workplace programme includes</h2>
          <ul className="mt-6 space-y-4 text-ink">
            {["Team dashboards showing aggregate nutrition trends (no personal data).", "Canteen guidance — menus scored on protein and fibre per shilling.", "Anonymous risk screening for staff who opt in.", "Monthly seasonal briefings for procurement."].map((i) => (
              <li key={i} className="border-b border-hairline pb-4 text-sm">— {i}</li>
            ))}
          </ul>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); setSent(true); }}
          className="border border-hairline bg-surface p-8"
        >
          <h2 className="font-display text-xl font-bold">Request a quote</h2>
          {sent ? (
            <p className="mt-6 text-sm text-leaf">Thanks. We'll respond within two working days.</p>
          ) : (
            <div className="mt-6 flex flex-col gap-4">
              <Field label="Name"><input required className="input" /></Field>
              <Field label="Organisation"><input required className="input" /></Field>
              <Field label="Email"><input required type="email" className="input" /></Field>
              <Field label="Headcount"><input required type="number" min="1" className="input num" /></Field>
              <button className="mt-3 rounded bg-leaf px-6 py-3 font-semibold text-surface hover:bg-ink">Send</button>
            </div>
          )}
        </form>
      </div>

      <style>{`.input{width:100%;border:1px solid var(--color-hairline);background:var(--color-bg);padding:0.5rem 0.75rem;font-size:14px;border-radius:4px}.input:focus{outline:2px solid var(--color-leaf);outline-offset:2px}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-xs uppercase tracking-wider text-muted">
      {label}
      {children}
    </label>
  );
}
