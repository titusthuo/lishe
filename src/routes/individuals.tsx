import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/individuals")({
  head: () => ({
    meta: [
      { title: "For individuals — Lishe" },
      { name: "description", content: "Decide what to eat today on the money you actually have. Real scenarios, real numbers." },
      { property: "og:title", content: "For individuals — Lishe" },
      { property: "og:description", content: "Real Kenyan scenarios: student, family of four, shift worker." },
    ],
  }),
  component: Individuals,
});

const SCENARIOS = [
  { name: "Student on KSh 150/day", body: "Two meals plus tea. Githeri and terere at lunch (KSh 60), ugali and sukuma at supper (KSh 45). Meets protein and iron targets on ~KSh 130." },
  { name: "Family of four on KSh 800/day", body: "One large githeri pot (KSh 220), sukuma wiki and managu on rotation, tilapia twice a week. Fits budget with KSh 40 for tea." },
  { name: "Shift worker at 2,800 kcal", body: "Chapati at breakfast, mukimo and beans at lunch, ugali and omena at supper. Hits calories without soda — total KSh 220." },
];

function Individuals() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6">
      <h1 className="font-display text-5xl font-extrabold tracking-tight">For individuals</h1>
      <p className="mt-4 max-w-[680px] text-lg text-muted">Concrete scenarios with real numbers.</p>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {SCENARIOS.map((s) => (
          <div key={s.name} className="border border-hairline bg-surface p-8">
            <h2 className="font-display text-lg font-bold">{s.name}</h2>
            <p className="mt-4 text-sm text-muted">{s.body}</p>
          </div>
        ))}
      </div>

      <Link to="/plates" className="mt-14 inline-block rounded bg-leaf px-6 py-3 font-semibold text-surface hover:bg-ink">
        Start
      </Link>
    </div>
  );
}
