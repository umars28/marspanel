import { readFileSync, writeFileSync } from "node:fs";

const HEAD = ["src/js/theme.js"];
const BODY = ["src/js/ui.js", "src/js/widgets.js"];

const read = (f) => readFileSync(f, "utf8").trim();
const bundle = (files) => files.map(read).join("\n\n") + "\n";

const head = bundle(HEAD);
const body = bundle(BODY);

writeFileSync("dist/marspanel-theme.js", head);
writeFileSync("dist/marspanel.js", body);

const kb = (s) => (Buffer.byteLength(s) / 1024).toFixed(1) + " kB";
console.log(`  dist/marspanel-theme.js ${kb(head)}`);
console.log(`  dist/marspanel.js       ${kb(body)}`);

for (const [name, src] of [
  ["marspanel-theme.js", head],
  ["marspanel.js", body]
]) {
  const open = (src.match(/\(/g) || []).length;
  const close = (src.match(/\)/g) || []).length;
  if (open !== close) throw new Error(`paren mismatch in ${name}: ${open} vs ${close}`);
}
