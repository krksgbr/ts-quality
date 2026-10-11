# Vendored anti-slop Oxlint rules

This is the vendored source inside `@krksgbr/oxlint-rules`. The generic rules reject low-evidence TypeScript/JavaScript patterns; the Effect group applies Effect-specific conventions. The package compiles these plugins to JavaScript; consumers do not need to load TypeScript source.

- Upstream: https://github.com/dmmulroy/anti-slop
- Source revision: `c44ef22ca116d0ba62a3ff663a0bd13a3f3fa40b`
- License: MIT, retained in `LICENSE`.
- `vendor/eslint-stylistic/` retains its own MIT license and provenance.
- The upstream RuleTester files are omitted; `tests/anti-slop.test.mjs` at the repository root exercises the built plugin exports.

The package pins `@oxlint/plugins` to 1.79.0 and tests against Oxlint 1.79.0. When updating vendored rules, inspect upstream source and changelog, preserve local configuration, review consumer diagnostics, and update the source revision above.
