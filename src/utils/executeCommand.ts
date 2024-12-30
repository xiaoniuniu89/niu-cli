import path from 'path';
import { fileURLToPath } from 'url';
import { execa } from 'execa';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Suppose your CLI’s root (with package.json + node_modules) is 2 levels up from dist
const cliRoot = path.join(__dirname, '..');

export async function executeCommand(command: string, args: string[], cwd: string) {
  return new Promise((resolve, reject) => {
    // Only set preferLocal if it is 'plasmic'
    const execaOptions = (command === 'plasmic')
      ? {
          cwd,
          preferLocal: true,
          localDir: cliRoot,  // <--- The important part
        }
      : { cwd };

    console.log("Running command:", command, args.join(' '), "with localDir:", execaOptions.localDir);

    const childProcess = execa(command, args, execaOptions);
    childProcess.stdout?.pipe(process.stdout);
    childProcess.stderr?.pipe(process.stderr);

    childProcess.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command '${command} ${args.join(" ")}' exited with code ${code}`));
      }
    });
  });
}
