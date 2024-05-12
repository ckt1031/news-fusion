import {} from 'hono';
import type { ServerEnv } from './types/env';

declare module 'hono' {
	interface Env {
		Bindings: ServerEnv;
	}
}
