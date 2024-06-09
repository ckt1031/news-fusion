import type { Context, Env } from 'hono';
import type { BlankInput } from 'hono/types';

export interface DiscordInteractionPostContext
	extends Context<Env, '/', BlankInput> {}
