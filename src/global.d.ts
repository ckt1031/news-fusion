import type { ServerEnv } from '@/types/env';
import {} from 'hono';

declare module 'hono' {
	interface Env {
		Bindings: ServerEnv;
	}
}

declare global {
	type RecursivePartial<T> = {
		[P in keyof T]?: RecursivePartial<T[P]>;
	};

	type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;
}
