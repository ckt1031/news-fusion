import { getRuntimeKey } from 'hono/adapter';

export default async function safeCompare(a: string, b: string) {
	const runtime = getRuntimeKey();

	if (runtime === 'workerd') {
		const firstTokenBuffer = new TextEncoder().encode(a);
		const secondTokenBuffer = new TextEncoder().encode(b);

		if (firstTokenBuffer.length !== secondTokenBuffer.length) return false;

		return crypto.subtle.timingSafeEqual(firstTokenBuffer, secondTokenBuffer);
	}

	// TODO: Implement crypto for the Node.js runtime
	return jsEequals(a, b);
}

function jsEequals(test: string, secret: string) {
	// String comparison that does not leak timing information
	let diffs = test.length !== secret.length ? 1 : 0;
	for (let i = 0; i < test.length; i++) if (test[i] !== secret[i]) diffs++;
	return diffs === 0;
}
