import { Hono } from "hono";
import discordBot from "../discord/bot";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hey Here!");
});

app.route("/discord", discordBot);

export default app;
