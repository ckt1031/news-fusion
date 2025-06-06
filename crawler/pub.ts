import axios from 'axios';

export async function sendPub(category: string) {
	const SITE_DOMAIN = process.env.SITE_DOMAIN || 'localhost:3000';
	const PUBSUB_URL = 'https://pubsubhubbub.appspot.com/';

	await axios.post(PUBSUB_URL, {
		'hub.mode': 'publish',
		'hub.url': `https://${SITE_DOMAIN}/v1/feeds/${category}.xml`,
	});
}

sendPub('business');
