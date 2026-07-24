import { Events } from 'discord.js';
import { logger } from '../utils/logger.js';
import { handleInteractionError } from '../utils/errorHandler.js';

export default {
  name: Events.InteractionCreate,

  async execute(interaction, client) {

    try {

      if (interaction.isChatInputCommand()) {

        const command = client.commands.get(
          interaction.commandName
        );

        if (!command) return;

        await command.execute(
          interaction,
          client
        );

        return;
      }


      if (interaction.isButton()) {

        const [customId, ...args] =
          interaction.customId.split(':');


        let button =
          client.buttons.get(customId);


        if (!button) {

          for (const btn of client.buttons.values()) {

            if (
              btn.customIdPrefix &&
              customId.startsWith(btn.customIdPrefix)
            ) {
              button = btn;
              break;
            }

          }

        }


        if (!button) return;


        await button.execute(
          interaction,
          client,
          args
        );

        return;
      }


      if (interaction.isStringSelectMenu()) {

        const [customId, ...args] =
          interaction.customId.split(':');


        const menu =
          client.selectMenus.get(customId);


        if (!menu) return;


        await menu.execute(
          interaction,
          client,
          args
        );

        return;
      }


    } catch (error) {

      logger.error(
        'Interaction error:',
        error
      );


      await handleInteractionError(
        interaction,
        error
      );

    }

  }
};
