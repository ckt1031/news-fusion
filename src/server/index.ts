import { Hono } from "hono";
import discordBot from "../discord/bot";
import { cronCheckNews } from "../lib/handle-news";

const app = new Hono();

// Reference: https://github.com/discord/cloudflare-sample-app/blob/main/src/server.js

app.get("/", (c) => {
  return c.text("Hey Here!");
});

// TODO: Remove this route
app.get("/cron", async (c) => {
  await cronCheckNews(c.env);
  return c.text("ok!");
});

app.route("/discord", discordBot);

export default app;
