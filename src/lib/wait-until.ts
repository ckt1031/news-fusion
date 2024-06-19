import { waitUntil as vercelWaitUntil } from '@vercel/functions';
//import { getRuntimeKey } from 'hono/adapter';

export function waitUntil(func: Promise<unknown>) {
	//if (getRuntimeKey() === 'workerd') {
	//	c.executionCtx.waitUntil(func);
	//} else {
	vercelWaitUntil(func);
	//}
}
