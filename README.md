# Oxlint rules for TypeScript projects

A standalone npm package of TypeScript ratchets, vendored anti-slop rules, and opt-in syntactic policy checks for Oxlint. Consumers need only Oxlint and this package; no Pi or Vite+ installation is required.

Build and pack a versioned tarball:

```sh
npm install
just release 0.1.0   # sets package.json version, builds, writes release/krksgbr-oxlint-rules-0.1.0.tgz
```

`npm run smoke:consumer` builds, packs, and exercises a tarball in a disposable independent project.

Consumers on the same machine install the pinned tarball directly, e.g. `npm install -D ../../ts-quality/release/krksgbr-oxlint-rules-0.1.0.tgz oxlint@1.79.0`. Oxlint 1.79.0 is the tested version; its JS-plugin API is alpha and not covered by semver guarantees. Use a Node version supported by Oxlint and its JavaScript configuration loader. The package ships compiled JavaScript; consumers do not need TypeScript source loading.

`dist/` and `release/` are not checked in. Bump the version and re-pack with `just release <version>` after any source change, so consumers get a new pinned artifact rather than a mutated one.

```js
// oxlint.config.mjs — in a project that installed the tarball and oxlint
import { defineConfig } from "oxlint";
import { genericPreset, effectPreset } from "@krksgbr/oxlint-rules/presets";

export default defineConfig({
  extends: [genericPreset, effectPreset],
  overrides: [{ files: ["**/*.test.ts"], rules: { "quality-policy/no-throw-statement": "off" } }],
});
```

`genericPreset` enables the built-in `no-explicit-any`, `consistent-type-assertions` (`never`), and `no-non-null-assertion` ratchets plus vendored generic anti-slop rules. `effectPreset` enables vendored Effect rules and the nine migrated syntactic policy checks. Each is opt-in; you may instead import `typescriptRatchetRules`, `antiSlopRules`, `effectAntiSlopRules`, or `policyRules`, or register the three plugin subpaths individually: `@krksgbr/oxlint-rules/anti-slop`, `/effect`, and `/policy`. The Effect preset enables `quality-policy/no-promise-export` at **error**; use a `warn` override for manual review or restrict errors to adopted core files, and run a broader Promise advisory separately if you want one outside the gate.

Choose the files covered by each rule in your project's `overrides`; the package does not encode a consumer's grandfathered assertions, module green zones, test/script exclusions, adapters/UI exceptions, or runtime owner. File-level exceptions allow more violations in that file and are **not** a monotonic debt baseline. Suppress justified individual matches with Oxlint's native `oxlint-disable-next-line <rule> -- reason` when a file-level exception would be too broad.

Policy rule catalog (`quality-policy/` prefix):

| Rule                                          | Syntax it checks                                                      |
| --------------------------------------------- | --------------------------------------------------------------------- |
| `no-direct-console`, `no-direct-process-env`  | Listed console calls; direct `process.env` access, including writes   |
| `no-json-parse`                               | One-argument `JSON.parse` calls                                       |
| `no-effect-run-promise`, `no-effect-run-sync` | One-argument `Effect.runPromise[Exit]` / `Effect.runSync[Exit]` calls |
| `no-throw-statement`, `no-try-catch`          | Throw statements; try statements with catch handlers                  |
| `no-array-mutation`                           | Named mutator calls and indexed/length writes                         |
| `no-promise-export`                           | Direct Promise-shaped exports and exported interface/class members    |

These checks are syntax-only. They do not prove a callee is the global console/JSON/Effect object, an indexed write targets an array, or an exported alias has an inferred Promise type. `no-array-mutation` intentionally matches mutator names and indexed writes on _any_ receiver. `no-promise-export` covers direct syntactic export forms, not every exported Promise-bearing value. Keep scopes and semantics separate from refactors to those rules.

Vendored licenses and provenance are in `THIRD_PARTY_NOTICES.md` and `src/anti-slop/vendor/eslint-stylistic/UPSTREAM.md`; both license files and provenance ship with the tarball. The upstream anti-slop revision is `c44ef22ca116d0ba62a3ff663a0bd13a3f3fa40b`.
