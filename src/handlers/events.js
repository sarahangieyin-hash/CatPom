export default async function loadEvents(client) {


    client.once(
        'ready',
        () => {

            console.log(
                `🤖 Bot conectado como ${client.user.tag}`
            );

        }
    );



    client.on(
        'interactionCreate',
        async interaction => {


            try {


                // SLASH COMMANDS

                if (
                    interaction.isChatInputCommand()
                ) {

                    const command =
                        client.commands.get(
                            interaction.commandName
                        );


                    if (!command)
                        return;


                    await command.execute(
                        interaction
                    );

                    return;

                }



                // BUTTONS

                if (
                    interaction.isButton()
                ) {


                    let button =
                        client.buttons.get(
                            interaction.customId
                        );



                    // IDs dinámicos:
                    // accept_adoption_USER_USER

                    if (!button) {


                        if (
                            interaction.customId.startsWith(
                                'accept_adoption_'
                            )
                        ) {

                            button =
                                client.buttons.get(
                                    'accept_adoption'
                                );

                        }



                        if (
                            interaction.customId.startsWith(
                                'reject_adoption_'
                            )
                        ) {

                            button =
                                client.buttons.get(
                                    'reject_adoption'
                                );

                        }


                    }



                    if (!button)
                        return;



                    await button.execute(
                        interaction
                    );


                }



                // SELECT MENUS

                if (
                    interaction.isStringSelectMenu()
                ) {


                    const menu =
                        client.selectMenus.get(
                            interaction.customId
                        );


                    if (!menu)
                        return;


                    await menu.execute(
                        interaction
                    );


                }



            } catch(error) {


                console.error(
                    'Interaction error:',
                    error
                );


                if (
                    !interaction.replied &&
                    !interaction.deferred
                ) {

                    await interaction.reply({

                        content:
                            '❌ Ha ocurrido un error.',

                        ephemeral:true

                    });

                }


            }


        }
    );


}
