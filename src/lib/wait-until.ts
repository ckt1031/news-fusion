import { waitUntil as vercelWaitUntil } from '@vercel/functions';
import type { Context, Env } from 'hono';
import { getRuntimeKey } from 'hono/adapter';
import type { BlankInput } from 'hono/types';

export function waitUntil(
	c: Context<Env, '/', BlankInput>,
	func: Promise<unknown>,
) {
	if (getRuntimeKey() === 'workerd') {
		c.executionCtx.waitUntil(func);
	} else {
		vercelWaitUntil(func);
	}
}
