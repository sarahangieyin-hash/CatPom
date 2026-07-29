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


                const customId =
                    interaction.customId;


                let button;
                let args = [];



                if (customId.includes('_')) {


                    const parts =
                        customId.split('_');


                    const baseId =
                        parts.slice(0, 2).join('_');


                    button =
                        client.buttons.get(
                            baseId
                        );


                    args = [

                        parts.slice(2).join('_')

                    ];


                } else {


                    button =
                        client.buttons.get(
                            customId
                        );

                }



                console.log(

                    "BOTON:",

                    customId,

                    "BUSCANDO:",

                    button?.customId,

                    args

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
