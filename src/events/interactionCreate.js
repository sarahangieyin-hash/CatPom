console.log("USANDO ESTE interactionCreate");

import { Events } from 'discord.js';
import { logger } from '../utils/logger.js';
import { handleInteractionError } from '../utils/errorHandler.js';

export default {

    name: Events.InteractionCreate,

    async execute(
        interaction,
        client
    ) {

        try {

            /*
                COMANDOS
            */

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


            /*
                BOTONES
            */

            if (interaction.isButton()) {

                let customId =
                    interaction.customId;

                let args = [];


                /*
                    IDs CON :
                */

                if (customId.includes(":")) {

                    const parts =
                        customId.split(":");

                    customId =
                        parts[0];

                    args =
                        parts.slice(1);

                }


                /*
                    IDs CON _
                    Ej:
                    accept_adoption_PARENT_CHILD
                */

                else if (customId.startsWith("accept_adoption_")) {

                    const parts =
                        customId.split("_");

                    customId =
                        "accept_adoption";

                    args = [

                        parts[2],

                        parts[3]

                    ];

                }


                console.log(

                    "BOTON:",

                    interaction.customId,

                    "BUSCANDO:",

                    customId,

                    args

                );


                const button =
                    client.buttons.get(
                        customId
                    );


                if (!button) {

                    console.log(

                        "BOTON NO ENCONTRADO:",

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


            /*
                MENUS
            */

            if (interaction.isStringSelectMenu()) {

                const [
                    customId,
                    ...args
                ] =
                    interaction.customId.split(":");

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

                "Interaction error:",

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
