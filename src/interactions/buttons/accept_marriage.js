import {
    acceptFamilyRequest,
    getFamilyRequest
} from '../../family/requests/familyRequests.js';

import {
    createFamily
} from '../../utils/families.js';



export default {

    customId:
        'accept_marriage:marriage',



    async execute(
        interaction,
        client,
        args
    ) {


        const requestId =
            args[0];



        const request =
            await getFamilyRequest(

                interaction.guild.id,

                requestId

            );



        if (!request) {

            return interaction.reply({

                content:
                    '❌ La solicitud de unión ya no existe.',

                ephemeral:
                    true

            });

        }



        if (
            !request.members.includes(
                interaction.user.id
            )
        ) {

            return interaction.reply({

                content:
                    '❌ Esta solicitud no es para ti.',

                ephemeral:
                    true

            });

        }



        await acceptFamilyRequest(

            interaction.guild.id,

            requestId,

            interaction.user.id

        );



        const updated =
            await getFamilyRequest(

                interaction.guild.id,

                requestId

            );



        const allAccepted =
            updated.members.every(

                id =>
                    updated.accepted.includes(
                        id
                    )

            );



        if (allAccepted) {


            const family =
                await createFamily(

                    interaction.guild.id,

                    {

                        members:
                            updated.members,

                        lovers:
                            [],

                        parents:
                            [],

                        children:
                            []

                    }

                );



            await interaction.update({

                content:
                    '💍 Unión creada correctamente.',

                components:
                    []

            });


            return;

        }



        await interaction.update({

            content:
                `💍 <@${interaction.user.id}> ha aceptado la unión.`,

            components:
                []

        });


    }

};
