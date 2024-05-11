import { Hono } from "hono";
import verifyDiscordRequest from "./verify-request";
import { InteractionResponseFlags } from "discord-interactions";
import {
  ComponentType,
  InteractionType,
  InteractionResponseType,
} from "discord-api-types/v10";
import summarizeButtonExecution from "./interactions/buttons/summarize";
import { DISCORD_INTERACTION_BUTTONS } from "../types/discord";

const app = new Hono();

// Reference: https://github.com/discord/cloudflare-sample-app/blob/main/src/server.js

app.get("/", (c) => {
  return c.text(`👋 ${c.env.DISCORD_APPLICATION_ID}`);
});

app.post("/", async (c) => {
  try {
    const { isValid, interaction } = await verifyDiscordRequest(c);

    if (!isValid || !interaction) {
      return c.text("Bad request signature.", 401);
    }

    if (interaction.type === InteractionType.Ping) {
      // The `PING` message is used during the initial webhook handshake, and is
      // required to configure the webhook in the developer portal.
      return c.json({
        type: InteractionResponseType.Pong,
      });
    }

    if (interaction.type === InteractionType.MessageComponent) {
      if (!interaction.data) {
        throw new Error("No data provided");
      }

      if (interaction.data.component_type === ComponentType.Button) {
        // return c.json(await summarizeButtonExecution(c.env, interaction));
        switch (interaction.data.custom_id) {
          case DISCORD_INTERACTION_BUTTONS.SUMMARIZE: {
            return c.json(await summarizeButtonExecution(c.env, interaction));
          }
        }
      }
    }

    throw new Error("Invalid interaction type");
  } catch (error) {
    console.error(error);
    return c.json({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: error instanceof Error ? error.message : "An error occurred",
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });
  }
});

export default app;
