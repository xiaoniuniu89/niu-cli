#!/usr/bin/env node
import chalk from 'chalk';
import { executeCommand } from '../utils/executeCommand';
import fs from 'fs';
import path from 'path';
export async function createVitePlasmicApp(projectName, projectDir) {
    const projectPath = path.join(projectDir, projectName);
    console.log(chalk.green(`Creating project ${projectName} at ${projectPath}...`));
    // Create the project directory if it doesn't exist
    if (!fs.existsSync(projectPath)) {
        fs.mkdirSync(projectPath, { recursive: true });
    }
    else {
        console.error(chalk.red(`Project directory ${projectPath} already exists.`));
        process.exit(1);
    }
    try {
        // Initialize a new Vite project in the project directory with react-swc-ts template
        await executeCommand('npm', ['init', 'vite@latest', '.', '--', '--template', 'react-swc-ts'], projectPath);
        console.log(chalk.green('Vite project initialized successfully with react-swc-ts template.'));
        // Install additional dependencies including @plasmicapp/loader, @plasmicapp/cli, and react-router-dom
        const dependencies = ['@plasmicapp/loader', '@plasmicapp/cli', 'react-router-dom'];
        await executeCommand('npm', ['install', ...dependencies], projectPath);
        console.log(chalk.green('Dependencies installed successfully.'));
        // Update package.json scripts to include 'plasmic' script
        const packageJsonPath = path.join(projectPath, 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        packageJson.scripts['plasmic'] = 'plasmic sync';
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log(chalk.green(`Project ${projectName} created successfully.`));
    }
    catch (error) {
        console.error(chalk.red(`Error: ${error.message}`));
        process.exit(1);
    }
}
