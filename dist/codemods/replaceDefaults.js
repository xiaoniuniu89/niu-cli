// src/codemods/replaceDefaults.ts
function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);
  if (file.path.endsWith("App.tsx")) {
    root.find(j.ImportDeclaration).remove();
    const imports = [
      `import { PlasmicRootProvider } from '@plasmicapp/react-web';`,
      `import { PlasmicCanvasHost } from '@plasmicapp/react-web/lib/host';`,
      `import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';`
    ];
    imports.forEach((importStatement) => {
      root.get().node.program.body.unshift(j.template.statement([importStatement]));
    });
    root.find(j.FunctionDeclaration, { id: { name: "App" } }).forEach((path) => {
      const newFunction = j.functionDeclaration(
        path.node.id,
        path.node.params,
        j.blockStatement([
          j.returnStatement(
            j.jsxElement(
              j.jsxOpeningElement(j.jsxIdentifier("PlasmicRootProvider"), []),
              j.jsxClosingElement(j.jsxIdentifier("PlasmicRootProvider")),
              [
                j.jsxElement(
                  j.jsxOpeningElement(j.jsxIdentifier("Router"), []),
                  j.jsxClosingElement(j.jsxIdentifier("Router")),
                  [
                    j.jsxElement(
                      j.jsxOpeningElement(j.jsxIdentifier("Routes"), []),
                      j.jsxClosingElement(j.jsxIdentifier("Routes")),
                      [
                        j.jsxElement(
                          j.jsxOpeningElement(j.jsxIdentifier("Route"), [
                            j.jsxAttribute(
                              j.jsxIdentifier("path"),
                              j.literal("/plasmic-host")
                            ),
                            j.jsxAttribute(
                              j.jsxIdentifier("element"),
                              j.jsxExpressionContainer(
                                j.jsxElement(
                                  j.jsxOpeningElement(j.jsxIdentifier("PlasmicCanvasHost"), [], true),
                                  null,
                                  []
                                )
                              )
                            )
                          ]),
                          j.jsxClosingElement(j.jsxIdentifier("Route")),
                          []
                        )
                      ]
                    )
                  ]
                )
              ]
            )
          )
        ])
      );
      j(path).replaceWith(newFunction);
    });
  }
  if (file.path.endsWith("main.tsx")) {
    root.find(j.ImportDeclaration, { source: { value: "./index.css" } }).remove();
  }
  return root.toSource();
}
export {
  transformer as default
};
