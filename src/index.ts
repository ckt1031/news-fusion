import { cronCheckNews } from './lib/handle-news';
import app from './server';
import type { ServerEnv } from './types/env';

export default {
	async scheduled(
		_event: ScheduledEvent,
		env: ServerEnv,
		_ctx: ExecutionContext,
	): Promise<void> {
		await cronCheckNews(env);
	},
	async fetch(request: Request, env: ServerEnv) {
		return await app.fetch(request, env);
	},
};
