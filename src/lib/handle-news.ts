import { EARLIEST_DAYS, MUST_READ_RSS_LIST, RSS_CATEGORY } from "../config/news-sources";
import { NewArticle, articles } from "../db/schema";
import { sendDiscordMessage } from "../discord/utils";
import { DISCORD_INTERACTION_BUTTONS } from "../types/discord";
import { ServerEnv } from "../types/env";
import { getDB } from "./db";
import { parseRSS } from "./parse-news";
import { nanoid } from "nanoid";
import { ComponentType, ButtonStyle } from "discord-api-types/v10";
import removeTrailingSlash from "remove-trailing-slash";
import dayjs from "dayjs";

export async function checkIfNewsIsNew(env: ServerEnv, url: string) {
  const db = getDB(env.D1);

  const result = await db.query.articles.findFirst({
    // with: { url },
    where: (d, { eq }) => eq(d.url, removeTrailingSlash(url)),
  });

  return !result;
}

export async function createArticleDatabase(env: ServerEnv, data: NewArticle) {
  const db = getDB(env.D1);

  await db.insert(articles).values(data);
}

export async function cronCheckNews(env: ServerEnv) {
  // Handle Must Read RSS
  for (const rssCategory of Object.keys(MUST_READ_RSS_LIST)) {
    for (const rss of MUST_READ_RSS_LIST[rssCategory as RSS_CATEGORY]) {
      const feed = await parseRSS(rss);

      for (const item of feed.items) {
        // check if the news is within the last 3 days, use dayjs
        if (dayjs().diff(dayjs(item.pubDate), "day") > EARLIEST_DAYS) {
          continue;
        }

        const isNew = await checkIfNewsIsNew(env, item.link);

        if (isNew) {
          await sendDiscordMessage(env, {
            embeds: [
              {
                title: item.title,
                url: item.link,
                author: {
                  name: feed.title,
                },
                timestamp: new Date(item.pubDate).toISOString(),
              },
            ],
            components: [
              {
                type: ComponentType.ActionRow,
                components: [
                  {
                    type: ComponentType.Button,
                    style: ButtonStyle.Secondary,
                    label: "Summarize",
                    custom_id: DISCORD_INTERACTION_BUTTONS.SUMMARIZE,
                  },
                  {
                    type: ComponentType.Button,
                    style: ButtonStyle.Secondary,
                    label: "Translate",
                    custom_id: DISCORD_INTERACTION_BUTTONS.TRANSLATE,
                  },
                ],
              },
            ],
          });

          await createArticleDatabase(env, {
            id: nanoid(),
            importantEnough: true,
            title: item.title,
            url: item.link,
            publisher: feed.title,
            category: rssCategory,
            publishedAt: new Date(item.pubDate).getTime(),
          });
        }
      }
    }
  }
}
