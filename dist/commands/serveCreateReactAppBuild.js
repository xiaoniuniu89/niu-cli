import chalk from 'chalk';
import { executeCommand } from '../utils/executeCommand';
export async function serveCreateReactAppBuild(projectPath) {
    try {
        await executeCommand('serve', ['-s', 'build'], projectPath);
    }
    catch (error) {
        console.error(chalk.red(`Error serving project: ${error.message}`));
    }
    finally {
        process.exit(1);
    }
}
