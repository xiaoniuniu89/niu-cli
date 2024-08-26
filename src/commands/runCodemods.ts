import { run } from 'jscodeshift/src/Runner';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Component {
  name?: string;
  path?: string;
  url?: string;
  componentType?: string;
}

interface Project {
  components: Component[];
}

interface PlasmicJsonContents {
  srcDir: string;
  projects: Project[];
}

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

  const codemodPath = path.resolve(__dirname, '../codemods/replaceDefaults.ts');
  await run(codemodPath, filesToTransform, jscodeshiftOptions);

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

export async function setupComponentFoldersAndRoutes(templateCwd: string) {
  const plasmicJsonPath = path.resolve(templateCwd, 'plasmic.json');
  let plasmicData: PlasmicJsonContents;

  try {
    plasmicData = await fs.readJson(plasmicJsonPath);
  } catch (error) {
    console.error('Error reading plasmic.json:', error);
    return;
  }

  const srcDir = plasmicData.srcDir;
  const pagesComponents: Component[] = [];

  for (const project of plasmicData.projects) {
    for (const component of project.components) {
      const srcDirConcat = path.resolve(templateCwd, srcDir);
      const componentFile = path.resolve(srcDirConcat, `${component.name}.tsx`);
      const componentDirPath = path.resolve(srcDirConcat, component.name as string);

      if (!(await fs.pathExists(path.resolve(srcDirConcat, component.name as string)))) {
        await fs.ensureDir(componentDirPath);
        const newComponentFile = path.resolve(componentDirPath, `${component.name}.tsx`);
        const indexFile = path.resolve(componentDirPath, 'index.ts');

        if (await fs.pathExists(componentFile)) {
          await fs.move(componentFile, newComponentFile);
        }

        await fs.writeFile(indexFile, `export { default } from './${component.name}';`);

        await runUpdateImportPathsCodemod(newComponentFile);
      }

      if (component.componentType === 'page') {
        pagesComponents.push({
          name: component.name,
          path: `./components/${component.name}`,
          url: component.path,
        });
      }
    }
  }

  if (pagesComponents.length === 0) {
    console.log('No page components found in plasmic.json.');
    return;
  }

  const appTsxPath = path.resolve(templateCwd, 'src/App.tsx');
  const jscodeshiftOptions = {
    parser: 'tsx',
    dry: false,
  };

  const codemodPath = path.resolve(__dirname, '../codemods/addRoutes.ts');
  await run(codemodPath, [appTsxPath], { ...jscodeshiftOptions, pagesComponents });
}

export async function runUpdateImportPathsCodemod(file: string) {
  const jscodeshiftOptions = {
    parser: 'tsx',
    dry: false,
  };

  const codemodPath = path.resolve(__dirname, '../codemods/updatePlasmicImportPath.ts');
  await run(codemodPath, [file], jscodeshiftOptions);
}
