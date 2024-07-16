import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { executeCommand } from '../utils/executeCommand';
export async function createViteApp(projectName, projectDir, options = {}) {
    const template = options.vanilla ? 'vanilla-ts' : 'react-swc-ts';
    const projectPath = path.join(projectDir, projectName);
    console.log(chalk.green(`Creating Vite project ${projectName} with template ${template}...`));
    try {
        // Create the project directory if it doesn't exist
        if (!fs.existsSync(projectPath)) {
            fs.mkdirSync(projectPath, { recursive: true });
        }
        // Initialize a new Vite project with package name
        await executeCommand('npm', ['init', 'vite@latest', '.', '--', '--template', template, '--name', projectName], projectPath);
        console.log(chalk.green(`Vite project initialized successfully with ${template} template.`));
        // Install initial dependencies
        const initialDependencies = options.vanilla ? [] : ['react', 'react-dom', 'react-router-dom'];
        await executeCommand('npm', ['install', ...initialDependencies], projectPath);
        console.log(chalk.green('Dependencies installed successfully.'));
        console.log(chalk.green(`Project ${projectName} created successfully.`));
    }
    catch (error) {
        console.error(chalk.red(`Error creating Vite project: ${error.message}`));
        process.exit(1);
    }
}
