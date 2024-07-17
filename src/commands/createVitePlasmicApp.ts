#!/usr/bin/env node

import chalk from 'chalk';
import { executeCommand } from '../utils/executeCommand';
import {promptForProjectId} from '../utils/promptForPlasmicId'
import fs from 'fs';
import path from 'path';

export async function createVitePlasmicApp(projectName: string, projectDir: string) {
  const projectPath = path.join(projectDir, projectName);

  console.log(chalk.green(`Creating project ${projectName} at ${projectPath}...`));

  // Create the project directory if it doesn't exist
  if (!fs.existsSync(projectPath)) {
    fs.mkdirSync(projectPath, { recursive: true });
  } else {
    console.error(chalk.red(`Project directory ${projectPath} already exists.`));
    process.exit(1);
  }

  try {
    // Initialize a new Vite project in the project directory with react-swc-ts template
    await executeCommand('npm', ['init', 'vite@latest', '.', '--', '--template', 'react-swc-ts', '--name', projectName], projectPath);

    console.log(chalk.green('Vite project initialized successfully with react-swc-ts template.'));
    console.log(chalk.green('Installing dependencies'));

    // Install additional dependencies including @plasmicapp/loader, @plasmicapp/cli, and react-router-dom
    const dependencies = ['@plasmicapp/loader', 'react-router-dom'];
    await executeCommand('npm', ['install', ...dependencies], projectPath);
    console.log(chalk.green('Installing @plasmicapp/react-web'));

    await executeCommand('npm', ['install', '--ignore-scripts', '@plasmicapp/react-web'], projectPath);

    console.log(chalk.green('Dependencies installed successfully.'));

    // Update package.json scripts to include 'plasmic' script
    const packageJsonPath = path.join(projectPath, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageJson.scripts['plasmic'] = 'plasmic sync';
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

    console.log(chalk.green(`Project ${projectName} created successfully.`));

    // Create .env file and add PLASMICID and PLASMICTOKEN placeholders
    const envFilePath = path.join(projectPath, '.env');
    const envContent = `PLASMICID=YOURID\nPLASMICTOKEN=YOURTOKEN\n`;
    fs.writeFileSync(envFilePath, envContent);
    console.log(chalk.green('.env file created with placeholders for PLASMICID and PLASMICTOKEN.'));

    // Create .gitignore file if it doesn't exist and add .env and node_modules to it
    const gitignoreFilePath = path.join(projectPath, '.gitignore');
    let gitignoreContent = '';
    if (fs.existsSync(gitignoreFilePath)) {
      gitignoreContent = fs.readFileSync(gitignoreFilePath, 'utf8');
    }
    if (!gitignoreContent.includes('.env')) {
      gitignoreContent += '\n.env';
    }
    if (!gitignoreContent.includes('node_modules')) {
      gitignoreContent += '\nnode_modules';
    }
    fs.writeFileSync(gitignoreFilePath, gitignoreContent);
    console.log(chalk.green('.gitignore updated to include .env and node_modules.'));

    // sync with plasmic 
    const plasmicProjectId = await promptForProjectId();

    await executeCommand('plasmic', ['sync', '-p', plasmicProjectId, '--yes'], projectPath);

    console.log(chalk.green(`Plasmic project ${projectName} synced successfully.`));
    
  } catch (error) {
    console.error(chalk.red(`Error: ${(error as Error).message}`));
    process.exit(1);
  }
}
  