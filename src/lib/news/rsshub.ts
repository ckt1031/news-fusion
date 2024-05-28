import type { ServerEnv } from "@/types/env";

export function getRSSHubURL(env: ServerEnv, url:  string) {
  if (!url.includes('{RSSHUB}')) return url;

  if (!env.RSSHUB_BASE_URL) {
    console.error(`Skipping RSSHub: ${url.replace('{RSSHUB}', '')} because RSSHUB_BASE_URL is not set`);
    return false;
  }

  const accessKey = env.RSSHUB_ACCESS_KEY ? `?key=${env.RSSHUB_ACCESS_KEY}` : '';

  return `${url.replace('{RSSHUB}', '')}${accessKey}`;
}
