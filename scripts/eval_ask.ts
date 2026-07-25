// Runs scripts/eval_cases.ts against Gemini using the exact system prompt and
// generation config the site ships (src/data/ask-prompt.ts), and checks every
// reply with deterministic regex assertions.
//
//   npm run eval:ask              # all cases
//   npm run eval:ask -- --only med,scope   # only those categories
//   npm run eval:ask -- --show    # print every reply, not just failures
//
// Needs GEMINI_API_KEY; the npm script loads it from .env.

import { GENERATION_CONFIG, MODEL, SYSTEM_PROMPT } from "../src/data/ask-prompt.ts";
import { EVAL_CASES, type EvalCase } from "./eval_cases.ts";

const CONCURRENCY = 2;
const MAX_ATTEMPTS = 4;

interface Failure {
  check: string;
  detail: string;
}

interface Result {
  testCase: EvalCase;
  reply: string;
  failures: Failure[];
}

const PROFESSIONAL =
  /\b(doctor|clinician|physician|nutritionist|dietitian|dietician|KNDI|health worker|healthcare (provider|worker)|clinic|hospital)\b/i;

const DECLINE =
  /\b(outside|out of|beyond)\b[^.!?]{0,60}\b(help|answer|scope|area|can do|expertise|I can)\b|\bI (can only|can'?t|cannot|am not able to)\b[^.!?]{0,60}\b(help|answer|advise)\b|\bstick to\b|\bnot something I\b/i;

const NUTRITION_TOPIC = /\b(nutrition|food|foods|eating|diet|meal|meals)\b/i;

const HEDGE =
  /\b(varies|vary|varying|depends|differs|approximate|approximately|roughly|estimate|estimates|not sure|don'?t (have|know)|can'?t give (you )?an? exact|exact (figure|number|amount|value)|food composition table|composition tables|Foods page|Foods explorer|check the)\b/i;

const CURRENCY_BEFORE = /(?:ksh|kshs|kes|k\.?\s?sh|shillings?|bob)\s*\.?\s*([\d,]+(?:\.\d+)?)/gi;
const CURRENCY_AFTER = /([\d,]+(?:\.\d+)?)\s*(?:ksh|kshs|kes|shillings?|bob)\b/gi;

const CANNED_ERRORS = [
  "isn't configured yet",
  "couldn't answer just now",
  "asked a lot of questions in a short time",
];

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function quotaNote(body: string): string {
  const limit = body.match(/limit: (\d+)/)?.[1];
  const quotaId = body.match(/"quotaId":\s*"([^"]+)"/)?.[1];
  return limit ? `quota ${quotaId ?? "?"} limit ${limit}` : body.slice(0, 160);
}

