/** Picks a random number of elements from an array */
export default function pickRandom<T>(arr: T[], count = 1): T[] {
	const result: T[] = [];
	const copy = [...arr];

	for (let i = 0; i < count; i++) {
		const index = Math.floor(Math.random() * copy.length);
		result.push(copy[index]);
		copy.splice(index, 1);
	}

	return result;
}
