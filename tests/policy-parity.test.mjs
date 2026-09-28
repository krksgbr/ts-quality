import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { policyRules } from "../dist/presets.js";

const fixtureDir = fileURLToPath(new URL("./fixtures/", import.meta.url));
const plugin = fileURLToPath(new URL("../dist/policy/index.js", import.meta.url));
const oxlint = join(
  dirname(fileURLToPath(import.meta.resolve("oxlint/package.json"))),
  "bin/oxlint",
);
const files = [
  "promise-export.ts",
  "matchers/array-probe.ts",
  "matchers/console-probe.ts",
  "matchers/env-probe.ts",
  "matchers/json-probe.ts",
  "matchers/probe.ts",
  "matchers/promise-edge.ts",
  "matchers/promise-edge2.ts",
  "matchers/promise-edge3.ts",
  "matchers/promise-review.ts",
  "matchers/run-promise.ts",
  "matchers/run-sync.ts",
  "matchers/suppression.ts",
  "matchers/try-probe.ts",
];

// Captured from ast-grep 0.44.1 against the former ten YAML rules. Promise's
// advisory and core rules share the same matcher, but have different file scopes.
// The Promise review fixture also uses ast-grep 0.44.1 on the old inline rule.
const locations = [
  ...[
    [2, 1],
    [4, 1],
    [6, 1],
    [8, 1],
    [10, 1],
    [12, 1],
    [14, 1],
    [16, 23],
    [18, 23],
    [20, 20],
    [22, 20],
  ].map(([line, column]) => ["no-promise-export", "promise-export.ts", line, column]),
  ...[
    [3, 1],
    [4, 1],
    [5, 1],
    [10, 49],
    [11, 18],
  ].map(([line, column]) => ["no-promise-export", "matchers/promise-edge.ts", line, column]),
  ...[
    [2, 1],
    [3, 1],
    [8, 1],
  ].map(([line, column]) => ["no-promise-export", "matchers/promise-edge2.ts", line, column]),
  ...[
    [1, 19],
    [2, 19],
    [7, 19],
    [8, 19],
    [9, 23],
    [13, 23],
  ].map(([line, column]) => ["no-promise-export", "matchers/promise-edge3.ts", line, column]),
  ...[
    [2, 3],
    [3, 3],
  ].map(([line, column]) => ["no-promise-export", "matchers/promise-review.ts", line, column]),
  ...Array.from({ length: 17 }, (_, index) => [
    "no-array-mutation",
    "matchers/array-probe.ts",
    index + 2,
    1,
  ]),
  ...[1, 2, 6].map((line) => ["no-direct-console", "matchers/console-probe.ts", line, 1]),
  ...[
    [1, 1],
    [2, 1],
    [3, 17],
    [4, 11],
  ].map(([line, column]) => ["no-direct-process-env", "matchers/env-probe.ts", line, column]),
  ["no-json-parse", "matchers/json-probe.ts", 1, 1],
  ["no-throw-statement", "matchers/probe.ts", 1, 1],
  ["no-throw-statement", "matchers/suppression.ts", 7, 1],
  ...[1, 2].map((line) => ["no-effect-run-promise", "matchers/run-promise.ts", line, 1]),
  ...[1, 2].map((line) => ["no-effect-run-sync", "matchers/run-sync.ts", line, 1]),
  ...[1, 3].map((line) => ["no-try-catch", "matchers/try-probe.ts", line, 1]),
];
const ordered = (items) =>
  items.sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));

test("all nine policy matchers retain old positive and negative fixture locations", () => {
  const dir = mkdtempSync(join(tmpdir(), "quality-policy-"));
  try {
    const config = join(dir, "oxlint.config.mjs");
    writeFileSync(
      config,
      `export default { jsPlugins: [{ name: "quality-policy", specifier: ${JSON.stringify(plugin)} }], rules: ${JSON.stringify(policyRules)} };\n`,
    );
    const result = spawnSync(
      process.execPath,
      [oxlint, "-c", config, ...files.map((file) => join(fixtureDir, file)), "--format", "json"],
      { encoding: "utf8" },
    );
    assert.equal(result.status, 1, result.stderr || result.stdout);
    const diagnostics = JSON.parse(result.stdout).diagnostics.filter((item) =>
      item.code?.startsWith("quality-policy("),
    );
    const actual = diagnostics.map((item) => [
      item.code.slice("quality-policy(".length, -1),
      relative(fixtureDir, item.filename),
      item.labels[0].span.line,
      item.labels[0].span.column,
    ]);
    assert.deepEqual(ordered(actual), ordered(locations));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
