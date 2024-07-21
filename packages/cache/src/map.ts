// biome-ignore lint/suspicious/noExplicitAny: <explanation>
let cache: Map<string, any> | null = null;

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function getMapCache(): Map<string, any> {
	if (!cache) {
		cache = new Map();
	}
	return cache;
}
