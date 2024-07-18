export default function transformer(file, api, options) {
    const j = api.jscodeshift;
    const root = j(file.source);
    const pagesComponents = options.pagesComponents;

    // Collect existing imports and routes
    const existingImports = new Set();
    const existingRoutes = new Set();

    root.find(j.ImportDeclaration).forEach(path => {
        existingImports.add(path.node.source.value);
    });

    root.find(j.JSXElement, { openingElement: { name: { name: 'Route' } } }).forEach(path => {
        path.node.openingElement.attributes.forEach(attr => {
            if (attr.name && attr.name.name === 'path') {
                existingRoutes.add(attr.value.value);
            }
        });
    });

    // Add new import declarations for page components if they do not exist
    pagesComponents.forEach(component => {
        const componentPath = component.path.replace(/^\.\/src\//, './'); // Ensure relative path format
        if (!existingImports.has(componentPath)) {
            const importStatement = `import ${component.name} from '${componentPath}';`;
            root.get().node.program.body.unshift(j.template.statement([importStatement]));
        }
    });

    // Find the Router in the App function and add new Routes if they do not exist
    root.find(j.FunctionDeclaration, { id: { name: 'App' } })
        .forEach(path => {
            j(path).find(j.JSXElement, { openingElement: { name: { name: 'Router' } } })
                .forEach(routerPath => {
                    const routesElement = j(routerPath).find(j.JSXElement, { openingElement: { name: { name: 'Routes' } } }).get();

                    pagesComponents.forEach(component => {
                        const routePath = `/${component.name.toLowerCase()}`;
                        if (!existingRoutes.has(routePath)) {
                            const newRoute = j.jsxElement(
                                j.jsxOpeningElement(j.jsxIdentifier('Route'), [
                                    j.jsxAttribute(j.jsxIdentifier('path'), j.literal(routePath)),
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
                        }
                    });
                });
        });

    return root.toSource();
}
