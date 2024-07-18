#!/usr/bin/env node

import chalk from 'chalk';
import { createViteApp } from './commands/createViteApp';
import { createVitePlasmicApp } from './commands/createVitePlasmicApp';
import {plasmicSync} from './commands/plasmicSync'
import { promptForProjectName } from './utils/promptForProjectName';
import { runRemoveDefaults } from './commands/runCodemods';

const args = process.argv.slice(2);
const templateCwd = args[0];
const command = args[1];
let projectNameArg = args[2];
const dirArg = args.find(arg => arg.startsWith('dir='));
const projectDir = dirArg ? dirArg.split('=')[1] : '/home/niu/Stash';
console.log(command)

// Check if vanilla=true is specified
let isVanilla = false;
if (projectNameArg && projectNameArg.includes('vanilla=true')) {
  isVanilla = true;
  projectNameArg = projectNameArg.replace('vanilla=true', '').trim();
}

switch (command) {
  case 'create-vite':
    if (!projectNameArg) {
      const projectName = await promptForProjectName();
      createViteApp(projectName, projectDir, { vanilla: isVanilla });
    } else {
      createViteApp(projectNameArg, projectDir, { vanilla: isVanilla });
    }
    break;
  case 'create-vite-plasmic-app':
  case 'vpa':
    if (!projectNameArg) {
      const projectName = await promptForProjectName();
      createVitePlasmicApp(projectName, projectDir);
    } else {
      createVitePlasmicApp(projectNameArg, projectDir);
    }
    break;
    case 'test':
      console.log(templateCwd)
      break
    case 'sync':
      await plasmicSync(templateCwd);
      break;
      case 'eject':
        runRemoveDefaults(templateCwd)
      break;
      
  default:
    console.log(chalk.red('Unknown command'));
    console.log('Usage:');
    console.log('  niu create-vite [projectName] [dir=/path/to/dir] [vanilla=true]');
    console.log('  niu create-vite-plasmic-app [projectName] [dir=/path/to/dir]');
    console.log('  niu create-vite-vanilla [projectName] [dir=/path/to/dir]');
    process.exit(1);
}
