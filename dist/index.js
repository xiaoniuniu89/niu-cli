#!/usr/bin/env node
import chalk from 'chalk';
import dotenv from 'dotenv';
import { createViteApp } from './commands/createViteApp';
import { createVitePlasmicApp } from './commands/createVitePlasmicApp';
import { plasmicSync } from './commands/plasmicSync';
import { plasmicAuth } from './commands/plasmicAuth';
import { plasmicInit } from './commands/plasmicInit';
import { serveCreateReactAppBuild } from './commands/serveCreateReactAppBuild';
import { plasmicFixImports } from './commands/plasmicFixImports';
import { promptForProjectName } from './utils/promptForProjectName';
import { runReplaceDefaults } from './commands/runCodemods';
import { generateSDK } from './commands/generateSdk';
import { stashAndPull } from './commands/stashAndPull';
dotenv.config();
const args = process.argv.slice(2);
const templateCwd = args[0];
const command = args[1];
let projectNameArg = args[2];
const dirArg = args.find(arg => arg.startsWith('dir='));
const projectDir = dirArg ? dirArg.split('=')[1] : process.env.PROJECT_DIR || '/home/niu/stash';
console.log(command);
// Check if vanilla=true is specified
let isVanilla = false;
if (projectNameArg && projectNameArg.includes('vanilla=true')) {
    isVanilla = true;
    projectNameArg = projectNameArg.replace('vanilla=true', '').trim();
}
switch (command) {
    case 'stash-and-pull':
    case 'stash':
        await stashAndPull(templateCwd);
        break;
    case 'create-vite':
        if (!projectNameArg) {
            const projectName = await promptForProjectName();
            createViteApp(projectName, projectDir, { vanilla: isVanilla });
        }
        else {
            createViteApp(projectNameArg, projectDir, { vanilla: isVanilla });
        }
        break;
    case 'create-vite-plasmic-app':
    case 'vpa':
        if (!projectNameArg) {
            const projectName = await promptForProjectName();
            createVitePlasmicApp(projectName, projectDir);
        }
        else {
            createVitePlasmicApp(projectNameArg, projectDir);
        }
        break;
    case 'test':
        console.log(templateCwd);
        break;
    case 'sync':
        await plasmicSync(templateCwd);
        break;
    case 'auth':
        await plasmicAuth();
        break;
    case 'fix-imports':
        await plasmicFixImports(templateCwd);
        break;
    case 'init':
        await plasmicInit(templateCwd);
        break;
    case 'eject':
        runReplaceDefaults(templateCwd);
        break;
    case 'serve-cra-build':
        await serveCreateReactAppBuild(templateCwd);
        break;
    case 'generate-sdk':
        await generateSDK(templateCwd);
        break;
    default:
        console.log(chalk.red('Unknown command'));
        console.log('Usage:');
        console.log('  niu create-vite [projectName] [dir=/path/to/dir] [vanilla=true]');
        console.log('  niu create-vite-plasmic-app [projectName] [dir=/path/to/dir]');
        console.log('  niu create-vite-vanilla [projectName] [dir=/path/to/dir]');
        process.exit(1);
}
