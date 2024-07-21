import { pickRandom } from '@ckt1031/utils';
import { expect, test } from 'vitest';

test('Pick Random', async () => {
	const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

	const result = pickRandom(arr, 3);

	expect(result.length).toBe(3);
	expect(result.every((x) => arr.includes(x))).toBe(true);
});
