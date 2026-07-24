import { Events } from "discord.js";
import { startupLog, logger } from "../utils/logger.js";
import config from "../config/bot.js";

export default {
  name: Events.ClientReady,
  once: true,

  async execute(client) {
    try {
      client.user.setPresence(
        config.bot.presence
      );

      startupLog(
        `Ready! Logged in as ${client.user.tag}`
      );

      startupLog(
        `Serving ${client.guilds.cache.size} guild(s)`
      );

      startupLog(
        `Loaded ${client.commands.size} commands`
      );

      startupLog(
        `Buttons loaded: ${client.buttons.size}`
      );

      startupLog(
        `Select menus loaded: ${client.selectMenus.size}`
      );

    } catch (error) {
      logger.error(
        "Error in ready event:",
        error
      );
    }
  },
};
