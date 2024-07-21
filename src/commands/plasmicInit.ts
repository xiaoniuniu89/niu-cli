import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { executeCommand } from '../utils/executeCommand';

export async function plasmicInit(projectPath: string) {
  try {
    const projectName = path.basename(projectPath);

    await executeCommand('plasmic', ['init', '--src-dir', 'src/generated','--yes'], projectPath);

  } catch (error) {
    console.error(chalk.red(`Error initialising plasmic: ${(error as Error).message}`));
  }
  finally {
    process.exit(1);
  }
}
