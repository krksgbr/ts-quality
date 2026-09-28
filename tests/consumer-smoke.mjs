import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const sandbox = mkdtempSync(join(tmpdir(), "quality-consumer-"));
const app = join(sandbox, "app");

function run(command, args, cwd, expected = 0) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8", env: process.env });
  assert.equal(
    result.status,
    expected,
    `${command} ${args.join(" ")}\n${result.stdout}\n${result.stderr}`,
  );
  return result.stdout;
}

function diagnostics(config, files, status) {
  const output = run(
    join(app, "node_modules/.bin/oxlint"),
    ["-c", config, ...files, "--format", "json"],
    app,
    status,
  );
  return JSON.parse(output).diagnostics;
}

try {
  const [packed] = JSON.parse(
    run("npm", ["pack", "--json", "--pack-destination", sandbox], packageDir),
  );
  const contents = new Set(packed.files.map((file) => file.path));
  for (const notice of [
    "LICENSE",
    "THIRD_PARTY_NOTICES.md",
    "src/anti-slop/LICENSE",
    "src/anti-slop/vendor/eslint-stylistic/LICENSE",
  ]) {
    assert.ok(contents.has(notice), `missing ${notice} from tarball`);
  }
  assert.ok(
    ![...contents].some((file) => file.endsWith(".ts") && !file.endsWith(".d.ts")),
    "uncompiled source shipped",
  );
  mkdirSync(app);
  writeFileSync(
    join(app, "package.json"),
    '{"name":"external-quality-smoke","private":true,"type":"module"}\n',
  );
  run(
    "npm",
    [
      "install",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      join(sandbox, packed.filename),
      "oxlint@1.79.0",
    ],
    app,
  );
  assert.notEqual(realpathSync(join(app, "node_modules/@krksgbr/oxlint-rules")), packageDir);

  writeFileSync(
    join(app, "oxlint.config.mjs"),
    `import { defineConfig } from "oxlint";
import { genericPreset, effectPreset } from "@krksgbr/oxlint-rules/presets";
export default defineConfig({ extends: [genericPreset, effectPreset],
  overrides: [{ files: ["**/*.test.ts"], rules: { "quality-policy/no-throw-statement": "off" } }] });\n`,
  );
  writeFileSync(
    join(app, "bad.ts"),
    `declare const tagged: { _tag: string };
export const matches = tagged._tag === "Found";
export const input: any = [1, 2].filter(Boolean).map(String);
console.log("probe");
Effect.runSync(task);
`,
  );
  writeFileSync(join(app, "good.ts"), "export const healthy: number = 1;\n");
  writeFileSync(
    join(app, "boundary.test.ts"),
    'export const fixture = () => { throw new Error("test boundary"); };\n',
  );
  writeFileSync(
    join(app, "suppressed.ts"),
    '// oxlint-disable-next-line quality-policy/no-direct-console -- Intentional CLI output.\nconsole.log("allowed");\n\nexport const value = 1;\n',
  );
  writeFileSync(
    join(app, "assertions.ts"),
    "declare const maybe: string | undefined;\nexport const cast = 1 as number;\nexport const forced = maybe!;\n",
  );
  const bad = diagnostics("oxlint.config.mjs", ["bad.ts", "assertions.ts"], 1);
  const badCodes = new Set(bad.map((item) => item.code));
  for (const code of [
    "typescript(no-explicit-any)",
    "typescript(consistent-type-assertions)",
    "typescript(no-non-null-assertion)",
    "anti-slop(no-array-filter-map)",
    "anti-slop-effect(no-manual-tag-comparison)",
    "quality-policy(no-direct-console)",
    "quality-policy(no-effect-run-sync)",
  ]) {
    assert.ok(badCodes.has(code), `missing ${code}; got ${[...badCodes].join(", ")}`);
  }
  assert.deepEqual(
    diagnostics("oxlint.config.mjs", ["good.ts", "boundary.test.ts", "suppressed.ts"], 0),
    [],
  );

  writeFileSync(
    join(app, "policy.config.mjs"),
    'export default { jsPlugins: [{ name: "quality-policy", specifier: "@krksgbr/oxlint-rules/policy" }], rules: { "quality-policy/no-json-parse": "error" } };\n',
  );
  writeFileSync(join(app, "json.ts"), 'export const parsed = JSON.parse("{}");\n');
  assert.ok(
    diagnostics("policy.config.mjs", ["json.ts"], 1).some(
      (item) => item.code === "quality-policy(no-json-parse)",
    ),
  );
  console.log(
    `Independent tarball consumer passed: ${packed.filename} (${contents.size} files), three presets/plugins and local overrides.`,
  );
} finally {
  rmSync(sandbox, { recursive: true, force: true });
}
