const logging = {
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	success: (...message: any | any[]) => {
		console.log('[SUCCESS]', message);
	},
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	error: (...message: any | any[]) => {
		console.error('[ERROR]', message);
	},
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	info: (...message: any | any[]) => {
		console.info('[INFO]', message);
	},
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	debug: (...message: any | any[]) => {
		console.debug('[DEBUG]', message);
	},
};

export default logging;
