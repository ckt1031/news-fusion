import {
  ComponentType,
  APIMessageComponentInteraction,
  InteractionResponseType,
  APIInteractionResponseCallbackData
} from "discord-api-types/v10";
import { ServerEnv } from "../../types/env";
import { summarizeText } from "../../lib/llm";

const command = {
  info: {
    id: "summarize",
  },
  run: async (env: ServerEnv, interactions: APIMessageComponentInteraction) => {
    if (!interactions.data) {
      throw new Error("No data provided");
    }

    if (interactions.data.component_type !== ComponentType.Button) {
      throw new Error("Invalid component type");
    }

    const parentMessage = interactions.message;

    if (parentMessage.embeds.length === 0 || !parentMessage.embeds[0].url) {
      throw new Error("No embeds found");
    }

    const url = parentMessage.embeds[0].url;

    const extractAPIResponse = await fetch(
      `${env.TOOLS_API_BASE_URL}/web/extract/markdown?url=${url}`,
      {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${env.TOOLS_API_KEY}`,
        },
      }
    );

    if (!extractAPIResponse.ok) {
      throw new Error("Failed to extract content");
    }

    const { content } = await extractAPIResponse.json() as { content: string };

    const text = await summarizeText(content);

    return {
      type: InteractionResponseType.Pong,
      data: {
        content: text,
      },
    }
  },
};

export default command;
