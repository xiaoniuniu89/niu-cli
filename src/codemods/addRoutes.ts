export default function transformer(file, api, options) {
    const j = api.jscodeshift;
    const root = j(file.source);
    const pagesComponents = options.pagesComponents;

    // Add new import declarations for page components
    pagesComponents.forEach(component => {
        const importStatement = `import ${component.name} from '${component.path}';`;
        root.get().node.program.body.unshift(j.template.statement([importStatement]));
    });

    // Find the Router in the App function and add new Routes
    root.find(j.FunctionDeclaration, { id: { name: 'App' } })
        .forEach(path => {
            j(path).find(j.JSXElement, { openingElement: { name: { name: 'Router' } } })
                .forEach(routerPath => {
                    const routesElement = j(routerPath).find(j.JSXElement, { openingElement: { name: { name: 'Routes' } } }).get();

                    pagesComponents.forEach(component => {
                        const newRoute = j.jsxElement(
                            j.jsxOpeningElement(j.jsxIdentifier('Route'), [
                                j.jsxAttribute(j.jsxIdentifier('path'), j.literal(`/${component.name.toLowerCase()}`)),
                                j.jsxAttribute(j.jsxIdentifier('element'), j.jsxExpressionContainer(j.jsxElement(
                                    j.jsxOpeningElement(j.jsxIdentifier(component.name), [], true),
                                    null,
                                    []
                                )))
                            ]),
                            j.jsxClosingElement(j.jsxIdentifier('Route')),
                            []
                        );

                        routesElement.node.children.push(newRoute);
                    });
                });
        });

    return root.toSource();
}
