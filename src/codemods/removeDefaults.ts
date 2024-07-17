export default function transformer(file, api) {
    const j = api.jscodeshift;
    const root = j(file.source);
  
    // Transformer for App.tsx
    if (file.path.endsWith('App.tsx')) {
      // Remove all import declarations
      root.find(j.ImportDeclaration).remove();
  
      // Find the App function and replace its body
      root.find(j.FunctionDeclaration, { id: { name: 'App' } })
        .forEach(path => {
          const newFunction = j.functionDeclaration(
            path.node.id,
            path.node.params,
            j.blockStatement([
              j.returnStatement(
                j.jsxFragment(j.jsxOpeningFragment(), j.jsxClosingFragment(), [])
              )
            ])
          );
          j(path).replaceWith(newFunction);
        });
    }
  
    // Transformer for index.tsx
    if (file.path.endsWith('main.tsx')) {
      // Remove the import for './index.css'
      root.find(j.ImportDeclaration, { source: { value: './index.css' } }).remove();
    }
  
    return root.toSource();
  }
  