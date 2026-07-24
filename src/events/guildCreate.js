import { Events } from 'discord.js';
import { logger } from '../utils/logger.js';

export default {
  name: Events.GuildCreate,

  async execute(guild) {
    try {
      logger.info('Bot joined guild', {
        event: 'guild.create',
        guildId: guild.id,
        guildName: guild.name,
        memberCount: guild.memberCount,
      });

    } catch (error) {
      logger.error(
        'Error in guildCreate event:',
        error
      );
    }
  },
};
