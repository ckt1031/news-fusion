import axios from 'axios';

export async function sendPub(category: string) {
	const SITE_DOMAIN = process.env.SITE_DOMAIN || 'localhost:3000';
	const PUBSUB_URL = 'https://pubsubhubbub.appspot.com/';

	await axios.post(PUBSUB_URL, {
		hub: PUBSUB_URL,
		topic: `https://${SITE_DOMAIN}/v1/feeds/${category}.xml`,
		verify: 'async',
	});
}
