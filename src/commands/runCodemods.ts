import { run } from 'jscodeshift/src/Runner';
import path from 'path';
import fs from 'fs-extra';

export async function runReplaceDefaults(templateCwd: string) {
  const filesToTransform = [
    path.resolve(templateCwd, 'src/App.tsx'),
    path.resolve(templateCwd, 'src/main.tsx')
    // Add more files or directories as needed
  ];

  const jscodeshiftOptions = {
    parser: 'tsx', // Specify the parser, e.g., 'tsx', 'babel', 'ts', etc.
    dry: false, // Set to true for a dry run without making changes
  };

  await run('/home/niu/Stash/niu-cli/src/codemods/replaceDefaults.ts', filesToTransform, jscodeshiftOptions);

  try {
    fs.unlinkSync(path.resolve(templateCwd, 'src/App.css'));
    console.log('Deleted src/App.css');
  } catch (error) {
    console.error('Error deleting src/App.css:', error);
  }

  try {
    fs.unlinkSync(path.resolve(templateCwd, 'src/index.css'));
    console.log('Deleted src/index.css');
  } catch (error) {
    console.error('Error deleting src/index.css:', error);
  }
}

export async function addRoutesFromPlasmic(templateCwd: string) {
  const plasmicJsonPath = path.resolve(templateCwd, 'plasmic.json');
  let plasmicData;

  try {
    plasmicData = await fs.readJson(plasmicJsonPath);
  } catch (error) {
    console.error('Error reading plasmic.json:', error);
    return;
  }

  const srcDir = plasmicData.srcDir;
  const pagesComponents = [];

  plasmicData.projects.forEach(project => {
    project.components.forEach(component => {
      if (component.componentType === 'page') {
        pagesComponents.push({
          name: component.name,
          path: `./components/${component.name}.tsx`
        });
      }
    });
  });

  if (pagesComponents.length === 0) {
    console.log('No page components found in plasmic.json.');
    return;
  }

  const appTsxPath = path.resolve(templateCwd, 'src/App.tsx');
  const jscodeshiftOptions = {
    parser: 'tsx',
    dry: false,
  };

  await run('/home/niu/Stash/niu-cli/src/codemods/addRoutes.ts', [appTsxPath], { ...jscodeshiftOptions, pagesComponents });
}

// Example usage
// await addRoutesFromPlasmic('/path/to/your/templateCwd');
