#!/usr/bin/env node

// src/index.ts
import chalk10 from "chalk";
import dotenv2 from "dotenv";

// src/commands/createViteApp.ts
import chalk from "chalk";
import fs from "fs";
import path from "path";

// src/utils/executeCommand.ts
import { execa } from "execa";
async function executeCommand(command2, args2, cwd) {
  return new Promise((resolve, reject) => {
    const childProcess = execa(command2, args2, { cwd });
    childProcess.stdout?.pipe(process.stdout);
    childProcess.stderr?.pipe(process.stderr);
    childProcess.on("exit", (code, signal) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command '${command2} ${args2.join(" ")}' exited with code ${code}`));
      }
    });
  });
}

// src/commands/createViteApp.ts
import "dotenv/config";
async function createViteApp(projectName, projectDir2, options = {}) {
  const pckm = process.env.PCKM || "npm";
  const template = options.vanilla ? "vanilla-ts" : "react-swc-ts";
  const projectPath = path.join(projectDir2, projectName);
  console.log(chalk.green(`Creating Vite project ${projectName} with template ${template}...`));
  try {
    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath, { recursive: true });
    }
    await executeCommand("npm", ["init", "vite@latest", ".", "--", "--template", template, "--name", projectName], projectPath);
    console.log(chalk.green(`Vite project initialized successfully with ${template} template.`));
    const npmrcContent = `registry=https://registry.npmjs.org/`;
    const npmrcPath = path.join(projectPath, ".npmrc");
    fs.writeFileSync(npmrcPath, npmrcContent);
    console.log(chalk.green(".npmrc file created."));
    const initialDependencies = options.vanilla ? [] : ["react", "react-dom", "react-router-dom"];
    await executeCommand(pckm, ["install", ...initialDependencies], projectPath);
    console.log(chalk.green("Dependencies installed successfully."));
    console.log(chalk.green("Installing dev dependencies"));
    const devDependencies = ["prettier", "eslint-config-prettier"];
    await executeCommand(pckm, ["install", "--save-dev", ...devDependencies], projectPath);
    const prettierrcPath = path.join(projectPath, ".prettierrc");
    fs.writeFileSync(prettierrcPath, "{}");
    console.log(chalk.green(".prettierrc file created."));
    const prettierignorePath = path.join(projectPath, ".prettierignore");
    const prettierignoreContent = "src/generated";
    fs.writeFileSync(prettierignorePath, prettierignoreContent);
    console.log(chalk.green(".prettierignore file created."));
    const eslintrcPath = path.join(projectPath, ".eslintrc.cjs");
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
    console.log(chalk.green(".eslintrc.cjs updated to extend Prettier."));
    console.log(chalk.green(`Project ${projectName} created successfully.`));
  } catch (error) {
    console.error(chalk.red(`Error creating Vite project: ${error.message}`));
    process.exit(1);
  }
}

// src/commands/createVitePlasmicApp.ts
import chalk2 from "chalk";

// src/utils/promptForPlasmicId.ts
import readline from "readline";
async function promptForProjectId() {
  const rl2 = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise((resolve) => {
    rl2.question("Enter the Plasmic project ID: ", (projectId) => {
      rl2.close();
      resolve(projectId);
    });
  });
}

// src/commands/runCodemods.ts
import { run } from "jscodeshift/src/Runner";
import path2 from "path";
import fs2 from "fs-extra";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path2.dirname(__filename);
async function runReplaceDefaults(templateCwd2) {
  const filesToTransform = [
    path2.resolve(templateCwd2, "src/App.tsx"),
    path2.resolve(templateCwd2, "src/main.tsx")
    // Add more files or directories as needed
  ];
  const jscodeshiftOptions = {
    parser: "tsx",
    // Specify the parser, e.g., 'tsx', 'babel', 'ts', etc.
    dry: false
    // Set to true for a dry run without making changes
  };
  const codemodPath = path2.resolve(__dirname, "../codemods/replaceDefaults.ts");
  await run(codemodPath, filesToTransform, jscodeshiftOptions);
  try {
    fs2.unlinkSync(path2.resolve(templateCwd2, "src/App.css"));
    console.log("Deleted src/App.css");
  } catch (error) {
    console.error("Error deleting src/App.css:", error);
  }
  try {
    fs2.unlinkSync(path2.resolve(templateCwd2, "src/index.css"));
    console.log("Deleted src/index.css");
  } catch (error) {
    console.error("Error deleting src/index.css:", error);
  }
}
async function setupComponentFoldersAndRoutes(templateCwd2) {
  const plasmicJsonPath = path2.resolve(templateCwd2, "plasmic.json");
  let plasmicData;
  try {
    plasmicData = await fs2.readJson(plasmicJsonPath);
  } catch (error) {
    console.error("Error reading plasmic.json:", error);
    return;
  }
  const srcDir = plasmicData.srcDir;
  const pagesComponents = [];
  for (const project of plasmicData.projects) {
    for (const component of project.components) {
      const srcDirConcat = path2.resolve(templateCwd2, srcDir);
      const componentFile = path2.resolve(srcDirConcat, `${component.name}.tsx`);
      const componentDirPath = path2.resolve(srcDirConcat, component.name);
      if (!await fs2.pathExists(path2.resolve(srcDirConcat, component.name))) {
        await fs2.ensureDir(componentDirPath);
        const newComponentFile = path2.resolve(componentDirPath, `${component.name}.tsx`);
        const indexFile = path2.resolve(componentDirPath, "index.ts");
        if (await fs2.pathExists(componentFile)) {
          await fs2.move(componentFile, newComponentFile);
        }
        await fs2.writeFile(indexFile, `export { default } from './${component.name}';`);
        await runUpdateImportPathsCodemod(newComponentFile);
      }
      if (component.componentType === "page") {
        pagesComponents.push({
          name: component.name,
          path: `./components/${component.name}`,
          url: component.path
        });
      }
    }
  }
  if (pagesComponents.length === 0) {
    console.log("No page components found in plasmic.json.");
    return;
  }
  const appTsxPath = path2.resolve(templateCwd2, "src/App.tsx");
  const jscodeshiftOptions = {
    parser: "tsx",
    dry: false
  };
  const codemodPath = path2.resolve(__dirname, "../codemods/addRoutes.ts");
  await run(codemodPath, [appTsxPath], { ...jscodeshiftOptions, pagesComponents });
}
async function runUpdateImportPathsCodemod(file) {
  const jscodeshiftOptions = {
    parser: "tsx",
    dry: false
  };
  const codemodPath = path2.resolve(__dirname, "../codemods/updatePlasmicImportPath.ts");
  await run(codemodPath, [file], jscodeshiftOptions);
}

// src/commands/createVitePlasmicApp.ts
import fs3 from "fs";
import path3 from "path";
import "dotenv/config";
async function createVitePlasmicApp(projectName, projectDir2) {
  const projectPath = path3.join(projectDir2, projectName);
  const pckm = process.env.PCKM || "npm";
  console.log(chalk2.green(`Creating project ${projectName} at ${projectPath}...`));
  if (!fs3.existsSync(projectPath)) {
    fs3.mkdirSync(projectPath, { recursive: true });
  } else {
    console.error(chalk2.red(`Project directory ${projectPath} already exists.`));
    process.exit(1);
  }
  try {
    const plasmicProjectId = await promptForProjectId();
    const viteProjectName = projectName.toLowerCase();
    console.log(chalk2.green("Scaffolding project with vite dependencies"));
    await executeCommand("npm", ["init", "vite@latest", ".", "--", "--template", "react-swc-ts", "--name", viteProjectName], projectPath);
    console.log(chalk2.green("Vite project with plasmic initialized successfully with react-swc-ts template."));
    const npmrcContent = `registry=https://registry.npmjs.org/`;
    const npmrcPath = path3.join(projectPath, ".npmrc");
    fs3.writeFileSync(npmrcPath, npmrcContent);
    console.log(chalk2.green(".npmrc file created."));
    console.log(chalk2.green("Installing dependencies"));
    const dependencies = ["@plasmicapp/loader", "react-router-dom", "@plasmicapp/react-web"];
    await executeCommand(pckm, ["install"], projectPath);
    console.log(chalk2.green("Installing @plasmicapp dependencies"));
    await executeCommand(pckm, ["install", ...dependencies, "--ignore-scripts"], projectPath);
    console.log(chalk2.green("Dependencies installed successfully."));
    console.log(chalk2.green("Installing dev dependencies"));
    const devDependencies = ["prettier", "eslint-config-prettier"];
    await executeCommand(pckm, ["install", "--save-dev", ...devDependencies], projectPath);
    const prettierrcPath = path3.join(projectPath, ".prettierrc");
    fs3.writeFileSync(prettierrcPath, "{}");
    console.log(chalk2.green(".prettierrc file created."));
    const prettierignorePath = path3.join(projectPath, ".prettierignore");
    const prettierignoreContent = "src/generated";
    fs3.writeFileSync(prettierignorePath, prettierignoreContent);
    console.log(chalk2.green(".prettierignore file created."));
    const eslintrcPath = path3.join(projectPath, ".eslintrc.cjs");
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
    fs3.writeFileSync(eslintrcPath, eslintrcContent);
    console.log(chalk2.green(".eslintrc.cjs updated to extend Prettier."));
    const packageJsonPath = path3.join(projectPath, "package.json");
    const packageJson = JSON.parse(fs3.readFileSync(packageJsonPath, "utf8"));
    packageJson.scripts["plasmic"] = "plasmic sync";
    fs3.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(chalk2.green(`Project ${projectName} created successfully.`));
    const envFilePath = path3.join(projectPath, ".env");
    const envContent = `PLASMICID=YOURID
PLASMICTOKEN=YOURTOKEN
`;
    fs3.writeFileSync(envFilePath, envContent);
    console.log(chalk2.green(".env file created with placeholders for PLASMICID and PLASMICTOKEN."));
    const gitignoreFilePath = path3.join(projectPath, ".gitignore");
    let gitignoreContent = "";
    if (fs3.existsSync(gitignoreFilePath)) {
      gitignoreContent = fs3.readFileSync(gitignoreFilePath, "utf8");
    }
    if (!gitignoreContent.includes(".env")) {
      gitignoreContent += "\n.env";
    }
    if (!gitignoreContent.includes("node_modules")) {
      gitignoreContent += "\nnode_modules";
    }
    fs3.writeFileSync(gitignoreFilePath, gitignoreContent);
    console.log(chalk2.green(".gitignore updated to include .env and node_modules."));
    console.log(chalk2.green("Removing Vite placeholder content"));
    await runReplaceDefaults(projectPath);
    await executeCommand("plasmic", ["init", "--src-dir", "src/components", "--plasmic-dir", "../generated", "--yes"], projectPath);
    console.log(chalk2.green(`Plasmic project ${projectName} initialised successfully.`));
    await executeCommand("plasmic", ["sync", "-p", plasmicProjectId, "--yes"], projectPath);
    console.log(chalk2.green(`Plasmic project ${projectName} synced successfully.`));
    console.log(chalk2.green(`Updating imports, creating folder structure and formatting code`));
    await setupComponentFoldersAndRoutes(projectPath);
    await executeCommand("npx", ["prettier", ".", "--write"], projectPath);
    console.log(chalk2.green(`Setup complete`));
  } catch (error) {
    console.error(chalk2.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

// src/commands/plasmicSync.ts
import chalk3 from "chalk";
import path4 from "path";
import fs4 from "fs";
async function plasmicSync(projectPath) {
  try {
    const projectName = path4.basename(projectPath);
    const plasmicJsonPath = path4.join(projectPath, "plasmic.json");
    if (!fs4.existsSync(plasmicJsonPath)) {
      console.log(chalk3.red("Error: plasmic.json not found in the current directory."));
      console.log(chalk3.yellow("Cannot sync without a valid plasmic.json file."));
      process.exit(1);
    }
    console.log(chalk3.green(`Found plasmic.json for ${projectName}.`));
    const plasmicConfig = JSON.parse(fs4.readFileSync(plasmicJsonPath, "utf-8"));
    let projectId = plasmicConfig.projects[0].projectId;
    if (!projectId) {
      projectId = await promptForProjectId();
      await executeCommand("plasmic", ["sync", "-p", projectId, "--yes"], projectPath);
    } else {
      await executeCommand("plasmic", ["sync", "--yes"], projectPath);
    }
    console.log(chalk3.green(`Plasmic project ${projectName} synced successfully.`));
    console.log(chalk3.green(`Updating imports, creating folder structure and formatting code`));
    await setupComponentFoldersAndRoutes(projectPath);
    await executeCommand("npx", ["prettier", ".", "--write"], projectPath);
  } catch (error) {
    console.error(chalk3.red(`Error syncing Plasmic project: ${error.message}`));
  } finally {
    process.exit(1);
  }
}

// src/commands/plasmicAuth.ts
import chalk4 from "chalk";
async function plasmicAuth() {
  try {
    await executeCommand("plasmic", ["auth"], "");
  } catch (error) {
    console.error(chalk4.red(`Error syncing Plasmic project: ${error.message}`));
  } finally {
    process.exit(1);
  }
}

// src/commands/plasmicInit.ts
import chalk5 from "chalk";
async function plasmicInit(projectPath) {
  try {
    await executeCommand("plasmic", ["init", "--src-dir", "src/generated", "--yes"], projectPath);
  } catch (error) {
    console.error(chalk5.red(`Error initialising plasmic: ${error.message}`));
  } finally {
    process.exit(1);
  }
}

// src/commands/serveCreateReactAppBuild.ts
import chalk6 from "chalk";
async function serveCreateReactAppBuild(projectPath) {
  try {
    await executeCommand("serve", ["-s", "build"], projectPath);
  } catch (error) {
    console.error(chalk6.red(`Error serving project: ${error.message}`));
  } finally {
    process.exit(1);
  }
}

// src/commands/plasmicFixImports.ts
import chalk7 from "chalk";
import path5 from "path";
import fs5 from "fs";
async function plasmicFixImports(projectPath) {
  try {
    const projectName = path5.basename(projectPath);
    const plasmicJsonPath = path5.join(projectPath, "plasmic.json");
    if (!fs5.existsSync(plasmicJsonPath)) {
      console.log(chalk7.red("Error: plasmic.json not found in the current directory."));
      console.log(chalk7.yellow("Cannot sync without a valid plasmic.json file."));
      process.exit(1);
    }
    console.log(chalk7.green(`Found plasmic.json for ${projectName}.`));
    await executeCommand("plasmic", ["fix-imports"], projectPath);
  } catch (error) {
    console.error(chalk7.red(`Error fixing imports: ${error.message}`));
  } finally {
    process.exit(1);
  }
}

// src/utils/promptForProjectName.ts
import readline2 from "readline";
import chalk8 from "chalk";
var rl = readline2.createInterface({
  input: process.stdin,
  output: process.stdout
});
function promptForProjectName() {
  return new Promise((resolve, reject) => {
    rl.question("What do you want to call the project? ", (projectName) => {
      if (!projectName) {
        console.error(chalk8.red("Project name cannot be empty."));
        promptForProjectName().then(resolve).catch(reject);
      } else {
        rl.close();
        resolve(projectName.trim());
      }
    });
  });
}

// src/commands/generateSdk.ts
import fs6 from "fs";
import path6 from "path";
import dotenv from "dotenv";
import axios from "axios";
function getBackendUrl(templateCwd2) {
  const envPath = path6.join(templateCwd2, ".env");
  if (fs6.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs6.readFileSync(envPath));
    console.log(envConfig);
    return envConfig.VITE_BACKEND_URL || "http://localhost:3001";
  }
  return "http://localhost:3001";
}
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
async function generateSDK(templateCwd2) {
  const API_BASE_URL = getBackendUrl(templateCwd2);
  const ENTITY_API_URL = `${API_BASE_URL}/sdk/entities`;
  const SDK_DIR = path6.join(templateCwd2, "src", "generated", "sdk");
  try {
    const response = await axios.get(ENTITY_API_URL);
    const entities = response.data;
    if (!fs6.existsSync(SDK_DIR)) {
      fs6.mkdirSync(SDK_DIR, { recursive: true });
    }
    entities.forEach((entity) => {
      const { name, endpoints } = entity;
      const className = capitalize(name);
      const filePath = path6.join(SDK_DIR, `${className.toLowerCase()}.ts`);
      const fileContent = `
import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || '${API_BASE_URL}';

/**
* Fetches all ${className}s.
* 
* @returns {Promise<AxiosResponse<${className}[]>>} A promise that resolves to an array of ${className} objects.
*/
export const getAll${className}s = async (): Promise<AxiosResponse<${className}[]>> => {
 return axios.get(\`\${API_BASE_URL}${endpoints.getAll}\`);
};

/**
* Fetches a single ${className} by ID.
* 
* @param {string | number} id - The ID of the ${className} to fetch.
* @returns {Promise<AxiosResponse<${className}>>} A promise that resolves to the ${className} object.
*/
export const get${className} = async (id: string | number): Promise<AxiosResponse<${className}>> => {
 return axios.get(\`\${API_BASE_URL}${endpoints.getOne.replace(":id", "${id}")}\`);
};

/**
* Creates a new ${className}.
* 
* @param {Partial<${className}>} data - The data to create the ${className}.
* @returns {Promise<AxiosResponse<${className}>>} A promise that resolves to the created ${className} object.
*/
export const create${className} = async (data: Partial<${className}>): Promise<AxiosResponse<${className}>> => {
 return axios.post(\`\${API_BASE_URL}${endpoints.create}\`, data);
};

/**
* Updates an existing ${className}.
* 
* @param {string | number} id - The ID of the ${className} to update.
* @param {Partial<${className}>} data - The data to update the ${className}.
* @returns {Promise<AxiosResponse<${className}>>} A promise that resolves to the updated ${className} object.
*/
export const update${className} = async (id: string | number, data: Partial<${className}>): Promise<AxiosResponse<${className}>> => {
 return axios.put(\`\${API_BASE_URL}${endpoints.update.replace(":id", "${id}")}\`, data);
};

/**
* Deletes an existing ${className}.
* 
* @param {string | number} id - The ID of the ${className} to delete.
* @returns {Promise<AxiosResponse<void>>} A promise that resolves when the ${className} is deleted.
*/
export const delete${className} = async (id: string | number): Promise<AxiosResponse<void>> => {
 return axios.delete(\`\${API_BASE_URL}${endpoints.delete.replace(":id", "${id}")}\`);
};

// Interface representing the ${className} entity
export interface ${className} {
 id: string | number;
 // Add other fields that are part of the ${className} entity here
}
`;
      fs6.writeFileSync(filePath, fileContent);
      console.log(`Generated TypeScript SDK for entity: ${name}`);
    });
    console.log("TypeScript SDK generation complete.");
  } catch (error) {
    console.error("Error generating TypeScript SDK:", error);
  } finally {
    process.exit(1);
  }
}

// src/commands/stashAndPull.ts
import chalk9 from "chalk";
async function stashAndPull(projectPath) {
  try {
    await executeCommand("git", ["stash"], projectPath);
    await executeCommand("git", ["pull"], projectPath);
    await executeCommand("git", ["stash", "apply", "stash@{0}"], projectPath);
  } catch (error) {
    console.error(chalk9.red(`Error syncing Plasmic project: ${error.message}`));
  } finally {
    process.exit(1);
  }
}

// src/index.ts
dotenv2.config();
var args = process.argv.slice(2);
var templateCwd = args[0];
var command = args[1];
var projectNameArg = args[2];
var dirArg = args.find((arg) => arg.startsWith("dir="));
var projectDir = dirArg ? dirArg.split("=")[1] : process.env.PROJECT_DIR || "/home/niu/stash";
console.log(command);
var isVanilla = false;
if (projectNameArg && projectNameArg.includes("vanilla=true")) {
  isVanilla = true;
  projectNameArg = projectNameArg.replace("vanilla=true", "").trim();
}
switch (command) {
  case "stash-and-pull":
  case "stash":
    await stashAndPull(templateCwd);
    break;
  case "create-vite":
    if (!projectNameArg) {
      const projectName = await promptForProjectName();
      createViteApp(projectName, projectDir, { vanilla: isVanilla });
    } else {
      createViteApp(projectNameArg, projectDir, { vanilla: isVanilla });
    }
    break;
  case "create-vite-plasmic-app":
  case "vpa":
    if (!projectNameArg) {
      const projectName = await promptForProjectName();
      createVitePlasmicApp(projectName, projectDir);
    } else {
      createVitePlasmicApp(projectNameArg, projectDir);
    }
    break;
  case "test":
    console.log(templateCwd);
    break;
  case "sync":
    await plasmicSync(templateCwd);
    break;
  case "auth":
    await plasmicAuth();
    break;
  case "fix-imports":
    await plasmicFixImports(templateCwd);
    break;
  case "init":
    await plasmicInit(templateCwd);
    break;
  case "eject":
    runReplaceDefaults(templateCwd);
    break;
  case "serve-cra-build":
    await serveCreateReactAppBuild(templateCwd);
    break;
  case "generate-sdk":
    await generateSDK(templateCwd);
    break;
  default:
    console.log(chalk10.red("Unknown command"));
    console.log("Usage:");
    console.log("  niu create-vite [projectName] [dir=/path/to/dir] [vanilla=true]");
    console.log("  niu create-vite-plasmic-app [projectName] [dir=/path/to/dir]");
    console.log("  niu create-vite-vanilla [projectName] [dir=/path/to/dir]");
    process.exit(1);
}
//# sourceMappingURL=index.js.map