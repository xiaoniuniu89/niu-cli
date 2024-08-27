import { API, FileInfo, Options } from 'jscodeshift';

// Define a type for the page components
interface PageComponent {
    name: string;
    path: string;
    url: string;
}

interface TransformerOptions extends Options {
    pagesComponents: PageComponent[];
}

export default function transformer(
    file: FileInfo, 
    api: API, 
    options: TransformerOptions
): string {
    const j = api.jscodeshift;
    const root = j(file.source);
    const pagesComponents = options.pagesComponents;

    // Collect existing imports and routes
    const existingImports = new Set<string>();
    const existingRoutes = new Set<string>();

    root.find(j.ImportDeclaration).forEach(path => {
        existingImports.add(path.node.source.value as string);
    });

    root.find(j.JSXElement, { openingElement: { name: { name: 'Route' } } }).forEach(path => {
        // @ts-ignore
        path.node.openingElement.attributes.forEach(attr => {
        // @ts-ignore
            if (attr.name && attr.name.name === 'path') {
        // @ts-ignore
                existingRoutes.add((attr.value as any).value); // 'attr.value' can be JSXExpression or StringLiteral
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
                        const routePath = component.url;
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
