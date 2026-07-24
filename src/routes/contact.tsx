import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Lishe" },
      { name: "description", content: "Get in touch with the Lishe team." },
      { property: "og:title", content: "Contact — Lishe" },
      { property: "og:description", content: "Email us and we'll get back to you." },
    ],
  }),
  component: Contact,
});

function Contact() {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-20 sm:px-6">
      <h1 className="font-display text-5xl font-extrabold tracking-tight">Contact</h1>
      <p className="mt-4 max-w-[560px] text-muted">
        Questions, feedback, corrections to the nutrition data, or partnership ideas — we'd love
        to hear from you.
      </p>

      <div className="mt-10 space-y-4 text-ink">
        <p>
          General:{" "}
          <a className="text-leaf underline" href="mailto:mwangititus6634@gmail.com">
            mwangititus6634@gmail.com
          </a>
        </p>
        <p>
          Data corrections & partnerships:{" "}
          <a className="text-leaf underline" href="mailto:mwangititus6634@gmail.com">
            mwangititus6634@gmail.com
          </a>
        </p>
      </div>

      <p className="mt-10 text-sm text-muted">
        For a medical concern, pregnancy, or a sick child, please see a doctor or a
        KNDI-registered nutritionist rather than emailing us — we can't give clinical advice.
      </p>
    </div>
  );
}
