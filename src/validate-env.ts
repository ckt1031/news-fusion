import { z } from 'zod';

import logging from './utils/logger';

declare global {
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ProcessEnv extends z.infer<typeof ZodEnvironmentVariables> {}
  }
}

const ZodEnvironmentVariables = z.object({
  TOKEN: z.string(), // Discord bot token
  // Poe.com reverse engineered API
  POE_COOKIE: z.string(), // Poe.com cookie
  POE_QUORA_FORMKEY: z.string(), // Poe.com Quora form key
  // Sentry error reporting
  SENTRY_DSN: z.string(), // Sentry DSN
  // MongoDB for database.
  MONGODB_URL: z.string(), // MongoDB URL
  // Slash commands
  GUILD_ID: z.string(), // Discord guild ID
  CLIENT_ID: z.string(), // Discord client ID
  // Discord bot owner
  OWNER_ID: z.string(), // Discord bot owner ID
  // Bing
  BING_COOKIE: z.string(), // Bing cookie
  // Session
  WEB_PASSWORD: z.string(), // Web password
  WEB_SESSION_TOKEN: z.string(), // Session token
  // Hcaptcha
  HCAPTCHA_SITEKEY: z.string(), // Hcaptcha site key
  HCAPTCHA_SECRETKEY: z.string(), // Hcaptcha secret key
});

ZodEnvironmentVariables.parse(process.env);

logging.info('✅ Environment variables verified!');
