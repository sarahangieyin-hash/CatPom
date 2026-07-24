import { Events } from 'discord.js';
import { logger } from '../utils/logger.js';

export default {
  name: Events.GuildMemberAdd,
  once: false,

  async execute(member) {
    try {
      logger.info('Member joined', {
        event: 'guild.memberAdd',
        guildId: member.guild.id,
        userId: member.user.id,
        username: member.user.tag,
        memberCount: member.guild.memberCount,
      });

    } catch (error) {
      logger.error(
        'Error in guildMemberAdd event:',
        error
      );
    }
  }
};
