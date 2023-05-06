import { z } from 'zod';

import logging from './utils/logger';

declare global {
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ProcessEnv extends z.infer<typeof ZodEnvironmentVariables> {}
  }
}

const ZodEnvironmentVariables = z.object({
  TOKEN: z.string(),
  // Poe.com reverse engineered API
  POE_COOKIE: z.string(),
  POE_QUORA_FORMKEY: z.string(),
  // Sentry error reporting
  SENTRY_DSN: z.string(),
  // MongoDB for database.
  MONGODB_URL: z.string(),
  // Slash commands
  GUILD_ID: z.string(),
  CLIENT_ID: z.string(),
  // Discord bot owner
  OWNER_ID: z.string(),
  // Bing
  BING_COOKIE: z.string(),
});

ZodEnvironmentVariables.parse(process.env);

logging.info('✅ Environment variables verified!');
