import crypto from 'node:crypto';

export function randomOrder<T>(array: T[]): T[] {
	const randomIndices = Array.from({ length: array.length }, (_, i) => i);

	for (let i = randomIndices.length - 1; i > 0; i--) {
		// Generate enough random bytes to create a 32-bit (4-byte) unsigned integer.
		// This gives us a good range for generating a uniform float.
		const randomBytes = crypto.randomBytes(4);
		const randomNumber = randomBytes.readUInt32BE(0); // Read as a 32-bit unsigned integer

		// Scale it to be a float between 0 (inclusive) and 1 (exclusive).
		// The maximum value for a UInt32 is 2^32 - 1. We divide by 2^32 to get [0, 1).
		const randomFloat = randomNumber / (0xffffffff + 1); // 0xFFFFFFFF is 2^32 - 1

		// Use this uniform float to select j
		const j = Math.floor(randomFloat * (i + 1));

		// Swap elements
		[randomIndices[i], randomIndices[j]] = [randomIndices[j], randomIndices[i]];
	}
	return randomIndices.map((index) => array[index]);
}
