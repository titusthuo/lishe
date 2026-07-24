# Lishe

Nutrition information and a friendly nutrition helper for a Kenyan audience.
The site teaches the basics of a balanced diet using local foods, lets you
search the Kenya Food Composition Tables 2018 (over 640 foods), and answers
your questions through an AI-assisted helper.

## Getting started

Requires Node.js 20+ and npm.

```sh
npm install
npm run dev
```

The dev server starts on http://localhost:8080.

## Environment variables

Set these before deploying:

- `GEMINI_API_KEY` — Google AI Studio key. Without it, the Ask page shows a
  friendly "not configured" message instead of AI answers.
- `GEMINI_MODEL` (optional) — Gemini model ID. Defaults to `gemini-flash-latest`.

## Build

```sh
npm run build
```

The build targets Vercel's Build Output API (see `vite.config.ts` — `nitro({
preset: "vercel" })`). Output lands in `.vercel/output/`. Deploy with:

```sh
npx vercel deploy --prebuilt
```

## Data sources

- Nutrient values: **Kenya Food Composition Tables 2018** (FAO / Government of
  Kenya).
- Guidance: **WHO** healthy-diet advice, **Kenya Ministry of Health** food-based
  dietary guidelines.

Lishe provides general nutrition information, not medical advice.

## Stack

- TanStack Start + TanStack Router
- React 19, TypeScript, Tailwind CSS 4
- Nitro (Vercel preset)
- Google Gemini for the Ask helper
