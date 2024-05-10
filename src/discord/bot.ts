import { Hono } from "hono";
import verifyDiscordRequest from "./verify-request";
import { InteractionResponseType } from "discord-interactions";
import { InteractionType } from "discord-api-types/v10";

const app = new Hono();

// Reference: https://github.com/discord/cloudflare-sample-app/blob/main/src/server.js

app.get("/", (c) => {
  return c.text(`👋 ${c.env.DISCORD_APPLICATION_ID}`);
});

app.post("/", async (c) => {
  const { isValid, interaction } = await verifyDiscordRequest(c);

  if (!isValid || !interaction) {
    return c.text("Bad request signature.", 401);
  }

  if (interaction.type === InteractionType.Ping) {
    // The `PING` message is used during the initial webhook handshake, and is
    // required to configure the webhook in the developer portal.
    return c.json({
      type: InteractionResponseType.PONG,
    });
  }

  if (interaction.type === InteractionType.ApplicationCommand) {
    // TODO: Handle command interactions
  }

  console.error("Unknown Type");

  return c.json({ error: "Unknown Type" }, { status: 400 });
});

export default app;
