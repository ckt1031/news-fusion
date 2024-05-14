import type {
	APIMessageComponentInteraction,
	APIMessageComponentInteractionData,
} from 'discord-api-types/v10';

export enum DISCORD_INTERACTION_BUTTONS {
	GENERATE_SUMMARIZE = 'summarize',
	REGENERATE_SUMMARIZE = 'regenerate_summarize',
	TRANSLATE = 'translate',
	RE_TRANSLATE = 're_translate',
}

export type InteractionExecution = APIMessageComponentInteraction & {
	data: APIMessageComponentInteractionData;
};
