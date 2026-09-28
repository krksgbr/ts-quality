# My Oxlint rules for TypeScript and Effect

`@krksgbr/oxlint-rules` is the collection of lint rules I use in my own projects. It's mostly vendored from [Dillon Mulroy's anti-slop](https://github.com/dmmulroy/anti-slop), with additional TypeScript checks and Effect-oriented policies that reflect how I like to write code.

I package the rules so I can share one versioned dependency across my repositories. They aren't intended as a general-purpose ruleset or a recommendation for how everyone should write TypeScript.

Upstream anti-slop is designed to be vendored and customized. This package follows that approach, with its own configuration and release lifecycle; it is not an official anti-slop release.

## How it differs from anti-slop

Compared with [anti-slop at `c44ef22`](https://github.com/dmmulroy/anti-slop/tree/c44ef22ca116d0ba62a3ff663a0bd13a3f3fa40b):

- **Changed rules:** none. The retained upstream rule implementations are unchanged.
- **Removed:** `anti-slop-effect/no-service-constructor-imports`. The other four Effect rules and all generic rules are retained.
- **Added:** nine `quality-policy/*` rules covering console/environment access, JSON parsing, Effect execution, Promise exports, throw/catch, and array mutation. See the [rule list below](#additional-policy-rules).
- **Configuration:** `genericPreset` enables the generic anti-slop rules plus Oxlint's bans on explicit `any`, type assertions, and non-null assertions. `effectPreset` enables the retained Effect rules **and all nine additional policy rules**. Both use error severity; file scopes and exceptions are yours to configure. Individual rule maps are available if you don't want the full presets.

## Installation

Add the registry route to your project's `.npmrc`:

```ini
@krksgbr:registry=https://npm.pkg.github.com
```

GitHub requires authentication even for public npm packages. Add this to your user-level `~/.npmrc` and supply a classic personal access token with `read:packages` through `NODE_AUTH_TOKEN`. Do not commit credentials.

```ini
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

Then install the package and its tested Oxlint version:

```sh
npm install --save-dev --save-exact @krksgbr/oxlint-rules@0.1.2 oxlint@1.79.0
```

Supported Node versions are `^20.19.0 || >=22.12.0`, matching Oxlint. Oxlint's JS-plugin API is alpha and is not covered by its semver guarantees; upgrade Oxlint and this package together after checking compatibility.

## Configuration

For a TypeScript project, enable `genericPreset`. Add `effectPreset` when you also want the Effect rules and the additional policy checks:

```js
// oxlint.config.mjs
import { defineConfig } from "oxlint";
import { genericPreset, effectPreset } from "@krksgbr/oxlint-rules/presets";

export default defineConfig({
  extends: [genericPreset, effectPreset],
  overrides: [
    {
      files: ["**/*.test.ts"],
      rules: { "quality-policy/no-throw-statement": "off" },
    },
  ],
});
```

Both presets enable their rules at **error** severity. They do not select files or impose project-specific exclusions; choose those in your configuration. For gradual adoption, use overrides to limit scope or lower selected rules to `warn`.

For finer control, import the rule maps `typescriptRatchetRules`, `antiSlopRules`, `effectAntiSlopRules`, and `policyRules` from `/presets`. The plugins are also available separately at `@krksgbr/oxlint-rules/anti-slop`, `/effect`, and `/policy`.

Use `oxlint-disable-next-line <rule> -- reason` for a justified individual exception. Disabling a rule for a whole file permits new violations there too.

## Additional policy rules

These rules are local additions, not part of upstream anti-slop. All use the `quality-policy/` prefix.

| Rule | Syntax it checks |
| --- | --- |
| `no-direct-console` | Listed console calls |
| `no-direct-process-env` | Direct `process.env` access, including writes |
| `no-json-parse` | One-argument `JSON.parse` calls |
| `no-effect-run-promise`, `no-effect-run-sync` | One-argument `Effect.runPromise[Exit]` / `Effect.runSync[Exit]` calls |
| `no-throw-statement`, `no-try-catch` | Throw statements; try statements with catch handlers |
| `no-array-mutation` | Named mutator calls and indexed/length writes |
| `no-promise-export` | Direct Promise-shaped exports and exported interface/class members |

These checks are syntax-only. They do not prove that a callee is the global console/JSON/Effect object, that an indexed write targets an array, or that an exported alias has an inferred Promise type. In particular, `no-array-mutation` matches mutator names and indexed writes on **any** receiver, and `no-promise-export` does not detect every exported Promise-bearing value. Enable them where these restrictions fit your project's conventions.

## Development and releases

```sh
npm ci
npm run check
npm run smoke:consumer
```

The consumer smoke test builds and packs the package, then installs it in a disposable independent project. `just pack` produces a local inspection tarball; `dist/` and `release/` are not checked in.

To release, run `npm version <version> --no-git-tag-version`, commit the manifest and lockfile changes, and push a matching `v<version>` tag. The [release workflow](.github/workflows/release.yml) checks the tag against the manifest, runs tests and the consumer smoke test, then publishes to GitHub Packages using the repository's `GITHUB_TOKEN`. Checks also run on pushes and pull requests to `main`. Published versions are immutable.

## License and provenance

MIT. The original anti-slop and ESLint Stylistic copyright notices are retained and included in the npm package. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and the [Stylistic provenance record](src/anti-slop/vendor/eslint-stylistic/UPSTREAM.md) for sources and adaptations.
