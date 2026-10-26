// Builds one self-contained HTML fragment (no server, template wording only). Usage: node scripts/build-artifact.mjs out.html
import { execSync } from "node:child_process";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";

const out = process.argv[2] ?? "replay-artifact.html";
execSync("npx vite build --outDir dist-artifact", { stdio: "inherit", env: { ...process.env, VITE_ARTIFACT: "1" } });
const dir = "dist-artifact/assets/";
const files = readdirSync(dir);
const js = files.filter((f) => f.endsWith(".js")).map((f) => readFileSync(dir + f, "utf8")).join("\n").replaceAll("</script", "<\\/script");
const css = files.filter((f) => f.endsWith(".css")).map((f) => readFileSync(dir + f, "utf8")).join("\n");
writeFileSync(
  out,
  `<title>Replay</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>${css}
#root > div { padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
</style>
<div id="root"></div>
<script type="module">${js}</script>
`,
);
console.log(`wrote ${out} (${Math.round(readFileSync(out).length / 1024)} KB)`);
