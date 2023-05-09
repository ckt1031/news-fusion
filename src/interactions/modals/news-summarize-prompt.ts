import { getResponse } from '../../ai/edge-gpt';
import { cleanRequestPrompt } from '../../ai/quora';
import type { InteractionHandlers } from '../../sturctures/interactions';
import extractArticle from '../../utils/extract-article';
import logging from '../../utils/logger';

function processInput(input: string, options: Record<string, string>, defaultValue: string) {
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
  customId: 'summarize_rss_news_action',
  run: async ({ interaction }) => {
    if (!interaction.channel || !interaction.isModalSubmit()) {
      return;
    }

    const articleURL = interaction.fields.getTextInputValue('article_url');

    // Available Options for text_length_mode: 1.Short, 2.Normal, 3.Detailed
    const textLengthMode = processInput(
      interaction.fields.getTextInputValue('text_length_mode'),
      {
        '1': 'short',
        '2': 'normal',
        '3': 'detailed',
      },
      'normal',
    );

    // Available Options for language: 1.English, 2.Chinese
    const language = processInput(
      interaction.fields.getTextInputValue('language'),
      {
        '1': 'english',
        '2': 'chinese',
      },
      'english',
    );

    // Available Options for ai_model: 1.Bing, 2.Poe.com
    const aiModel = processInput(
      interaction.fields.getTextInputValue('ai_model'),
      {
        '1': 'bing',
        '2': 'poe',
      },
      'bing',
    );

    const languagePrompt = language === 'english' ? 'English (US)' : 'Chinese Traditional (Taiwan)';

    await interaction.deferUpdate();

    let textLengthModePrompt = '';

    switch (textLengthMode) {
      case 'short': {
        textLengthModePrompt = 'in short and SINGLE paragraph ONLY';
        break;
      }
      case 'normal': {
        textLengthModePrompt = 'in normal length';
        break;
      }
      case 'detailed': {
        textLengthModePrompt = 'in possibly detailed';
        break;
      }
      // No default
    }

    const article = await extractArticle(articleURL);
    const user = interaction.client.users.cache.get(interaction.user.id);

    if (!user || !article.title || !article.source) return;

    const content =
      article.parsedTextContent.length > 1700
        ? article.parsedTextContent.slice(0, 1600) + '...'
        : article.parsedTextContent;

    logging.info(`NEW SUMMARIZING: Request: ${article.title}`);

    const order = `(Summarize this article in ONLY ${languagePrompt} LANGUAGE AND professional tone,
      text should be ${textLengthModePrompt} with maxmium 1500 word length, DON'T include any URLs and hyperlinks, 
      change personal subject to the exact object)`;

    let reply = '';

    if (aiModel === 'bing') {
      reply = await getResponse(
        'precise',
        `${order}\nSource: ${article.source}\nTitle: ${article.title}\nContent: ${content}`,
      );
    } else if (aiModel === 'poe') {
      reply = await cleanRequestPrompt(
        `${order}\nSource: ${article.source}\nTitle: ${article.title}\nContent: ${content}`,
      );
    }

    await user.send({
      content: `AI Summary: **${article.title}**\nURL: ${articleURL}\n\n${reply}`,
    });

    // Log and record
    logging.info(`NEWS SUMMARIZING: Returned result: ${article.title}`);
  },
};

export default button;
