import type { ServerEnv } from '@/types/env';
import {} from 'hono';

declare module 'hono' {
	interface Env {
		Bindings: ServerEnv;
	}
}
