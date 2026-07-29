import { Events } from 'discord.js';
import { logger } from '../utils/logger.js';
import { handleInteractionError } from '../utils/errorHandler.js';

export default {

    name: Events.InteractionCreate,

    async execute(interaction, client) {

        try {

            if (interaction.isChatInputCommand()) {

                const command =
                    client.commands.get(
                        interaction.commandName
                    );

                if (!command)
                    return;

                await command.execute(
                    interaction,
                    client
                );

                return;

            }


            if (interaction.isButton()) {

                let customId =
                    interaction.customId;

                let args = [];


                if (
                    customId.startsWith(
                        'accept_adoption_'
                    )
                ) {

                    customId =
                        'accept_adoption';

                    args =
                        interaction.customId
                            .replace(
                                'accept_adoption_',
                                ''
                            )
                            .split('_');

                }

                else if (
                    customId.startsWith(
                        'reject_adoption_'
                    )
                ) {

                    customId =
                        'reject_adoption';

                    args =
                        interaction.customId
                            .replace(
                                'reject_adoption_',
                                ''
                            )
                            .split('_');

                }

                else {

                    [
                        customId,
                        ...args
                    ] =
                        interaction.customId
                            .split(':');

                }


                console.log(
                    'BOTON:',
                    customId,
                    args
                );


                const button =
                    client.buttons.get(
                        customId
                    );


                if (!button) {

                    console.log(
                        'BOTON NO ENCONTRADO:',
                        customId
                    );

                    return;

                }


                await button.execute(
                    interaction,
                    client,
                    args
                );

                return;

            }


            if (
                interaction.isStringSelectMenu()
            ) {

                const [
                    customId,
                    ...args
                ] =
                    interaction.customId
                        .split(':');


                const menu =
                    client.selectMenus.get(
                        customId
                    );


                if (!menu)
                    return;


                await menu.execute(
                    interaction,
                    client,
                    args
                );

                return;

            }

        }

        catch (error) {

            logger.error(
                'Interaction error:',
                error
            );


            if (
                !interaction.replied
            ) {

                await handleInteractionError(
                    interaction,
                    error
                );

            }

        }

    }

};
