const thumbnailRegex = /<img[^>]+src="([^">]+)"[^>]*>/;

export async function getThumbnailFromRSS(html: string) {
	const match = html.match(thumbnailRegex);

	return match?.[1];
}
