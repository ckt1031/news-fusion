/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { z } from 'zod';

import { getResponse } from '../../ai/edge-gpt';
import type { InteractionHandlers } from '../../sturctures/interactions';
import extractArticle from '../../utils/extract-article';
import logging from '../../utils/logger';

const modalRequestSchema = z.object({
  articleURL: z.string().url(),
  textMode: z.enum(['balanced', 'concise']).default('balanced'),
  textLengthMode: z.enum(['short', 'normal', 'detailed']).default('normal'),
  language: z.enum(['english', 'chinese']).default('english'),
});

const button: InteractionHandlers = {
  type: 'modal',
  customId: 'summarize_rss_news_action',
  run: async ({ interaction }) => {
    if (!interaction.channel || !interaction.isModalSubmit()) {
      return;
    }

    const interactionData = modalRequestSchema.parse({
      articleURL: interaction.fields.getTextInputValue('article_url')?.toLowerCase(),
      text_mode: interaction.fields.getTextInputValue('text_mode')?.toLowerCase(),
      text_length_mode: interaction.fields.getTextInputValue('text_length_mode')?.toLowerCase(),
      language: interaction.fields.getTextInputValue('language')?.toLowerCase(),
    });

    await interaction.deferUpdate();

    const { articleURL, textMode, textLengthMode, language } = interactionData;

    let textLengthModePrompt = '';

    switch (textLengthMode) {
      case 'short': {
        textLengthModePrompt = 'in short';
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

    const languagePrompt =
      language === 'english' ? 'English (US)' : 'Chinese Traditional Taiwan (NO SIMPLIFIED)';

    const article = await extractArticle(articleURL);
    const user = interaction.client.users.cache.get(interaction.user.id);

    if (!user || !article.title || !article.source) return;

    const content =
      article.parsedTextContent.length > 1700
        ? article.parsedTextContent.slice(0, 1600) + '...'
        : article.parsedTextContent;

    logging.info(`NEW SUMMARIZING: Request: ${article.title}`);

    const order = `(Summarize this article in ONLY ${languagePrompt} LANGUAGE with professional tone, text should be ${textLengthModePrompt} with maxmium 1600 word length, don't include any hyperlinks, change personal subject to the exact object)`;

    const reply = await getResponse(
      textMode,
      `${order}\nSource: ${article.source}\nTitle: ${article.title}\nContent: ${content}`,
    );

    await user.send({
      content: `AI Summary: **${article.title}**\nURL: ${articleURL}\n\n${reply}`,
    });

    // Log and record
    logging.info(`NEWS SUMMARIZING: Returned result: ${article.title}`);
  },
};

export default button;
