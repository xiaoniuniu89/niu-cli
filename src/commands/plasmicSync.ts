import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { executeCommand } from '../utils/executeCommand';
import { addRoutesFromPlasmic } from './runCodemods';

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

    await executeCommand('plasmic', ['sync', '--yes'], projectPath);

    await addRoutesFromPlasmic(projectPath)

    await executeCommand('npx', ['prettier', '.', '--write'], projectPath)

    console.log(chalk.green(`Plasmic project ${projectName} synced successfully.`));
  } catch (error) {
    console.error(chalk.red(`Error syncing Plasmic project: ${(error as Error).message}`));
  }
  finally {
    process.exit(1);
  }
}
