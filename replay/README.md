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
- `supabase/functions/replay-wording` is the optional edge function (Lovable AI gateway).
- `/evals` is the test bench. `src/lib/samples.ts` makes the 5 sample traders from fixed seeds and tracks the answer key while generating, not via the parser.

## Turning AI wording on
Deploy the edge function (`LOVABLE_API_KEY` secret) and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` (see `.env.example`). Without them the app uses template wording and works fully.
