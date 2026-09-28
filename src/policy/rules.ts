import { defineRule, type ESTree } from "@oxlint/plugins";

const consoleMethods = new Set([
  "assert",
  "clear",
  "count",
  "countReset",
  "debug",
  "dir",
  "error",
  "group",
  "groupCollapsed",
  "groupEnd",
  "info",
  "log",
  "table",
  "time",
  "timeEnd",
  "timeLog",
  "trace",
  "warn",
]);
const arrayMethods = new Set(["push", "unshift", "splice", "sort", "fill", "copyWithin"]);
const zeroArgumentArrayMethods = new Set(["pop", "shift", "reverse"]);

function staticProperty(member: ESTree.MemberExpression): string | undefined {
  return !member.optional && !member.computed && member.property.type === "Identifier"
    ? member.property.name
    : undefined;
}

function isIdentifier(node: ESTree.Expression, name: string): boolean {
  return node.type === "Identifier" && node.name === name;
}

function memberCall(node: ESTree.CallExpression): ESTree.MemberExpression | undefined {
  return !node.optional && node.callee.type === "MemberExpression" && !node.callee.optional
    ? node.callee
    : undefined;
}

export const noDirectConsoleRule = defineRule({
  meta: {
    type: "problem",
    docs: { description: "Do not call console methods directly." },
    messages: { forbidden: "Do not call console methods directly." },
  },
  createOnce(context) {
    return {
      CallExpression(node) {
        const member = memberCall(node);
        if (
          member &&
          isIdentifier(member.object, "console") &&
          consoleMethods.has(staticProperty(member) ?? "")
        ) {
          context.report({ node, messageId: "forbidden" });
        }
      },
    };
  },
});

export const noDirectProcessEnvRule = defineRule({
  meta: {
    type: "problem",
    docs: { description: "Do not access process.env directly." },
    messages: { forbidden: "Do not access process.env directly." },
  },
  createOnce(context) {
    return {
      MemberExpression(node) {
        if (
          !node.optional &&
          isIdentifier(node.object, "process") &&
          staticProperty(node) === "env"
        ) {
          context.report({ node, messageId: "forbidden" });
        }
      },
    };
  },
});

function effectRunRule(methods: ReadonlySet<string>, description: string, message: string) {
  return defineRule({
    meta: { type: "problem", docs: { description }, messages: { forbidden: message } },
    createOnce(context) {
      return {
        CallExpression(node) {
          const member = memberCall(node);
          if (
            member &&
            isIdentifier(member.object, "Effect") &&
            methods.has(staticProperty(member) ?? "") &&
            node.arguments.length === 1
          ) {
            context.report({ node, messageId: "forbidden" });
          }
        },
      };
    },
  });
}

export const noEffectRunPromiseRule = effectRunRule(
  new Set(["runPromise", "runPromiseExit"]),
  "Do not evaluate Effects through Promise runners directly.",
  "Do not call Effect.runPromise or Effect.runPromiseExit directly.",
);
export const noEffectRunSyncRule = effectRunRule(
  new Set(["runSync", "runSyncExit"]),
  "Do not evaluate Effects through synchronous runners directly.",
  "Do not call Effect.runSync or Effect.runSyncExit directly.",
);

export const noJsonParseRule = defineRule({
  meta: {
    type: "problem",
    docs: { description: "Do not use JSON.parse directly." },
    messages: { forbidden: "Do not use JSON.parse directly." },
  },
  createOnce(context) {
    return {
      CallExpression(node) {
        const member = memberCall(node);
        if (
          member &&
          isIdentifier(member.object, "JSON") &&
          staticProperty(member) === "parse" &&
          node.arguments.length === 1
        ) {
          context.report({ node, messageId: "forbidden" });
        }
      },
    };
  },
});

export const noThrowStatementRule = defineRule({
  meta: {
    type: "problem",
    docs: { description: "Do not use throw statements." },
    messages: { forbidden: "Do not use throw statements." },
  },
  createOnce(context) {
    return {
      ThrowStatement(node) {
        context.report({ node, messageId: "forbidden" });
      },
    };
  },
});

export const noTryCatchRule = defineRule({
  meta: {
    type: "problem",
    docs: { description: "Do not use try/catch statements." },
    messages: { forbidden: "Do not use try/catch statements." },
  },
  createOnce(context) {
    return {
      TryStatement(node) {
        if (node.handler !== null) context.report({ node, messageId: "forbidden" });
      },
    };
  },
});

function mutationOperator(operator: string): boolean {
  return operator === "=" || operator === "+=" || operator === "-=";
}

export const noArrayMutationRule = defineRule({
  meta: {
    type: "problem",
    docs: {
      description:
        "Reject syntactic mutator calls and indexed or length writes, regardless of receiver type.",
    },
    messages: { forbidden: "Avoid mutating calls and indexed or length writes in this scope." },
  },
  createOnce(context) {
    const report = (node: ESTree.Node) => context.report({ node, messageId: "forbidden" });
    const reportWrite = (member: ESTree.MemberExpression) => {
      if (member.optional) return;
      const parent = member.parent;
      if (
        parent.type === "AssignmentExpression" &&
        parent.left === member &&
        mutationOperator(parent.operator)
      ) {
        report(parent);
      } else if (
        parent.type === "UpdateExpression" &&
        parent.argument === member &&
        (parent.operator === "++" || parent.operator === "--")
      ) {
        report(parent);
      } else if (
        member.computed &&
        parent.type === "UnaryExpression" &&
        parent.operator === "delete" &&
        parent.argument === member
      ) {
        report(parent);
      }
    };

    return {
      CallExpression(node) {
        const member = memberCall(node);
        if (!member) return;
        const method = staticProperty(member);
        if (
          arrayMethods.has(method ?? "") ||
          (zeroArgumentArrayMethods.has(method ?? "") && node.arguments.length === 0)
        ) {
          report(node);
        }
      },
      MemberExpression(node) {
        const property = staticProperty(node);
        if (node.computed) {
          reportWrite(node);
        } else if (property === "length") {
          reportWrite(node);
        }
      },
    };
  },
});
