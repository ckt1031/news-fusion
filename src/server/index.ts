import { Hono } from "hono";
import discordBot from "../discord/bot";

const app = new Hono();

// Reference: https://github.com/discord/cloudflare-sample-app/blob/main/src/server.js

app.get("/", (c) => {
  return c.text("Hey Here!");
});

app.route("/discord", discordBot);

export default app;
