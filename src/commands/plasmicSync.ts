import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { executeCommand } from '../utils/executeCommand';
import { promptForProjectId } from '../utils/promptForPlasmicId';

export async function plasmicSync(projectPath: string) {
  const projectName = path.basename(projectPath);

  console.log(`Project path: ${projectPath}`);
  console.log(`Project name: ${projectName}`);

  // Check if the current directory contains the 'plasmic.json' file
  const plasmicJsonPath = path.join(projectPath, 'plasmic.json');

  let projectId: string;

  if (fs.existsSync(plasmicJsonPath)) {
    const plasmicJson = JSON.parse(fs.readFileSync(plasmicJsonPath, 'utf8'));
    projectId = plasmicJson.projects[0]?.projectId;
  }

  else if (!fs.existsSync(plasmicJsonPath)) {
    projectId = await promptForProjectId();
  }

  await executeCommand('plasmic', ['sync'], projectPath);

  console.log(chalk.green(`Plasmic project ${projectName} synced successfully.`));
}
