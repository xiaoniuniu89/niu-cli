import readline from 'readline';
import chalk from 'chalk';
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
export function promptForProjectName() {
    return new Promise((resolve, reject) => {
        rl.question('What do you want to call the project? ', (projectName) => {
            if (!projectName) {
                console.error(chalk.red('Project name cannot be empty.'));
                promptForProjectName().then(resolve).catch(reject); // Prompt again
            }
            else {
                rl.close();
                resolve(projectName.trim());
            }
        });
    });
}
