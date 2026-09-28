import type { OxlintConfig } from "oxlint";

export const typescriptRatchetRules = {
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/consistent-type-assertions": ["error", { assertionStyle: "never" }],
  "@typescript-eslint/no-non-null-assertion": "error",
} satisfies NonNullable<OxlintConfig["rules"]>;

export const antiSlopRules = {
  "oxc/no-accumulating-spread": "error",
  "anti-slop/no-array-filter-map": "error",
  "anti-slop/no-reduce-accumulator-copy": "error",
  "anti-slop/no-chained-type-assertions": "error",
  "anti-slop/no-conditional-empty-object-spread": "error",
  "anti-slop/no-known-value-widening": "error",
  "anti-slop/no-module-mocking": "error",
  "anti-slop/no-object-parameters": "error",
  "anti-slop/no-reflect-apply": "error",
  "anti-slop/no-reflect-get": "error",
  "anti-slop/no-runtime-typeof": "error",
  "anti-slop/no-shape-in-symbol-names": "error",
  "anti-slop/no-unknown-parameters": "error",
  "anti-slop/no-unknown-returns": "error",
  "anti-slop/no-unknown-type-aliases": "error",
  "anti-slop/no-unsafe-dictionary-type": "error",
  "anti-slop/no-widen-then-assert": "error",
  "anti-slop/require-readable-spacing": "error",
  "anti-slop/require-safety-comment-for-type-assertion": "error",
} satisfies NonNullable<OxlintConfig["rules"]>;

export const effectAntiSlopRules = {
  "anti-slop-effect/no-manual-effect-error-tag": "error",
  "anti-slop-effect/no-manual-tag-comparison": "error",
  "anti-slop-effect/no-manual-tagged-construction": "error",
  "anti-slop-effect/prefer-effect-match": "error",
} satisfies NonNullable<OxlintConfig["rules"]>;

export const policyRules = {
  "quality-policy/no-direct-console": "error",
  "quality-policy/no-direct-process-env": "error",
  "quality-policy/no-effect-run-promise": "error",
  "quality-policy/no-effect-run-sync": "error",
  "quality-policy/no-json-parse": "error",
  "quality-policy/no-promise-export": "error",
  "quality-policy/no-throw-statement": "error",
  "quality-policy/no-try-catch": "error",
  "quality-policy/no-array-mutation": "error",
} satisfies NonNullable<OxlintConfig["rules"]>;

/** File-neutral presets: adoption files and exceptions belong to the consumer. */
export const genericRules = { ...typescriptRatchetRules, ...antiSlopRules };
export const effectRules = { ...effectAntiSlopRules, ...policyRules };

/** Oxlint config fragments; consumers select files/overrides at their own boundary. */
export const genericPreset = {
  jsPlugins: [{ name: "anti-slop", specifier: "@krksgbr/oxlint-rules/anti-slop" }],
  rules: genericRules,
} satisfies OxlintConfig;

export const effectPreset = {
  jsPlugins: [
    { name: "anti-slop-effect", specifier: "@krksgbr/oxlint-rules/effect" },
    { name: "quality-policy", specifier: "@krksgbr/oxlint-rules/policy" },
  ],
  rules: effectRules,
} satisfies OxlintConfig;
