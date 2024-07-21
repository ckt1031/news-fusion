/** Remove trailing slash from URL, return as is if it has query params */
export function removeTrailingSlash(url: string): string {
	// If it has query, return as is
	if (url.includes('?')) return url;

	return url.replace(/\/$/, '');
}
