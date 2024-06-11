//import type { DiscordInteractionPostContext } from '@/types/hono';
import { waitUntil as vercelWaitUntil } from '@vercel/functions';
//import { getRuntimeKey } from 'hono/adapter';

export function waitUntil(
	//c: DiscordInteractionPostContext,
	func: Promise<unknown>,
) {
	//if (getRuntimeKey() === 'workerd') {
	//	c.executionCtx.waitUntil(func);
	//} else {
	vercelWaitUntil(func);
	//}
}
