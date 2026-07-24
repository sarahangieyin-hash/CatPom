import { Events } from "discord.js";
import { getCommandPrefix } from "../config/bot.js";
import { logger } from "../utils/logger.js";

export default {
  name: Events.MessageCreate,

  async execute(message, client) {
    if (message.author.bot) return;

    const prefix = getCommandPrefix();

    if (!message.content.startsWith(prefix)) return;

    const args = message.content
      .slice(prefix.length)
      .trim()
      .split(/\s+/);

    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);

    if (!command) return;

    try {
      await command.execute(message, args, client);
    } catch (error) {
      logger.error("Prefix command error:", error);
    }
  },
};
