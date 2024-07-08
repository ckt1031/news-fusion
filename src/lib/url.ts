export function isURLYoutube(url: string) {
	const host = new URL(url).host;

	const youtubeHosts = ['youtube.com', 'www.youtube.com', 'youtu.be', 'yt.be'];

	return youtubeHosts.includes(host);
}
