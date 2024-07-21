export default function captialTopicName(str: string) {
	// If length is 0 - 3, make it full uppercase
	if (str.length <= 3) {
		return str.toUpperCase();
	}

	return str.charAt(0).toUpperCase() + str.slice(1);
}
