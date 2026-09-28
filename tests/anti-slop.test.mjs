import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const oxlint = join(
  dirname(fileURLToPath(import.meta.resolve("oxlint/package.json"))),
  "bin/oxlint",
);
const generic = fileURLToPath(new URL("../dist/anti-slop/index.js", import.meta.url));
const effect = fileURLToPath(new URL("../dist/anti-slop/effect/index.js", import.meta.url));

test("built generic and Effect plugins load and report independently", () => {
  const dir = mkdtempSync(join(tmpdir(), "quality-vendor-"));
  try {
    const config = join(dir, "oxlint.config.mjs");
    const source = join(dir, "probe.ts");
    writeFileSync(
      config,
      `export default {
      jsPlugins: [
        { name: "anti-slop", specifier: ${JSON.stringify(generic)} },
        { name: "anti-slop-effect", specifier: ${JSON.stringify(effect)} }
      ],
      rules: {
        "anti-slop/no-array-filter-map": "error",
        "anti-slop-effect/no-manual-tag-comparison": "error"
      }
    };`,
    );
    writeFileSync(
      source,
      `declare const tagged: { _tag: string };
const matches = tagged._tag === "Found";
const result = [1, 2].filter(Boolean).map(String);
`,
    );
    const result = spawnSync(process.execPath, [oxlint, "-c", config, source, "--format", "json"], {
      encoding: "utf8",
    });
    assert.equal(result.status, 1, result.stderr || result.stdout);
    const codes = JSON.parse(result.stdout).diagnostics.map((item) => item.code);
    assert.ok(codes.includes("anti-slop(no-array-filter-map)"), JSON.stringify(codes));
    assert.ok(codes.includes("anti-slop-effect(no-manual-tag-comparison)"), JSON.stringify(codes));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
