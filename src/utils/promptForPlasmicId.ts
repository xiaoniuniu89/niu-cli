import readline from 'readline';

export async function promptForProjectId(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question('Enter the Plasmic project ID: ', (projectId) => {
      rl.close();
      resolve(projectId);
    });
  });
}
