// commands/runCodemods.ts
import { run } from 'jscodeshift/src/Runner';
import path from 'path'
import fs from 'fs-extra';

export async function runRemoveDefaults(templateCwd: string) {
  const filesToTransform = [
    path.resolve(templateCwd, 'src/App.tsx'),
    path.resolve(templateCwd, 'src/main.tsx')
    // Add more files or directories as needed
  ];

  const jscodeshiftOptions = {
    parser: 'tsx', // Specify the parser, e.g., 'tsx', 'babel', 'ts', etc.
    dry: false, // Set to true for a dry run without making changes
  };

  await run('/home/niu/Stash/niu-cli/src/codemods/removeDefaults.ts', filesToTransform, jscodeshiftOptions);

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
