import hash from 'hash.js';

export default function getSHA256(input: string | string[]) {
	const text = Array.isArray(input) ? input.join('') : input;

	return hash.sha256().update(text).digest('hex');
}
