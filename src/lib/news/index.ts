import type { ServerEnv } from '@/types/env';
import checkMustRead from './check-must-read';

type CheckNewsProps = {
	doNotCheckMustRead?: boolean;
	doNotCheckAiFilter?: boolean;
};

export async function checkNews(env: ServerEnv, props?: CheckNewsProps) {
	// Handle Must Read RSS
	if (!props?.doNotCheckMustRead) {
		await checkMustRead(env);
	}
}
