import axios from 'axios';

export async function sendPub(category: string) {
	const SITE_DOMAIN = process.env.SITE_DOMAIN;

	if (!SITE_DOMAIN || SITE_DOMAIN === '') {
		// If the site domain is not set, we don't need to send the pub
		return;
	}

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
