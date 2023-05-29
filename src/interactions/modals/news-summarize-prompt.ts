import { ModalCustomIds, NewsSummarizingModelFieldIds } from '@/sturctures/custom-id';
import type { InteractionHandlers } from '@/sturctures/interactions';
import { getBingResponse } from '@/utils/bing-ai';
import extractArticle from '@/utils/extract-article';
import logging from '@/utils/logger';

function processInput(
  input: string,
  options: Record<string, string>,
  defaultValue: string,
): string {
  if (input in options) {
    return options[String(input)];
  } else if (Object.values(options).includes(input)) {
    return input;
  } else {
    return defaultValue;
  }
}

const button: InteractionHandlers = {
  type: 'modal',
  customId: ModalCustomIds.SummarizeNewsAction,
  run: async ({ interaction }) => {
    if (!interaction.channel || !interaction.isModalSubmit()) {
      return;
    }

    const articleURL = interaction.fields.getTextInputValue(
      NewsSummarizingModelFieldIds.ArticleUrl,
    );

    // Available Options for text_length_mode: 1.Short, 2.Normal, 3.Detailed
    const textLengthMode = processInput(
      interaction.fields.getTextInputValue(NewsSummarizingModelFieldIds.TextLengthMode),
      {
        '1': 'short',
        '2': 'normal',
        '3': 'detailed',
      },
      'normal',
    );

    // Available Options for language: 1.English, 2.Chinese
    const language = processInput(
      interaction.fields.getTextInputValue(NewsSummarizingModelFieldIds.Language),
      {
        '1': 'english',
        '2': 'chinese',
      },
      'english',
    );

    const languagePrompt = language === 'english' ? 'English (US)' : 'Chinese Traditional (Taiwan)';

    await interaction.deferUpdate();

    let textLengthModePrompt = '';

    switch (textLengthMode) {
      case 'short': {
        textLengthModePrompt = 'in SHORT/CONCISE and SINGLE paragraph ONLY';
        break;
      }
      case 'normal': {
        textLengthModePrompt = 'in normal length';
        break;
      }
      case 'detailed': {
        textLengthModePrompt = 'in possibly detailed with maxmium 1500 word length';
        break;
      }
      // No default
    }

    const article = await extractArticle(articleURL);
    const user = interaction.client.users.cache.get(interaction.user.id);

    if (!user || !article.title || !article.source) return;

    logging.info(`NEW SUMMARIZING: Request: ${article.title}`);

    const reply = await getBingResponse(
      'Precise',
      `Summarize this article in ONLY ${languagePrompt} LANGUAGE AND professional tone,
        text should be ${textLengthModePrompt}, change personal subject to the exact object, URL: ${articleURL}`,
    );

    await user.send({
      content: `AI Summary: **${article.title}**\nURL: ${articleURL}\n\n${reply}`,
    });

    // Log and record
    logging.info(`NEWS SUMMARIZING: Returned result: ${article.title}`);
  },
};

export default button;
