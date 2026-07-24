import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms — Lishe" },
      {
        name: "description",
        content:
          "Terms of use for Lishe. General nutrition information, not medical advice.",
      },
      { property: "og:title", content: "Terms — Lishe" },
      { property: "og:description", content: "General nutrition information, not medical advice." },
    ],
  }),
  component: Terms,
});

function Terms() {
  return (
    <div className="mx-auto max-w-[720px] px-4 py-20 sm:px-6">
      <h1 className="font-display text-5xl font-extrabold tracking-tight">Terms of use</h1>
      <p className="mt-4 text-xs text-muted">Last updated 24 July 2026</p>

      <div className="mt-8 space-y-6 text-ink">
        <section>
          <h2 className="font-display text-xl font-bold">What Lishe is</h2>
          <p className="mt-2 text-muted">
            Lishe is a free website that teaches the basics of a balanced diet using local Kenyan
            foods, and offers an AI-powered helper for general nutrition questions. It is an
            educational tool, not a clinical service.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold">Not medical advice</h2>
          <p className="mt-2 text-muted">
            Nothing on Lishe — including the Ask helper — is medical, diagnostic, or therapeutic
            advice. If you are pregnant, breastfeeding, managing a chronic condition such as
            diabetes or hypertension, feeding a young or sick child, or thinking about supplements
            or medication, please see a doctor or a KNDI-registered nutritionist before changing
            your diet.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold">Nutrient data</h2>
          <p className="mt-2 text-muted">
            Nutrient values shown for each food come from the Kenya Food Composition Tables 2018
            (FAO / Government of Kenya). They are per 100 g of the raw edible portion unless the
            food name says otherwise. Real foods vary by variety, season, and preparation, so
            treat the numbers as a guide, not a laboratory reading.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold">The Ask helper</h2>
          <p className="mt-2 text-muted">
            The helper uses Google's Gemini AI to generate answers. AI can make mistakes. Do not
            rely on any single response for a health decision — cross-check with the sources on
            the Learn page or a qualified professional.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold">No warranty</h2>
          <p className="mt-2 text-muted">
            Lishe is provided as-is, without warranty of any kind. To the extent allowed by law,
            we accept no liability for outcomes arising from your use of the site or the helper.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold">Contact</h2>
          <p className="mt-2 text-muted">
            Questions or corrections:{" "}
            <a className="text-leaf underline" href="mailto:mwangititus6634@gmail.com">
              mwangititus6634@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
