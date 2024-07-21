import { removeTrailingSlash } from '@ckt1031/utils';
import { expect, test } from 'vitest';

test('Remove Trailing Slash', async () => {
	expect(removeTrailingSlash('https://example.com/')).toBe(
		'https://example.com',
	);
	expect(removeTrailingSlash('https://example.com')).toBe(
		'https://example.com',
	);
	expect(removeTrailingSlash('https://example.com/test/')).toBe(
		'https://example.com/test',
	);
	expect(removeTrailingSlash('https://example.com/test')).toBe(
		'https://example.com/test',
	);

	// Test with query params
	expect(removeTrailingSlash('https://a.com/test/?query=1')).toBe(
		'https://a.com/test/?query=1',
	);
	expect(removeTrailingSlash('https://a.com/test?url=https://b.com/')).toBe(
		'https://a.com/test?url=https://b.com/',
	);
});
