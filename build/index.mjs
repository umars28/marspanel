import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";

const steps = [
  ["sprites", "build/sprites.mjs"],
  ["css", "build/css.mjs"],
  ["js", "build/js.mjs"],
  ["pages", "build/pages.mjs"],
  ["a11y", "build/a11y.mjs"],
  ["verify", "build/verify.mjs"]
];

mkdirSync("dist", { recursive: true });

let failed = 0;
for (const [name, script] of steps) {
  console.log(`\n${name}`);
  try {
    execFileSync(process.execPath, [script], { stdio: "inherit" });
  } catch {
    failed++;
  }
}

console.log("");
if (failed) {
  console.log(`${failed} step(s) reported problems`);
  process.exitCode = 1;
} else {
  console.log("build ok");
}
