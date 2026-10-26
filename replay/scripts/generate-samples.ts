// Writes each sample CSV and its ground-truth JSON to public/samples. Run: npm run samples
import { mkdirSync, writeFileSync } from "node:fs";
import { buildSample, SAMPLE_SPECS } from "../src/lib/samples";

const dir = new URL("../public/samples/", import.meta.url);
mkdirSync(dir, { recursive: true });
for (const s of SAMPLE_SPECS) {
  const ds = buildSample(s.key);
  writeFileSync(new URL(`${s.slug}.csv`, dir), ds.csv);
  writeFileSync(new URL(`${s.slug}.truth.json`, dir), JSON.stringify(ds.truth, null, 2) + "\n");
  console.log(`wrote ${s.slug}: ${ds.truth.round_trips} round trips, net ₹${ds.truth.total_net_pnl}`);
}
