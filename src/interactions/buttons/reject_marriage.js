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



        await deleteFamilyRequest(

            interaction.guild.id,

            requestId

        );



        await interaction.update({

            content:

                `❌ <@${interaction.user.id}> ha rechazado la unión. No se ha creado el matrimonio.`,

            embeds:
                [],

            components:
                []

        });



    }

};
