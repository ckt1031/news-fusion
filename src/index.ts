import { ServerEnv } from "./types/env";
import { cronCheckNews } from "./lib/handle-news";
import app from "./server";

export default {
	async scheduled(_event: ScheduledEvent, env: ServerEnv, _ctx: ExecutionContext): Promise<void> {
    cronCheckNews(env);
	},
  async fetch(request: Request, env: ServerEnv) {
    return await app.fetch(request, env);
   },
};