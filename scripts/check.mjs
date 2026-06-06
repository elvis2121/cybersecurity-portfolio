import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const docs = path.join(root, "docs");
const htmlFiles = [];

const walk = async (directory) => {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(fullPath);
    else if (entry.name.endsWith(".html")) htmlFiles.push(fullPath);
  }
};

await walk(docs);
const failures = [];
const checked = new Set();

for (const htmlFile of htmlFiles) {
  const html = await fs.readFile(htmlFile, "utf8");
  const attributes = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((match) => match[1]);

  if (!html.includes('<meta name="viewport"')) {
    failures.push(`${htmlFile}: missing viewport metadata`);
  }

  for (const reference of attributes) {
    if (
      reference.startsWith("http") ||
      reference.startsWith("mailto:") ||
      reference.startsWith("#") ||
      reference === ""
    ) {
      continue;
    }

    const withoutHash = reference.split("#")[0].split("?")[0];
    if (!withoutHash) continue;
    const target = path.resolve(path.dirname(htmlFile), withoutHash);
    const key = `${htmlFile}:${target}`;
    if (checked.has(key)) continue;
    checked.add(key);

    try {
      await fs.access(target);
    } catch {
      failures.push(`${path.relative(root, htmlFile)}: broken local reference ${reference}`);
    }
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Checked ${htmlFiles.length} HTML files and ${checked.size} local references.`);
}
