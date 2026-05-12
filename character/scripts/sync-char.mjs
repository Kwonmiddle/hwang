import fs from "node:fs/promises";
import path from "node:path";

/**
 * Ensure /public/char.png exists for deployments.
 * Source of truth: repo root ../char.png
 */
const ROOT = path.resolve(process.cwd(), "..");
const src = path.join(ROOT, "char.png");
const dst = path.resolve(process.cwd(), "public", "char.png");

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (!(await exists(src))) {
    // No-op: dev/build can still run; sprite will just 404
    return;
  }
  await fs.mkdir(path.dirname(dst), { recursive: true });
  const buf = await fs.readFile(src);
  await fs.writeFile(dst, buf);
}

await main();

