import type { ServerEnv } from '@/types/env';
import {} from 'hono';
import type { getRequestExecutionContext } from './lib/get-execution-ctx';

declare module 'hono' {
	interface Env {
		Bindings: ServerEnv;
	}
	interface ContextVariableMap {
		ctx: ReturnType<typeof getRequestExecutionContext>;
	}
}

declare global {
	type RecursivePartial<T> = {
		[P in keyof T]?: RecursivePartial<T[P]>;
	};

	type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;
}
