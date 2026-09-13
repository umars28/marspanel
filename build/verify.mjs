import { readFileSync, readdirSync, existsSync } from "node:fs";

let problems = 0;
const fail = (msg) => {
  console.log("    " + msg);
  problems++;
};

const symbols = new Set(JSON.parse(readFileSync("dist/.symbols.json", "utf8")));
const css = readFileSync("dist/marspanel.css", "utf8");
const pages = readdirSync("pages").filter((f) => f.endsWith(".html"));

const declared = new Set([...css.matchAll(/(--mpn-[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
const used = new Set([...css.matchAll(/var\((--mpn-[a-z0-9-]+)/g)].map((m) => m[1]));
const LOCAL = new Set(["--mpn-state", "--mpn-state-tint", "--mpn-split-w", "--mpn-aurora", "--mpn-wash"]);
for (const token of used) {
  if (!declared.has(token) && !LOCAL.has(token)) fail(`css uses undeclared token ${token}`);
}

const cssClasses = new Set([...css.matchAll(/\.(mpn-[a-z0-9-]+)/g)].map((m) => m[1]));

let refs = 0;
const usedClasses = new Set();
for (const page of pages) {
  const html = readFileSync(`pages/${page}`, "utf8");

  for (const m of html.matchAll(/href="#(i-[a-z0-9-]+|il-[a-z0-9-]+)"/g)) {
    refs++;
    if (!symbols.has(m[1])) fail(`${page}: missing symbol #${m[1]}`);
  }

  for (const m of html.matchAll(/(?:href|src)="(\.\.\/[^"#]+)"/g)) {
    if (!existsSync(`pages/${m[1]}`)) fail(`${page}: broken asset path ${m[1]}`);
  }

  for (const m of html.matchAll(/href="([a-z0-9-]+\.html)"/g)) {
    if (!existsSync(`pages/${m[1]}`)) fail(`${page}: broken link to ${m[1]}`);
  }

  for (const m of html.matchAll(/class="([^"]+)"/g)) {
    for (const c of m[1].split(/\s+/)) if (c.startsWith("mpn-")) usedClasses.add(c);
  }

  if (!html.includes("dist/marspanel-theme.js")) fail(`${page}: theme script not in head`);
  if (!html.includes("dist/sprites.js")) fail(`${page}: sprite script missing`);
}

const STATE_CLASSES = /^mpn-is-(ok|warn|danger|info|pending|idle)$/;
for (const c of usedClasses) {
  if (!cssClasses.has(c) && !STATE_CLASSES.test(c)) fail(`class .${c} used in pages but not defined in css`);
}

const physical = /(^|[\s;{])(margin|padding|border)-(left|right)\s*:/g;
for (const dir of ["src/css/tokens", "src/css/base", "src/css/components"]) {
  for (const f of readdirSync(dir)) {
    if (f === "rtl.css" || !f.endsWith(".css")) continue;
    const text = readFileSync(`${dir}/${f}`, "utf8");
    for (const m of text.matchAll(physical)) {
      fail(`${dir}/${f}: physical property ${m[2]}-${m[3]} — use the logical form`);
    }
  }
}

console.log(
  `  ${pages.length} pages, ${refs} symbol refs, ${declared.size} tokens, ${cssClasses.size} classes`
);

if (problems) {
  console.log(`  ${problems} problem(s)`);
  process.exitCode = 1;
} else {
  console.log("  no problems");
}
