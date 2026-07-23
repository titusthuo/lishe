import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Lishe" },
      { name: "description", content: "Get in touch with the Lishe team." },
      { property: "og:title", content: "Contact — Lishe" },
      { property: "og:description", content: "Email us — we respond within two working days." },
    ],
  }),
  component: () => (
    <div className="mx-auto max-w-[680px] px-4 py-20 sm:px-6">
      <h1 className="font-display text-5xl font-extrabold tracking-tight">Contact</h1>
      <div className="mt-8 space-y-4 text-ink">
        <p>General: <a className="text-leaf underline" href="mailto:hello@lishe.co.ke">hello@lishe.co.ke</a></p>
        <p>Data & partnerships: <a className="text-leaf underline" href="mailto:data@lishe.co.ke">data@lishe.co.ke</a></p>
        <p>Press: <a className="text-leaf underline" href="mailto:press@lishe.co.ke">press@lishe.co.ke</a></p>
      </div>
    </div>
  ),
});
