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

                await command.execute(interaction, client);
                return;
            }


            if (interaction.isButton()) {

                console.log("BOTON:", interaction.customId);

                const button = client.buttons.get(
                    interaction.customId
                );


                if (!button) {
                    console.log("BOTON NO ENCONTRADO");
                    return;
                }


                await button.execute(
                    interaction,
                    client
                );

                return;
            }


            if (interaction.isStringSelectMenu()) {

                const menu = client.selectMenus.get(
                    interaction.customId
                );

                if (!menu) return;

                await menu.execute(
                    interaction,
                    client
                );

                return;
            }


        } catch (error) {

            logger.error(
                'Interaction error:',
                error
            );


            if (!interaction.replied) {
                await handleInteractionError(
                    interaction,
                    error
                );
            }
        }
    }
};
