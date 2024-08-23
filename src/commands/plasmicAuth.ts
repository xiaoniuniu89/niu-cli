import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { executeCommand } from '../utils/executeCommand';
import { setupComponentFoldersAndRoutes } from './runCodemods';
import { promptForProjectId } from '../utils/promptForPlasmicId'

export async function plasmicAuth () {
  try {
    await executeCommand('plasmic', ['auth'], '');

  } catch (error) {
    console.error(chalk.red(`Error syncing Plasmic project: ${(error as Error).message}`));
  } finally {
    process.exit(1);
  }
}
