export default function transformer(fileInfo: any, api: any) {
    const j = api.jscodeshift;
    const root = j(fileInfo.source);
  
    try {
      // Derive the component name from the filename
      const fileName = fileInfo.path.split('/').pop().replace('.tsx', '');
      const componentName = `Plasmic${fileName}`;
  
      // Function to remove comments from nodes
      const removeComments = (node: any) => {
        delete node.comments;
        return node;
      };
  
      // Remove all comments
      root.find(j.Node).forEach(path => {
        removeComments(path.node);
      });
  
      // Update import paths
      root.find(j.ImportDeclaration).forEach(path => {
        const importPath = path.node.source.value;
        if (importPath.startsWith('../generated')) {
          path.node.source.value = importPath.replace(
            '../generated',
            '../../generated'
          );
        }
      });
  
      // Find the main function declaration and add the overrides object
      root.find(j.FunctionDeclaration).forEach(path => {
        const functionName = path.node.id?.name;
        if (functionName) {
          const functionBody = path.node.body;
  
          // Create the overrides object without type definition
          const overridesObject = j.variableDeclaration('const', [
            j.variableDeclarator(j.identifier('overrides'), j.objectExpression([]))
          ]);
  
          // Insert the overrides object at the beginning of the function body
          functionBody.body.unshift(overridesObject);
  
          // Add `overrides` as a parameter to the component
          root.find(j.ReturnStatement).forEach(returnPath => {
            const returnStatement = returnPath.node;
            if (returnStatement.argument?.type === 'JSXElement') {
              const jsxElement = j(returnStatement.argument);
      
              jsxElement.find(j.JSXOpeningElement).forEach(openingElementPath => {
                const openingElement = openingElementPath.node;
                openingElement.attributes.push(
                  j.jsxAttribute(
                    j.jsxIdentifier('overrides'),
                    j.jsxExpressionContainer(j.identifier('overrides'))
                  )
                );
              });
            }
          });
        }
      });
  
      // Convert the AST back to source code
      let newSource = root.toSource();
  
      // Use regex to add the type definition to the overrides object
      const typeDefinitionRegex = new RegExp(
        `(const overrides = \\{};)(?!.*const overrides = \\{};)`,
        's'
      );
      const typeDefinitionReplacement = `const overrides: Parameters<typeof ${componentName}>["0"]['overrides'] = {};`;
      newSource = newSource.replace(typeDefinitionRegex, typeDefinitionReplacement);
  
      return newSource;
    } catch (error) {
      console.error('Error in codemod:', error);
      return fileInfo.source;
    }
  }
  