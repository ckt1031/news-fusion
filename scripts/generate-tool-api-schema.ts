import { exec } from 'node:child_process';
import fs from 'node:fs';

const baseURL =
	process.env.TOOLS_API_BASE_URL ?? 'https://tool-api.tsun1031.xyz';

const filePath = './src/types/tool-apis.d.ts';

// Remove the existing schema file
if (fs.existsSync(filePath)) {
	fs.unlinkSync(filePath);
	console.log(`${filePath} deleted successfully`);
}

// Generate the OpenAPI schema for the tool APIs
exec(`pnpm dlx openapi-typescript ${baseURL}/openapi.json -o ${filePath}`);
