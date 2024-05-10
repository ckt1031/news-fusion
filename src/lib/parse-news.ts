import { z } from "zod";
import { NEWS_MINIMALIST_API } from "../config/news-sources";
import { NewsMinimalistResponse } from "../types/news-minimalist";
import Parser from "rss-parser";

export async function getNewsMinimalistList() {
  const response = await fetch(NEWS_MINIMALIST_API);
  
  return await NewsMinimalistResponse.parseAsync(await response.json());
}

export async function parseRSS(url: string) {
  const parser = new Parser();
  const feed = await parser.parseURL(url);

  const feedItemSchema = z.object({
    title: z.string(),
    link: z.string(),
    pubDate: z.string(),
    contentSnippet: z.string(),
  });

  const feedSchema = z.object({
    title: z.string(),
    link: z.string(),
    items: z.array(feedItemSchema),
  });

  return feedSchema.parse(feed);
}
