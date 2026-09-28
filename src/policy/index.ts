import { eslintCompatPlugin } from "@oxlint/plugins";
import { noPromiseExportRule } from "./promise-export.js";
import {
  noArrayMutationRule,
  noDirectConsoleRule,
  noDirectProcessEnvRule,
  noEffectRunPromiseRule,
  noEffectRunSyncRule,
  noJsonParseRule,
  noThrowStatementRule,
  noTryCatchRule,
} from "./rules.js";

const policyPlugin = eslintCompatPlugin({
  meta: { name: "quality-policy" },
  rules: {
    "no-promise-export": noPromiseExportRule,
    "no-direct-console": noDirectConsoleRule,
    "no-direct-process-env": noDirectProcessEnvRule,
    "no-effect-run-promise": noEffectRunPromiseRule,
    "no-effect-run-sync": noEffectRunSyncRule,
    "no-json-parse": noJsonParseRule,
    "no-throw-statement": noThrowStatementRule,
    "no-try-catch": noTryCatchRule,
    "no-array-mutation": noArrayMutationRule,
  },
});

export default policyPlugin;
