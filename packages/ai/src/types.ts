import type { ServerEnv } from '@ckt1031/types';

export interface AIBaseProps {
	env: ServerEnv;
	timeout?: number;
	taskName?: string;
	model?: string;
}

export interface TextCompletionsGenerateProps extends AIBaseProps {
	temperature?: number;
	message: {
		system?: string;
		user: string;
	};
	model: string;
}

export interface EmbeddingsProp extends AIBaseProps {
	text: string;
}

export interface RerankProps extends AIBaseProps {
	text: string;
	documents: string[];
}
