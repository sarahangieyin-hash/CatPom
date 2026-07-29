import {
    getFamilyRequest,
    deleteFamilyRequest
} from '../../family/requests/familyRequests.js';



export default {

    customId:
        'reject_marriage',



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



        await deleteFamilyRequest(

            interaction.guild.id,

            requestId

        );



        await interaction.update({

            content:
                `❌ <@${interaction.user.id}> ha rechazado la unión.`,

            embeds:
                [],

            components:
                []

        });


    }

};