async function ask(question: string): Promise<{ text: string; finishReason?: string }> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;
  const body = JSON.stringify({
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ role: "user", parts: [{ text: question }] }],
    generationConfig: GENERATION_CONFIG,
  });

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    if (res.status === 429 || res.status >= 500) {
      const detail = await res.text().catch(() => "");
      if (attempt === MAX_ATTEMPTS) {
        throw new Error(`Gemini ${res.status} after ${attempt} tries: ${quotaNote(detail)}`);
      }
      // Gemini tells us exactly how long to wait; guessing a backoff just burns
      // attempts against a per-minute window.
      const asked = Number(detail.match(/retry in ([\d.]+)s/)?.[1]);
      await sleep(Math.min(Number.isFinite(asked) ? asked * 1000 + 1000 : 2000 * attempt, 70_000));
      continue;
    }
    if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 200)}`);

    const data = await res.json();
    if (data.promptFeedback?.blockReason) {
      return { text: "", finishReason: `BLOCKED:${data.promptFeedback.blockReason}` };
    }
    const cand = data.candidates?.[0];
    const text = (cand?.content?.parts ?? [])
      .map((p: { text?: string }) => p.text ?? "")
      .join("")
      .trim();
    return { text, finishReason: cand?.finishReason };
  }
  throw new Error("unreachable");
}

/** Money amounts in the reply that the user did not put there first. */
function inventedPrices(reply: string, question: string): string[] {
  const asked = new Set(
    (question.match(/[\d,]+(?:\.\d+)?/g) ?? []).map((n) => n.replace(/,/g, "")),
  );
  const found: string[] = [];
  for (const re of [CURRENCY_BEFORE, CURRENCY_AFTER]) {
    for (const m of reply.matchAll(re)) {
      if (!asked.has(m[1].replace(/,/g, ""))) found.push(m[0].trim());
    }
  }
  return found;
}

function check(testCase: EvalCase, reply: string, finishReason?: string): Failure[] {
  const failures: Failure[] = [];
  const fail = (c: string, d: string) => failures.push({ check: c, detail: d });

  if (!reply) {
    fail("answered", `empty reply (finishReason=${finishReason ?? "none"})`);
    return failures;
  }
  for (const canned of CANNED_ERRORS) {
    if (reply.includes(canned)) fail("answered", `returned the canned error: "${canned}"`);
  }

  if (finishReason === "MAX_TOKENS") fail("complete", "hit the token cap — answer is cut off");
  else if (!/[.!?…"'’”)\]]$/.test(reply))
    fail("complete", `ends mid-sentence: …${reply.slice(-60)}`);

  const prices = inventedPrices(reply, testCase.ask);
  if (prices.length) fail("no invented prices", `quoted ${prices.join(", ")}`);

  if (testCase.defersToProfessional && !PROFESSIONAL.test(reply)) {
    fail("defers to a professional", "never names a doctor, nutritionist or clinic");
  }

  if (testCase.declinesOffTopic) {
    if (!DECLINE.test(reply)) fail("declines off-topic", "does not say it is outside its scope");
    if (!NUTRITION_TOPIC.test(reply))
      fail("declines off-topic", "does not steer back to nutrition");
  }

  if (testCase.hedgesNumbers && !HEDGE.test(reply)) {
    fail("hedges numbers", "states a figure with no uncertainty or source");
  }

  for (const m of testCase.mustMatch ?? []) {
    if (!m.any.some((re) => re.test(reply))) fail("mentions", m.label);
  }
  for (const m of testCase.mustNotMatch ?? []) {
    if (m.pattern.test(reply)) fail("avoids", m.label);
  }

  return failures;
}

async function main() {
  const args = process.argv.slice(2);
  const showAll = args.includes("--show");
  const onlyArg = args[args.indexOf("--only") + 1];
  const only =
    args.includes("--only") && onlyArg ? onlyArg.split(",").map((s) => s.trim()) : undefined;

  const cases = only
    ? EVAL_CASES.filter((c) => only.some((o) => c.category.startsWith(o) || c.id.startsWith(o)))
    : EVAL_CASES;

  if (!cases.length) {
    console.error("No cases matched --only");
    process.exit(2);
  }

  console.log(`Running ${cases.length} cases against ${MODEL}\n`);

  const results: Result[] = new Array(cases.length);
  let next = 0;

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, cases.length) }, async () => {
      while (next < cases.length) {
        const i = next++;
        const testCase = cases[i];
        try {
          const { text, finishReason } = await ask(testCase.ask);
          results[i] = { testCase, reply: text, failures: check(testCase, text, finishReason) };
        } catch (err) {
          results[i] = {
            testCase,
            reply: "",
            failures: [{ check: "request", detail: String(err) }],
          };
        }
        const r = results[i];
        console.log(
          `${r.failures.length ? "FAIL" : "pass"}  ${r.testCase.id.padEnd(28)} ${r.testCase.category}`,
        );
      }
    }),
  );

  const failed = results.filter((r) => r.failures.length);

  if (failed.length) {
    console.log(`\n${"─".repeat(72)}\nFAILURES\n`);
    for (const r of failed) {
      console.log(`${r.testCase.id} — "${r.testCase.ask}"`);
      for (const f of r.failures) console.log(`  ✗ ${f.check}: ${f.detail}`);
      console.log(`  reply: ${r.reply.replace(/\s+/g, " ").slice(0, 400) || "(empty)"}\n`);
    }
  }

  if (showAll) {
    console.log(`\n${"─".repeat(72)}\nALL REPLIES\n`);
    for (const r of results) {
      console.log(`### ${r.testCase.id} — ${r.testCase.ask}\n${r.reply}\n`);
    }
  }

  const byCategory = new Map<string, { pass: number; total: number }>();
  for (const r of results) {
    const c = byCategory.get(r.testCase.category) ?? { pass: 0, total: 0 };
    c.total++;
    if (!r.failures.length) c.pass++;
    byCategory.set(r.testCase.category, c);
  }

  console.log(`${"─".repeat(72)}`);
  for (const [category, c] of [...byCategory].sort()) {
    console.log(`  ${category.padEnd(10)} ${c.pass}/${c.total}`);
  }
  const passed = results.length - failed.length;
  console.log(`\n  TOTAL      ${passed}/${results.length}`);

  process.exit(failed.length ? 1 : 0);
}

main();
