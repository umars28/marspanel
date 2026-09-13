import { copyFileSync, readFileSync, writeFileSync } from "node:fs";

const NAMES = ["icons", "illustrations"];
const parts = [];

for (const name of NAMES) {
  const src = `src/sprites/${name}.svg`;
  copyFileSync(src, `dist/${name}.svg`);
  parts.push([name, readFileSync(src, "utf8").trim()]);
}

const js = `(function () {
  var sprites = ${JSON.stringify(Object.fromEntries(parts))};
  window.mpnSprites = sprites;
  function inject() {
    var host = document.createElement("div");
    host.hidden = true;
    host.setAttribute("aria-hidden", "true");
    host.setAttribute("data-mpn-sprites", "");
    host.innerHTML = sprites.icons + sprites.illustrations;
    var parent = document.body || document.documentElement;
    parent.insertBefore(host, parent.firstChild);
  }
  if (document.body) inject();
  else document.addEventListener("DOMContentLoaded", inject);
})();
`;

writeFileSync("dist/sprites.js", js);

const ids = new Set();
for (const [, svg] of parts) for (const m of svg.matchAll(/<symbol id="([^"]+)"/g)) ids.add(m[1]);

const kb = (s) => (Buffer.byteLength(s) / 1024).toFixed(1) + " kB";
console.log(`  dist/sprites.js         ${kb(js)}  (${ids.size} symbols)`);
console.log(`  dist/icons.svg, dist/illustrations.svg`);

writeFileSync("dist/.symbols.json", JSON.stringify([...ids].sort(), null, 2) + "\n");
