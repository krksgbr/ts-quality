# Oxlint rules for TypeScript projects

Oxlint plugins and shareable presets: vendored anti-slop rules, TypeScript assertion checks, and opt-in syntactic policy rules. Consumers need only Oxlint and this package.

## Installation

The package is hosted on [GitHub Packages](https://github.com/krksgbr/ts-quality/packages). Add this scope to your project's `.npmrc`:

```ini
@krksgbr:registry=https://npm.pkg.github.com
```

GitHub requires authentication even for public npm packages. Add the following to your user-level `~/.npmrc` and provide a classic personal access token with `read:packages` through `NODE_AUTH_TOKEN`; do not commit credentials:

```ini
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

```sh
npm install --save-dev --save-exact @krksgbr/oxlint-rules@0.1.1 oxlint@1.79.0
```

Oxlint 1.79.0 is the tested version; its JS-plugin API is alpha and not covered by semver guarantees. Supported Node versions are `^20.19.0 || >=22.12.0`, matching Oxlint. The package ships compiled JavaScript; consumers do not need TypeScript source loading or a checkout of this repository.

## Configuration

```js
// oxlint.config.mjs
import { defineConfig } from "oxlint";
import { genericPreset, effectPreset } from "@krksgbr/oxlint-rules/presets";

export default defineConfig({
  extends: [genericPreset, effectPreset],
  overrides: [{ files: ["**/*.test.ts"], rules: { "quality-policy/no-throw-statement": "off" } }],
});
```

`genericPreset` enables the built-in `no-explicit-any`, `consistent-type-assertions` (`never`), and `no-non-null-assertion` ratchets plus vendored generic anti-slop rules. `effectPreset` enables vendored Effect rules and nine syntactic policy checks. Each is opt-in; you may instead import `typescriptRatchetRules`, `antiSlopRules`, `effectAntiSlopRules`, or `policyRules`, or register the three plugin subpaths individually: `@krksgbr/oxlint-rules/anti-slop`, `/effect`, and `/policy`. The Effect preset enables `quality-policy/no-promise-export` at **error**; use a `warn` override for manual review or restrict errors to adopted core files, and run a broader Promise advisory separately if you want one outside the gate.

Choose the files covered by each rule in your project's `overrides`, including any exceptions for tests or runtime boundaries. File-level exceptions also permit new violations in that file; they do not freeze an existing violation count. Suppress justified individual matches with Oxlint's native `oxlint-disable-next-line <rule> -- reason` when a file-level exception would be too broad.

Policy rule catalog (`quality-policy/` prefix):

| Rule                                          | Syntax it checks                                                      |
| --------------------------------------------- | --------------------------------------------------------------------- |
| `no-direct-console`, `no-direct-process-env`  | Listed console calls; direct `process.env` access, including writes   |
| `no-json-parse`                               | One-argument `JSON.parse` calls                                       |
| `no-effect-run-promise`, `no-effect-run-sync` | One-argument `Effect.runPromise[Exit]` / `Effect.runSync[Exit]` calls |
| `no-throw-statement`, `no-try-catch`          | Throw statements; try statements with catch handlers                  |
| `no-array-mutation`                           | Named mutator calls and indexed/length writes                         |
| `no-promise-export`                           | Direct Promise-shaped exports and exported interface/class members    |

These checks are syntax-only. They do not prove a callee is the global console/JSON/Effect object, an indexed write targets an array, or an exported alias has an inferred Promise type. `no-array-mutation` intentionally matches mutator names and indexed writes on _any_ receiver. `no-promise-export` covers direct syntactic export forms, not every exported Promise-bearing value. Apply them only where these syntactic restrictions match your project's conventions.

## Development and releases

```sh
npm ci
npm run check
npm run smoke:consumer
```

The consumer smoke test builds and packs the package, then installs it in a disposable independent project. `just pack` produces a local inspection tarball; `dist/` and `release/` are not checked in.

For a release, run `npm version <version> --no-git-tag-version` to update the manifest and lockfile, commit the change, and push a matching `v<version>` tag. `.github/workflows/release.yml` checks the tag against the manifest, runs tests and the consumer smoke test, then publishes to GitHub Packages using the repository's `GITHUB_TOKEN`. The same checks run for pushes and pull requests to `main`. Publish a new version after each package change; published versions are immutable.

## License and provenance

Vendored licenses and provenance are in `THIRD_PARTY_NOTICES.md` and `src/anti-slop/vendor/eslint-stylistic/UPSTREAM.md`; both license files and provenance ship with the tarball. The upstream anti-slop revision is `c44ef22ca116d0ba62a3ff663a0bd13a3f3fa40b`.
