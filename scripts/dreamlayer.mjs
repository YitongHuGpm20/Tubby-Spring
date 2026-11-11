// Developer-only image pipeline. Never import this file into the browser bundle.
import { readFileSync, mkdirSync, existsSync, writeFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
const root = resolve(import.meta.dirname, "..");
const config = existsSync(resolve(root, ".env.local"))
  ? parseEnv(readFileSync(resolve(root, ".env.local"), "utf8"))
  : {};
const key = config.DREAMLAYER_API_KEY ?? process.env.DREAMLAYER_API_KEY;
if (!key) {
  console.error("Set DREAMLAYER_API_KEY in .env.local.");
  process.exit(1);
}
const args = process.argv.slice(2),
  readOnly = ["balance", "capabilities", "status", "download"];
if (!args.length) {
  console.error(
    "Usage: node scripts/dreamlayer.mjs capabilities | balance | generate ... | sprite ...",
  );
  process.exit(1);
}
// Journal request identity before paid submission. Reuse the identity on retry.
if (!readOnly.includes(args[0])) {
  mkdirSync(resolve(root, ".dreamlayer-jobs"), { recursive: true });
  let at = args.indexOf("--idempotency-key"),
    id = at >= 0 ? args[at + 1] : randomUUID();
  if (at < 0) args.push("--idempotency-key", id);
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
    console.error("Use a simple request ID.");
    process.exit(1);
  }
  const journal = resolve(root, ".dreamlayer-jobs", id + ".json");
  const contents = JSON.stringify({ id, args }, null, 2) + "\n";
  if (existsSync(journal) && readFileSync(journal, "utf8") !== contents) {
    console.error("This request ID belongs to a different request.");
    process.exit(1);
  }
  writeFileSync(journal, contents);
  console.error("Request saved. Retain this ID for recovery:", id);
}
const result = spawnSync(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["--yes", "dreamlayer@0.4.0-beta.4", ...args],
  {
    cwd: root,
    env: { ...process.env, DREAMLAYER_API_KEY: key },
    stdio: "inherit",
  },
);
if (result.error)
  console.error("Could not start the CLI. Check Node.js and network access.");
process.exit(result.status ?? 1);
