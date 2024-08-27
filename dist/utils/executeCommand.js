import { execa } from 'execa';
export async function executeCommand(command, args, cwd) {
    return new Promise((resolve, reject) => {
        const childProcess = execa(command, args, { cwd });
        // Forward stdout and stderr to the parent process
        childProcess.stdout?.pipe(process.stdout);
        childProcess.stderr?.pipe(process.stderr);
        childProcess.on('exit', (code, signal) => {
            if (code === 0) {
                resolve();
            }
            else {
                reject(new Error(`Command '${command} ${args.join(' ')}' exited with code ${code}`));
            }
        });
    });
}
