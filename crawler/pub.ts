import axios from 'axios';

export async function sendPub(category: string) {
	const SITE_DOMAIN = process.env.SITE_DOMAIN || 'localhost:3000';
	const PUBSUB_URL = 'https://pubsubhubbub.appspot.com/';

	const headers = {
		'Content-Type': 'application/x-www-form-urlencoded',
	};

	const body = {
		'hub.mode': 'publish',
		'hub.url': `https://${SITE_DOMAIN}/api/feeds/${category}.xml`,
	};

	await axios.post(PUBSUB_URL, body, { headers });
}

sendPub('business');
