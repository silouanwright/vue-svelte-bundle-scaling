import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const lockPath = path.join(root, "results-lock.json");
const resultFiles = [
  "original-specimen.json",
  "results.json",
  "route-split.json",
  "matched-app.json",
  "hand-authored.json",
  "route-split-trimmed.json",
  "hand-authored-trimmed.json",
];
const sizeKeys = ["raw", "gzip", "brotli"];

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function sumFiles(files, predicate = () => true) {
  return Object.fromEntries(
    sizeKeys.map((key) => [
      key,
      files.filter(predicate).reduce((total, file) => total + file[key], 0),
    ]),
  );
}

function assertSizesEqual(actual, expected, context) {
  for (const key of sizeKeys) {
    assert(
      actual[key] === expected[key],
      `${context}: ${key} total is ${actual[key]}, expected ${expected[key]}`,
    );
  }
}

function validateSizeObject(value, context) {
  for (const key of sizeKeys) {
    assert(
      Number.isSafeInteger(value[key]) && value[key] >= 0,
      `${context}: ${key} must be a non-negative safe integer`,
    );
  }
}

function validateFileList(files, context) {
  assert(Array.isArray(files) && files.length > 0, `${context}: files must be non-empty`);
  for (const [index, file] of files.entries()) {
    assert(typeof file.file === "string" && file.file.length > 0, `${context}[${index}]: missing filename`);
    validateSizeObject(file, `${context}[${index}]`);
  }
}

function validateVersions(metadata, packageJson, context) {
  assert(metadata && typeof metadata === "object", `${context}: missing metadata`);
  assert(
    typeof metadata.generatedAt === "string" &&
      Number.isFinite(Date.parse(metadata.generatedAt)),
    `${context}: generatedAt is not an ISO timestamp`,
  );
  for (const [name, version] of Object.entries(metadata.versions ?? {})) {
    const packageName = {
      vuePlugin: "@vitejs/plugin-vue",
      sveltePlugin: "@sveltejs/vite-plugin-svelte",
      vueServerRenderer: "@vue/server-renderer",
    }[name] ?? name;
    const pinned =
      packageJson.dependencies?.[packageName] ??
      packageJson.devDependencies?.[packageName];
    if (pinned) {
      assert(
        version === pinned,
        `${context}: ${packageName} result version ${version} differs from package.json ${pinned}`,
      );
    }
  }
}

function validateResults(file, data, packageJson) {
  validateVersions(data.metadata, packageJson, file);

  if (file === "original-specimen.json") {
    assert(data.componentResults?.length === 2, `${file}: expected two component results`);
    for (const result of data.componentResults) {
      validateSizeObject(result.emitted, `${file}:${result.framework}:emitted`);
      validateSizeObject(result.componentOnly, `${file}:${result.framework}:componentOnly`);
    }
    assert(data.appResults?.length === 4, `${file}: expected four application results`);
    for (const result of data.appResults) {
      validateFileList(result.files, `${file}:${result.framework}:${result.lane}:files`);
      assertSizesEqual(
        sumFiles(result.files),
        result,
        `${file}:${result.framework}:${result.lane}`,
      );
    }
    return;
  }

  assert(Array.isArray(data.results) && data.results.length > 0, `${file}: results must be non-empty`);
  for (const [index, result] of data.results.entries()) {
    const context = `${file}:results[${index}]`;
    validateFileList(result.files, `${context}:files`);

    if (file.startsWith("route-split")) {
      validateSizeObject(result.chunked, `${context}:chunked`);
      validateSizeObject(result.coalesced, `${context}:coalesced`);
      assertSizesEqual(sumFiles(result.files), result.chunked, `${context}:chunked`);
      assert(result.coalesced.raw === result.chunked.raw, `${context}: coalesced raw differs`);
    } else if (file.startsWith("hand-authored")) {
      validateSizeObject(result.initial, `${context}:initial`);
      validateSizeObject(result.complete, `${context}:complete`);
      validateSizeObject(result.coalesced, `${context}:coalesced`);
      assertSizesEqual(sumFiles(result.files), result.complete, `${context}:complete`);
      assertSizesEqual(
        sumFiles(result.files, (entry) => entry.initial),
        result.initial,
        `${context}:initial`,
      );
      assert(result.coalesced.raw === result.complete.raw, `${context}: coalesced raw differs`);
    } else {
      validateSizeObject(result, context);
      assertSizesEqual(sumFiles(result.files), result, context);
    }
  }
}

function canonicalize(value, parentKey = "") {
  if (Array.isArray(value)) return value.map((entry) => canonicalize(entry, parentKey));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .filter(
          (key) =>
            !(
              parentKey === "metadata" &&
              ["generatedAt", "node", "platform"].includes(key)
            ),
        )
        .sort()
        .map((key) => [key, canonicalize(value[key], key)]),
    );
  }
  return value;
}

function digest(data) {
  const canonical = JSON.stringify(canonicalize(data));
  return createHash("sha256").update(canonical).digest("hex");
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const artifacts = {};

for (const file of resultFiles) {
  const filePath = path.join(root, file);
  assert(fs.existsSync(filePath), `missing ${file}`);
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  validateResults(file, data, packageJson);
  artifacts[file] = { sha256: digest(data) };
}

const nextLock = {
  schemaVersion: 1,
  normalization:
    "JSON object keys sorted; metadata.generatedAt, metadata.node, and metadata.platform omitted",
  artifacts,
};

if (process.argv.includes("--write-lock")) {
  fs.writeFileSync(lockPath, `${JSON.stringify(nextLock, null, 2)}\n`);
  console.log(`Wrote ${path.relative(process.cwd(), lockPath)}`);
} else {
  assert(fs.existsSync(lockPath), "missing results-lock.json; run npm run verify:write");
  const currentLock = JSON.parse(fs.readFileSync(lockPath, "utf8"));
  assert(
    JSON.stringify(currentLock) === JSON.stringify(nextLock),
    "normalized result hashes differ from results-lock.json",
  );
  console.log(`Verified ${resultFiles.length} result artifacts against results-lock.json`);
}
