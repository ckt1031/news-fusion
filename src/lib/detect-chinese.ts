export function isMostlyChinese(str: string) {
	const chineseRegex = /[\u4e00-\u9fff]/g;
	const chineseChars = str.match(chineseRegex) || [];
	const chineseCharCount = chineseChars.length;
	const totalCharCount = str.length;

	return chineseCharCount > totalCharCount / 2;
}
