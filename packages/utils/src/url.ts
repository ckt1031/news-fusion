export function isURLYoutube(url: string) {
	const host = new URL(url).host;

	const youtubeHosts = ['youtube.com', 'www.youtube.com', 'youtu.be', 'yt.be'];

	return youtubeHosts.includes(host);
}

export function getUrlFromText(text: string) {
	const urlPattern = /(https?:\/\/[^\s)]+)/g;

	return text.match(urlPattern);
}
