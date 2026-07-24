import { Events } from "discord.js";
import { startupLog, logger } from "../utils/logger.js";
import config from "../config/bot.js";

export default {
  name: Events.ClientReady,
  once: true,

  async execute(client) {
    try {

      // =========================
      // BOT PRESENCE
      // =========================
      if (config.presence) {

        client.user.setPresence({
          status: config.presence.status ?? "online",

          activities:
            config.presence.activities ?? []
        });

      }


      // =========================
      // STARTUP LOGS
      // =========================
      startupLog(
        `Ready! Logged in as ${client.user.tag}`
      );


      startupLog(
        `Serving ${client.guilds.cache.size} guild(s)`
      );


      startupLog(
        `Loaded ${client.commands?.size ?? 0} commands`
      );


      startupLog(
        `Buttons loaded: ${client.buttons?.size ?? 0}`
      );


      startupLog(
        `Select menus loaded: ${client.selectMenus?.size ?? 0}`
      );


      startupLog(
        "Bot is fully online ✅"
      );


    } catch (error) {

      logger.error(
        "Error in ready event:",
        error
      );

    }
  },
};
