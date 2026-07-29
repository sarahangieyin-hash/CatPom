import {
    getFamilyRequest,
    acceptFamilyRequest,
    deleteFamilyRequest
} from '../../family/requests/familyRequests.js';

import {
    createFamily
} from '../../utils/families.js';



export default {


    customId: 'accept_marriage',



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
                    '❌ Esta solicitud ya no existe.',

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
                    '❌ No formas parte de esta solicitud.',

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



        const acceptedAll =

            updated.members.every(

                id =>

                    updated.accepted.includes(id)

            );



        if (!acceptedAll) {


            return interaction.reply({

                content:

                    '✅ Has aceptado. Esperando al resto de personas.',

                ephemeral:
                    true

            });


        }



        const family =

            await createFamily(

                interaction.guild.id,

                updated.members

            );



        await deleteFamilyRequest(

            interaction.guild.id,

            requestId

        );



        await interaction.update({

            content:

                `💍 Unión creada entre ${family.members.map(id => `<@${id}>`).join(', ')}.`,

            embeds:
                [],

            components:
                []

        });


    }

};
