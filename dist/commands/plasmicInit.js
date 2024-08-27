import chalk from 'chalk';
import { executeCommand } from '../utils/executeCommand';
export async function plasmicInit(projectPath) {
    try {
        await executeCommand('plasmic', ['init', '--src-dir', 'src/generated', '--yes'], projectPath);
    }
    catch (error) {
        console.error(chalk.red(`Error initialising plasmic: ${error.message}`));
    }
    finally {
        process.exit(1);
    }
}
