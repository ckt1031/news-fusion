import type { ExecutionContext } from 'hono/dist/types/context';

export const getRequestExecutionContext = (): ExecutionContext => {
	if (typeof process === 'undefined') {
		throw new Error(
			'Error: trying to access the request execution context on the client',
		);
	}
	return {
		waitUntil: (promise: Promise<unknown>) => {
			void promise;
		},
		passThroughOnException: () => {
			console.warn(
				'The mocked passThroughOnException function is executed. It may behave differently from the pages environment.',
			);
		},
	};
};
