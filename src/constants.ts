import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const isDevelopment = process.env.NODE_ENV === 'development';

export const userAgent =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36 Edg/113.0.1774.35';

export const __dirname = dirname(fileURLToPath(import.meta.url));
