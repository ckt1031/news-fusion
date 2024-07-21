type FilterProps = {
	url: string;
	title: string;
};

export default function filterRSS(prop: FilterProps) {
	// No #shorts in title for YouTube
	if (prop.title.toLowerCase().includes('#shorts')) {
		return false;
	}

	return true;
}
