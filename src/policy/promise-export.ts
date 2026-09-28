import { defineRule, type ESTree, type SourceCode } from "@oxlint/plugins";

function promiseType(type: ESTree.TSType): boolean {
  return (
    type.type === "TSTypeReference" &&
    type.typeName.type === "Identifier" &&
    type.typeName.name === "Promise" &&
    type.typeArguments?.params.length === 1
  );
}

function promiseFunctionType(type: ESTree.TSType, sourceCode: SourceCode): boolean {
  if (type.type !== "TSFunctionType" || !promiseType(type.returnType.typeAnnotation)) return false;
  const syntax = sourceCode.getText(type);
  return /^\s*\((?!\s*\()/.test(syntax) && /\)\s*=>\s*Promise\s*</.test(syntax);
}

function promiseReturn(
  annotation: ESTree.TSTypeAnnotation | null | undefined,
  sourceCode: SourceCode,
): boolean {
  return (
    annotation !== null &&
    annotation !== undefined &&
    promiseType(annotation.typeAnnotation) &&
    /^:\s*Promise\s*</.test(sourceCode.getText(annotation))
  );
}

function exported(declaration: ESTree.Node): boolean {
  return (
    declaration.parent?.type === "ExportNamedDeclaration" &&
    declaration.parent.declaration === declaration
  );
}

function exportedClass(declaration: ESTree.Node): boolean {
  return (
    exported(declaration) ||
    (declaration.parent?.type === "ExportDefaultDeclaration" &&
      declaration.parent.declaration === declaration)
  );
}

/** Only the directly exported syntax covered by the former ast-grep patterns. */
export const noPromiseExportRule = defineRule({
  meta: {
    type: "suggestion",
    docs: { description: "Review directly exported Promise-shaped declarations and members." },
    messages: {
      promise:
        "Promise-shaped export: keep the foreign Promise contract at a deliberate boundary, or expose an Effect-returning core API.",
    },
  },
  createOnce(context) {
    return {
      ExportNamedDeclaration(node) {
        const declaration = node.declaration;
        if (declaration === null) return;
        if (declaration.type === "FunctionDeclaration") {
          if (
            !declaration.generator &&
            (declaration.typeParameters === null || declaration.typeParameters === undefined) &&
            (declaration.async || promiseReturn(declaration.returnType, context.sourceCode))
          ) {
            context.report({ node, messageId: "promise" });
          }
        } else if (declaration.type === "TSTypeAliasDeclaration") {
          if (
            declaration.typeParameters === null &&
            ((promiseType(declaration.typeAnnotation) &&
              /^Promise\s*</.test(context.sourceCode.getText(declaration.typeAnnotation))) ||
              promiseFunctionType(declaration.typeAnnotation, context.sourceCode))
          ) {
            context.report({ node, messageId: "promise" });
          }
        } else if (declaration.type === "VariableDeclaration" && declaration.kind === "const") {
          const variable = declaration.declarations[0];
          if (variable?.id.type !== "Identifier") return;
          const initializer = variable.init;
          const annotated = variable.id.typeAnnotation?.typeAnnotation;
          const binding = context.sourceCode.getText(variable);
          const afterName = binding.slice(context.sourceCode.getText(variable.id).length);
          const directAsyncArrow = /^\s*=\s*async\s*\(/.test(afterName);
          const directTypedArrow = /^\s*=\s*\((?!\s*\()/.test(afterName);
          const directFunctionAnnotation =
            variable.id.typeAnnotation !== null &&
            variable.id.typeAnnotation !== undefined &&
            /^:\s*\((?!\s*\()/.test(context.sourceCode.getText(variable.id.typeAnnotation));
          if (
            (initializer?.type === "ArrowFunctionExpression" &&
              ((initializer.async && directAsyncArrow) ||
                (directTypedArrow && promiseReturn(initializer.returnType, context.sourceCode)))) ||
            (directFunctionAnnotation &&
              annotated !== null &&
              annotated !== undefined &&
              promiseFunctionType(annotated, context.sourceCode))
          ) {
            context.report({ node, messageId: "promise" });
          }
        }
      },
      TSMethodSignature(node) {
        const owner = node.parent;
        if (
          owner.type === "TSInterfaceBody" &&
          exported(owner.parent) &&
          !node.optional &&
          node.typeParameters === null &&
          promiseReturn(node.returnType, context.sourceCode)
        ) {
          context.report({ node, messageId: "promise" });
        }
      },
      TSPropertySignature(node) {
        const owner = node.parent;
        if (
          owner.type === "TSInterfaceBody" &&
          exported(owner.parent) &&
          !node.optional &&
          !node.readonly &&
          node.typeAnnotation !== null &&
          promiseFunctionType(node.typeAnnotation.typeAnnotation, context.sourceCode)
        ) {
          context.report({ node, messageId: "promise" });
        }
      },
      MethodDefinition(node) {
        const owner = node.parent;
        if (
          owner.type === "ClassBody" &&
          exportedClass(owner.parent) &&
          node.type === "MethodDefinition" &&
          !node.accessibility &&
          !node.optional &&
          (node.value.typeParameters === null || node.value.typeParameters === undefined) &&
          !node.value.generator &&
          (node.value.async ||
            (!node.static && promiseReturn(node.value.returnType, context.sourceCode)))
        ) {
          context.report({ node, messageId: "promise" });
        }
      },
    };
  },
});
