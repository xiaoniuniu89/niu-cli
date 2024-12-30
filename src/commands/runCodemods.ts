import { run } from 'jscodeshift/src/Runner.js';
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
  const files = [
    path.resolve(templateCwd, 'src/App.tsx'),
    path.resolve(templateCwd, 'src/main.tsx')
  ];
  await run(path.join(__dirname, 'codemods', 'replaceDefaults.js'), files, { parser: 'tsx', dry: false });
  try {
    fs.unlinkSync(path.resolve(templateCwd, 'src/App.css'));
  } catch {}
  try {
    fs.unlinkSync(path.resolve(templateCwd, 'src/index.css'));
  } catch {}
}

export async function setupComponentFoldersAndRoutes(templateCwd: string) {
  const plasmicJsonPath = path.resolve(templateCwd, 'plasmic.json');
  let plasmicData: PlasmicJsonContents;
  try {
    plasmicData = await fs.readJson(plasmicJsonPath);
  } catch {
    return;
  }
  const pages: Component[] = [];
  for (const project of plasmicData.projects) {
    for (const component of project.components) {
      const srcDirPath = path.resolve(templateCwd, plasmicData.srcDir);
      const componentFile = path.resolve(srcDirPath, `${component.name}.tsx`);
      const componentDirPath = path.resolve(srcDirPath, component.name || '');
      if (!(await fs.pathExists(componentDirPath))) {
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
        pages.push({ name: component.name, path: `./components/${component.name}`, url: component.path });
      }
    }
  }
  if (!pages.length) {
    return;
  }
  const appTsxPath = path.resolve(templateCwd, 'src/App.tsx');
  await run(
    path.join(__dirname, 'codemods', 'addRoutes.js'),
    [appTsxPath],
    { parser: 'tsx', dry: false, pagesComponents: pages }
  );
}

export async function runUpdateImportPathsCodemod(file: string) {
  await run(
    path.join(__dirname, 'codemods', 'updatePlasmicImportPath.js'),
    [file],
    { parser: 'tsx', dry: false }
  );
}
