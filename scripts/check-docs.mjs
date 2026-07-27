import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ignored = new Set([".git", "node_modules", "playwright-report", "test-results"]);
const markdownFiles = [];

function visit(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name) || entry.name.startsWith(".work")) continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) visit(target);
    else if (entry.name.endsWith(".md")) markdownFiles.push(target);
  }
}

visit(root);

const failures = [];
for (const file of markdownFiles) {
  const source = fs.readFileSync(file, "utf8");
  const fenceCount = (source.match(/^```/gm) ?? []).length;
  if (fenceCount % 2 !== 0) {
    failures.push(`${path.relative(root, file)}: unbalanced fenced code blocks`);
  }

  for (const match of source.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
    const rawTarget = match[1].trim().replace(/^<|>$/g, "");
    if (
      /^(?:https?:|mailto:|#)/.test(rawTarget) ||
      rawTarget.includes("${")
    ) {
      continue;
    }
    const withoutFragment = rawTarget.split("#", 1)[0];
    if (!withoutFragment) continue;
    const target = path.resolve(path.dirname(file), decodeURIComponent(withoutFragment));
    if (!fs.existsSync(target)) {
      failures.push(
        `${path.relative(root, file)}: missing local link ${rawTarget}`,
      );
    }
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Verified local links and fences in ${markdownFiles.length} Markdown files`);
}
