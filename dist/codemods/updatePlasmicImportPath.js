// src/codemods/updatePlasmicImportPath.ts
function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);
  try {
    const fileName = fileInfo.path.split("/").pop()?.replace(".tsx", "");
    if (!fileName) throw new Error("Could not derive component name from file path.");
    const componentName = `Plasmic${fileName}`;
    const removeComments = (node) => {
      delete node.comments;
      return node;
    };
    root.find(j.Node).forEach((path) => {
      removeComments(path.node);
    });
    root.find(j.ImportDeclaration).forEach((path) => {
      const importPath = path.node.source.value;
      if (typeof importPath === "string" && importPath.startsWith("../generated")) {
        path.node.source.value = importPath.replace("../generated", "../../generated");
      }
    });
    root.find(j.FunctionDeclaration).forEach((path) => {
      const functionName = path.node.id?.name;
      if (functionName) {
        const functionBody = path.node.body;
        const overridesObject = j.variableDeclaration("const", [
          j.variableDeclarator(j.identifier("overrides"), j.objectExpression([]))
        ]);
        functionBody.body.unshift(overridesObject);
        root.find(j.ReturnStatement).forEach((returnPath) => {
          const returnStatement = returnPath.node;
          if (returnStatement.argument?.type === "JSXElement") {
            const jsxElement = j(returnStatement.argument);
            jsxElement.find(j.JSXOpeningElement).forEach((openingElementPath) => {
              const openingElement = openingElementPath.node;
              openingElement.attributes && openingElement.attributes.push(
                j.jsxAttribute(
                  j.jsxIdentifier("overrides"),
                  j.jsxExpressionContainer(j.identifier("overrides"))
                )
              );
            });
          }
        });
      }
    });
    let newSource = root.toSource();
    const typeDefinitionRegex = new RegExp(
      `const overrides = {};`,
      "s"
    );
    const typeDefinitionReplacement = `const overrides: Parameters<typeof ${componentName}>[0]['overrides'] = {};`;
    newSource = newSource.replace(typeDefinitionRegex, typeDefinitionReplacement);
    return newSource;
  } catch (error) {
    console.error("Error in codemod:", error);
    return fileInfo.source;
  }
}
export {
  transformer as default
};
