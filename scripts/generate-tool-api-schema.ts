import { $ } from 'bun';

const baseURL = process.env.TOOLS_API_BASE_URL;

const filePath = './src/types/tool-apis.d.ts';

// Remove the existing schema file
await $`rm -f ${filePath}`;

// Generate the OpenAPI schema for the tool APIs
await $`bunx openapi-typescript ${baseURL}/openapi.json -o ${filePath}`;
