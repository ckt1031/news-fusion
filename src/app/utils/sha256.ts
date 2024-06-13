import crypto from 'node:crypto';

export default function getSHA256(input: string) {
	const hash = crypto.createHash('sha256');
	hash.update(input);
	return hash.digest('hex');
}
