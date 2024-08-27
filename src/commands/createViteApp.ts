import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import {executeCommand} from '../utils/executeCommand'
import 'dotenv/config'

export async function createViteApp(projectName: string, projectDir: string, options: { vanilla?: boolean } = {}) {
  const pckm = process.env.NIU_CLI_PCKM || 'npm'

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

    const npmrcContent = `registry=https://registry.npmjs.org/`
    const npmrcPath = path.join(projectPath, '.npmrc');
    fs.writeFileSync(npmrcPath, npmrcContent);
    console.log(chalk.green('.npmrc file created.'));

    // Install initial dependencies
    const initialDependencies = options.vanilla ? [] : ['react', 'react-dom', 'react-router-dom'];
    await executeCommand(pckm, ['install', ...initialDependencies], projectPath);

    console.log(chalk.green('Dependencies installed successfully.'));

      // Install dev dependencies for Prettier and ESLint integration
      console.log(chalk.green('Installing dev dependencies'));
      const devDependencies = ['prettier', 'eslint-config-prettier'];
      await executeCommand(pckm, ['install', '--save-dev', ...devDependencies], projectPath);
  
      // Create .prettierrc file with contents {}
      const prettierrcPath = path.join(projectPath, '.prettierrc');
      fs.writeFileSync(prettierrcPath, '{}');
      console.log(chalk.green('.prettierrc file created.'));
  
      // Create .prettierignore file and add src/components/plasmic to it
      const prettierignorePath = path.join(projectPath, '.prettierignore');
      const prettierignoreContent = 'src/generated';
      fs.writeFileSync(prettierignorePath, prettierignoreContent);
      console.log(chalk.green('.prettierignore file created.'));
  
      // Update ESLint configuration to extend Prettier
      const eslintrcPath = path.join(projectPath, '.eslintrc.cjs');
      const eslintrcContent = `module.exports = {
    root: true,
    env: { browser: true, es2020: true },
    extends: [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:react-hooks/recommended",
      "prettier"
    ],
    ignorePatterns: ["dist", ".eslintrc.cjs"],
    parser: "@typescript-eslint/parser",
    plugins: ["react-refresh"],
    rules: {
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  };`;
      fs.writeFileSync(eslintrcPath, eslintrcContent);
      console.log(chalk.green('.eslintrc.cjs updated to extend Prettier.'));


    console.log(chalk.green(`Project ${projectName} created successfully.`));
  } catch (error) {
    console.error(chalk.red(`Error creating Vite project: ${(error as Error).message}`));
    process.exit(1);
  }
}
