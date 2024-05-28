type FilterProps = {
	url: string;
	title: string;
};

export default function filterRSS(prop: FilterProps) {
	// If RSS has weather.gov.hk and title has 現時並無特別報告, skip
	if (
		prop.url.includes('weather.gov.hk') &&
		prop.title.includes('現時並無特別報告')
	) {
		return false;
	}

	// No #shorts in title
	if (prop.title.toLowerCase().includes('#shorts')) {
		return false;
	}

	return true;
}
