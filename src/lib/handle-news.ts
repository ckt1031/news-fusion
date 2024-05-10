import { DIRECT_SEND_RSS } from "../config/news-sources";
import { ServerEnv } from "../types/env";
import { getDB } from "./db";
import { parseRSS } from "./parse-news";
import { drizzle } from 'drizzle-orm/d1';

export async function checkIfNewsIsNew(env: ServerEnv, link: string) {
  const db = getDB(env.D1);

  const result = await db.query.checkedArticles.findFirst({
    with: { url },
  });

  return !result;
}

export async function cronCheckNews() {
  console.log(await parseRSS(DIRECT_SEND_RSS[1]));
}