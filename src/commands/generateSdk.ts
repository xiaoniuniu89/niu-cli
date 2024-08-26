import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import axios from 'axios';

function getBackendUrl(templateCwd: string) {
    const envPath = path.join(templateCwd, '.env');

    if (fs.existsSync(envPath)) {
        const envConfig = dotenv.parse(fs.readFileSync(envPath));
        return envConfig.VITE_BACKEND_URL || 'http://localhost:3001';
    }

    // Fallback to default if .env or the variable isn't present
    return 'http://localhost:3001';
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Example usage in generateSDK function:
export async function generateSDK(templateCwd: string) {
    const API_BASE_URL = getBackendUrl(templateCwd);
    const ENTITY_API_URL = `${API_BASE_URL}/sdk/entities`;

    const SDK_DIR = path.join(templateCwd, 'src', 'generated', 'sdk');

    try {
        const response = await axios.get(ENTITY_API_URL);
        const entities = response.data;

        // Ensure the SDK directory exists
        if (!fs.existsSync(SDK_DIR)) {
            fs.mkdirSync(SDK_DIR, { recursive: true });
        }

        entities.forEach(entity => {
            const { name, endpoints } = entity;
            const className = capitalize(name);
            const filePath = path.join(SDK_DIR, `${className.toLowerCase()}.ts`);
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
 return axios.get(\`\${API_BASE_URL}${endpoints.getOne.replace(':id', '\${id}')}\`);
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
 return axios.put(\`\${API_BASE_URL}${endpoints.update.replace(':id', '\${id}')}\`, data);
};

/**
* Deletes an existing ${className}.
* 
* @param {string | number} id - The ID of the ${className} to delete.
* @returns {Promise<AxiosResponse<void>>} A promise that resolves when the ${className} is deleted.
*/
export const delete${className} = async (id: string | number): Promise<AxiosResponse<void>> => {
 return axios.delete(\`\${API_BASE_URL}${endpoints.delete.replace(':id', '\${id}')}\`);
};

// Interface representing the ${className} entity
export interface ${className} {
 id: string | number;
 // Add other fields that are part of the ${className} entity here
}
`;

            fs.writeFileSync(filePath, fileContent);
            console.log(`Generated TypeScript SDK for entity: ${name}`);
        });

        console.log('TypeScript SDK generation complete.');
    } catch (error) {
        console.error('Error generating TypeScript SDK:', error);
    }
}
