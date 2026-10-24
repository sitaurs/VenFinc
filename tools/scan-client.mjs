import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
const root = "apps/web/dist/client";
async function walk(path) {
  const out = [];
  for (const e of await readdir(path, { withFileTypes: true })) {
    const p = join(path, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (/\.(?:js|html|css|json|webmanifest)$/.test(e.name)) out.push(p);
  }
  return out;
}
const rules = [
  /postgres(?:ql)?:\/\/[^\s]+/i,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /CF-Access-Client-Secret/i,
  /(?:sk-proj-|sk-live-|AKIA)[A-Za-z0-9_-]{12,}/,
  /https:\/\/(?:gowa|9r)\.venlab\.tech/,
];
try {
  const files = await walk(root);
  const failures = [];
  for (const file of files) {
    const content = await readFile(file, "utf8");
    for (let i = 0; i < rules.length; i++)
      if (rules[i].test(content)) failures.push({ file, rule: i + 1 });
  }
  console.log(
    JSON.stringify({
      check: "client-secret-and-service-boundary-scan",
      status: failures.length ? "FAIL" : "PASS",
      scannedFiles: files.length,
      failures,
      limitation:
        "Heuristic built-artifact scan; not a replacement for staging auth/RLS/security audit.",
    }),
  );
  if (failures.length) process.exitCode = 1;
} catch {
  console.error("Build output absent or unreadable. Run pnpm build first.");
  process.exitCode = 2;
}
