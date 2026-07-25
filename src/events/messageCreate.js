import { Events } from "discord.js";
import { getCommandPrefix } from "../config/bot.js";
import { logger } from "../utils/logger.js";

export default {
  name: Events.MessageCreate,

  async execute(message, client) {

    if (message.author.bot) return;


    let content = message.content;


    // Sistema con mención al bot
    if (message.mentions.has(client.user)) {

      content = content
        .replace(`<@${client.user.id}>`, "")
        .replace(`<@!${client.user.id}>`, "")
        .trim();

    }

    // Sistema con prefijo normal
    else {

      const prefix = getCommandPrefix();

      if (!content.startsWith(prefix)) return;

      content = content
        .slice(prefix.length)
        .trim();

    }


    const args = content.split(/\s+/);

    const commandName = args.shift()
      .toLowerCase();


    const command = client.commands.get(commandName);

    if (!command) return;


    try {

      await command.execute(
        message,
        args,
        client
      );

    } catch (error) {

      logger.error(
        "Prefix command error:",
        error
      );

    }

  },
};
