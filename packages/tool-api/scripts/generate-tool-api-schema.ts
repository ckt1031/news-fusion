import $ from 'dax-sh';

const baseURL = process.env.TOOLS_API_BASE_URL ?? 'https://api.tsun1031.xyz';

const filePath = './packages/types/tool-apis.d.ts';

// Remove the existing schema file
// await $`rm -f ${filePath}`;

// Generate the OpenAPI schema for the tool APIs
await $`pnpm dlx openapi-typescript ${baseURL}/openapi.json -o ${filePath}`;
