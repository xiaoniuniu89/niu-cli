import chalk from 'chalk';
import { executeCommand } from '../utils/executeCommand';
export async function stashAndPull(projectPath) {
    try {
        await executeCommand('git', ['stash'], projectPath);
        await executeCommand('git', ['pull'], projectPath);
        await executeCommand('git', ['stash', 'apply', 'stash@{0}'], projectPath);
    }
    catch (error) {
        console.error(chalk.red(`Error syncing Plasmic project: ${error.message}`));
    }
    finally {
        process.exit(1);
    }
}
