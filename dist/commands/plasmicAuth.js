import chalk from 'chalk';
import { executeCommand } from '../utils/executeCommand';
export async function plasmicAuth() {
    try {
        await executeCommand('plasmic', ['auth'], '');
    }
    catch (error) {
        console.error(chalk.red(`Error syncing Plasmic project: ${error.message}`));
    }
    finally {
        process.exit(1);
    }
}
