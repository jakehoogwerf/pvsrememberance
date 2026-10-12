// Rebuilds index.html with the staff-only assembly content encrypted.
// Usage (from the repository folder):  node tools/protect.mjs "YourPassword"
// Needs Node.js 18 or newer. Uses PBKDF2 (SHA-256) + AES-256-GCM, the same
// Web Crypto functions the browser uses to unlock the page.

import { readFile, writeFile } from "node:fs/promises";
import { webcrypto as crypto } from "node:crypto";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const password = process.argv[2];

if (!password) {
  console.error('Usage: node tools/protect.mjs "YourPassword"');
  process.exit(1);
}

const sourcePath = path.join(root, "private", "assembly.mjs");
let assembly;
try {
  ({ default: assembly } = await import(pathToFileURL(sourcePath).href));
} catch (err) {
  console.error(`Couldn't read ${sourcePath}. Keep a copy of the private folder on your computer; it is not stored on GitHub.`);
  console.error(err.message);
  process.exit(1);
}

const ITERATIONS = 250000;
const enc = new TextEncoder();
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const baseKey = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
const key = await crypto.subtle.deriveKey(
  { name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" },
  baseKey, { name: "AES-GCM", length: 256 }, false, ["encrypt"]
);
const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(JSON.stringify(assembly))));
const b64 = (u) => Buffer.from(u).toString("base64");
const payload = JSON.stringify({ v: 1, iter: ITERATIONS, salt: b64(salt), iv: b64(iv), ct: b64(cipher) });

const template = await readFile(path.join(here, "index.template.html"), "utf8");
const marker = '"__ASSEMBLY_PAYLOAD__"';
if (!template.includes(marker)) {
  console.error("tools/index.template.html is missing the __ASSEMBLY_PAYLOAD__ marker.");
  process.exit(1);
}
await writeFile(path.join(root, "index.html"), template.replace(marker, payload));
console.log("Built index.html with the assembly section locked. Commit and push index.html.");
