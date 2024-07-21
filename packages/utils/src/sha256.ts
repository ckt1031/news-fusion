import hash from 'hash.js';

export function getSHA256(input: string | string[]) {
	const text = Array.isArray(input) ? input.join('_') : input;

	return hash.sha256().update(text).digest('hex');
}
