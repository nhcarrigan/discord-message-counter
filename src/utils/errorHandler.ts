import * as Sentry from "@sentry/node";
import { MessageEmbed, WebhookClient } from "discord.js";
import { v4 } from "uuid";

import { logHandler } from "./logHandler";

/**
 * Standard error handling module to pipe errors to Sentry and
 * format the error for logging.
 *
 * @param {string} context A description of where the error occurred.
 * @param {Error} err The error object.
 * @returns {String} An error ID.
 */
export const errorHandler = async (
  context: string,
  err: unknown
): Promise<string> => {
  const error = err as Error;
  const errorId = v4();
  logHandler.log("error", `There was an error in the ${context}:`);
  logHandler.log(
    "error",
    JSON.stringify({ errorMessage: error.message, errorStack: error.stack })
  );
  Sentry.captureException(error);

  const hook = new WebhookClient({ url: process.env.DEBUG_HOOK as string });

  const embed = new MessageEmbed();
  embed.setTitle(`There was an error in the ${context}`);
  embed.setDescription(error.message.slice(0, 2000));
  embed.addField(
    "Stack",
    `\`\`\`${error.stack?.slice(0, 1000) || "no stack"}\`\`\``
  );
  embed.addField("Error ID", errorId);

  await hook.send({ embeds: [embed] });
  return errorId;
};
