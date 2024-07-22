import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { executeCommand } from '../utils/executeCommand';
import { setupComponentFoldersAndRoutes } from './runCodemods';
import { promptForProjectId } from '../utils/promptForPlasmicId'

export async function plasmicSync(projectPath: string) {
  try {
    const projectName = path.basename(projectPath);

    // Check if the current directory contains the 'plasmic.json' file
    const plasmicJsonPath = path.join(projectPath, 'plasmic.json');

    if (!fs.existsSync(plasmicJsonPath)) {
      console.log(chalk.red('Error: plasmic.json not found in the current directory.'));
      console.log(chalk.yellow('Cannot sync without a valid plasmic.json file.'));
      process.exit(1);
    }
    console.log(chalk.green(`Found plasmic.json for ${projectName}.`));

    const plasmicConfig = JSON.parse(fs.readFileSync(plasmicJsonPath, 'utf-8'));
    let projectId = plasmicConfig.projects[0].projectId;

    if (!projectId) {
      projectId = await promptForProjectId();
      await executeCommand('plasmic', ['sync', '-p', projectId, '--yes'], projectPath);
    } else {
      await executeCommand('plasmic', ['sync', '--yes'], projectPath);
    }

    console.log(chalk.green(`Plasmic project ${projectName} synced successfully.`));

    console.log(chalk.green(`Updating imports, creating folder structure and formatting code`));

    await setupComponentFoldersAndRoutes(projectPath);

    await executeCommand('npx', ['prettier', '.', '--write'], projectPath);

  } catch (error) {
    console.error(chalk.red(`Error syncing Plasmic project: ${(error as Error).message}`));
  } finally {
    process.exit(1);
  }
}
