import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { gzipSync } from "node:zlib";

const ENTRY = "src/css/marspanel.css";

function inline(file, seen = new Set()) {
  const abs = resolve(file);
  if (seen.has(abs)) return "";
  seen.add(abs);
  const dir = dirname(abs);
  return readFileSync(abs, "utf8").replace(
    /@import\s+(?:url\()?["']([^"']+)["']\)?\s*;/g,
    (_, target) => inline(join(dir, target), seen)
  );
}

function minify(css) {
  let out = "";
  let i = 0;
  while (i < css.length) {
    const c = css[i];

    if (c === '"' || c === "'") {
      const quote = c;
      let j = i + 1;
      while (j < css.length && (css[j] !== quote || css[j - 1] === "\\")) j++;
      out += css.slice(i, j + 1);
      i = j + 1;
      continue;
    }

    if (css.startsWith("url(", i)) {
      const end = css.indexOf(")", i);
      out += css.slice(i, end + 1);
      i = end + 1;
      continue;
    }

    if (css.startsWith("/*", i)) {
      i = css.indexOf("*/", i) + 2;
      continue;
    }

    if (/\s/.test(c)) {
      let j = i;
      while (j < css.length && /\s/.test(css[j])) j++;
      const prev = out[out.length - 1];
      const next = css[j];
      if (!"{};,".includes(prev) && !"{};,".includes(next) && next !== undefined) out += " ";
      i = j;
      continue;
    }

    if (c === ";") {
      let j = i + 1;
      while (j < css.length && /\s/.test(css[j])) j++;
      if (css[j] === "}") {
        i = j;
        continue;
      }
    }

    if ("{};,".includes(c)) {
      while (out.endsWith(" ")) out = out.slice(0, -1);
    }

    out += c;
    i++;
  }
  return out.trim();
}

const bundled = inline(ENTRY).replace(/\n{3,}/g, "\n\n").trim() + "\n";
const minified = minify(bundled) + "\n";

writeFileSync("dist/marspanel.css", bundled);
writeFileSync("dist/marspanel.min.css", minified);

const kb = (s) => (Buffer.byteLength(s) / 1024).toFixed(1) + " kB";
const gz = (s) => (gzipSync(Buffer.from(s), { level: 9 }).length / 1024).toFixed(1) + " kB gzip";
console.log(`  dist/marspanel.css      ${kb(bundled)}`);
console.log(`  dist/marspanel.min.css  ${kb(minified)}  ${gz(minified)}`);

const leftover = bundled.match(/@import/g);
if (leftover) throw new Error(`${leftover.length} unresolved @import in bundle`);

const opens = (bundled.match(/{/g) || []).length;
const closes = (bundled.match(/}/g) || []).length;
if (opens !== closes) throw new Error(`brace mismatch in bundle: ${opens} open, ${closes} close`);

const mOpens = (minified.match(/{/g) || []).length;
const mCloses = (minified.match(/}/g) || []).length;
if (mOpens !== opens || mCloses !== closes) {
  throw new Error(`minifier changed brace count: ${mOpens}/${mCloses} vs ${opens}/${closes}`);
}
