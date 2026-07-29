console.log("ESTOY USANDO interactionCreate.js");
import { Events } from 'discord.js';
import { logger } from '../utils/logger.js';
import { handleInteractionError } from '../utils/errorHandler.js';


export default {

    name:
        Events.InteractionCreate,


    async execute(
        interaction,
        client
    ) {

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


                const parts =
                    interaction.customId.split('_');



                const customId =
                    parts[0] + '_' + parts[1];



                const args =
                    [
                        parts.slice(2).join('_')
                    ];



                console.log(

                    "BOTON:",

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




            if (interaction.isStringSelectMenu()) {


                const [
                    customId,
                    ...args
                ] =
                    interaction.customId.split(':');



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
