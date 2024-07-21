import { getSHA256 } from '@ckt1031/utils';

export function getGravatarUrl(email: string, size?: number) {
	const SHA256 = getSHA256(email);
	return `https://www.gravatar.com/avatar/${SHA256}?s=${size ?? 100}`;
}
