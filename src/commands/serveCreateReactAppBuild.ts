import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { executeCommand } from '../utils/executeCommand';

export async function serveCreateReactAppBuild(projectPath: string) {
  try {

    await executeCommand('serve', ['-s', 'build'], projectPath);

  } catch (error) {
    console.error(chalk.red(`Error serving project: ${(error as Error).message}`));
  }
  finally {
    process.exit(1);
  }
}
