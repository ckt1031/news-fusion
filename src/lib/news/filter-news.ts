type FilterProps = {
	url: string;
	title: string;
};

export default function filterRSS(prop: FilterProps) {
	// If RSS has weather.gov.hk and title has "no special announcement", skip
	if (
		prop.url.includes('weather.gov.hk') &&
		prop.title.toLowerCase().includes(' ')
	) {
		return false;
	}

	// No #shorts in title for YouTube
	if (prop.title.toLowerCase().includes('#shorts')) {
		return false;
	}

	return true;
}
