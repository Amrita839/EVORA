# Replay

A monthly post-trade review for Indian F&O traders (prototype concept for Nubra). One month of orders in, the 2–3 habits that cost the most out, in rupees, with the trader's own trades as proof.

Lives in `replay/` and is independent of the Evora app in the repo root.

```
npm install
npm run dev        # app
npm test           # unit tests, incl. all 5 sample datasets
npm run samples    # rewrite public/samples/*.csv and *.truth.json
```

## How it works
- `src/lib/parse.ts`, `matchTrades.ts`, `habits.ts` are pure functions. Every number comes from them.
- `src/lib/wording.ts` holds the template wording, the AI output validator (JSON, word limits, numbers must exist in the facts, advice-word filter) and the fallback logic. The AI only rewrites facts. If a check fails the template is used and the failed check is recorded.
- `api/replay-wording.ts` is the Vercel function that calls Claude. It is optional and holds the API key server-side.
- `/evals` is the test bench. `src/lib/samples.ts` makes the 5 sample traders from fixed seeds and tracks the answer key while generating, not via the parser.

## Deploy on Vercel
1. Push this repo, then in Vercel choose **Add New → Project**, pick it, and set **Root Directory** to `replay` (skip if `replay` is the repo root). Framework: Vite.
2. Optional, for AI wording: add `ANTHROPIC_API_KEY` (from console.anthropic.com) under Settings → Environment Variables, then redeploy. `ANTHROPIC_MODEL` is optional (default `claude-haiku-5-5`).
3. Without a key the app still works fully with fixed wording. The footer says so.

Local dev with the function: `npx vercel dev` (put the key in `.env.local`). Plain `npm run dev` runs the app with fixed wording.
