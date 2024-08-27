import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import { executeCommand } from '../utils/executeCommand';
export async function plasmicFixImports(projectPath) {
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
        await executeCommand('plasmic', ['fix-imports'], projectPath);
    }
    catch (error) {
        console.error(chalk.red(`Error fixing imports: ${error.message}`));
    }
    finally {
        process.exit(1);
    }
}
