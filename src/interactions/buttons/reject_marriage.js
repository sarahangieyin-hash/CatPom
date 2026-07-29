import {
    getFamilyRequest,
    rejectFamilyRequest,
    deleteFamilyRequest
} from '../../family/requests/familyRequests.js';


export default {

    customId: 'reject_marriage',


    async execute(interaction, client, args) {


        const id = args[0];


        const request =
            getFamilyRequest(id);



        if (!request) {

            return interaction.reply({

                content:
                    '❌ Esta solicitud ya no existe.',

                ephemeral: true

            });

        }



        if (
            !request.members.includes(
                interaction.user.id
            )
        ) {

            return interaction.reply({

                content:
                    '❌ No formas parte de esta unión.',

                ephemeral: true

            });

        }



        rejectFamilyRequest(
            id,
            interaction.user.id
        );


        deleteFamilyRequest(id);



        await interaction.update({

            content:

                `❌ <@${interaction.user.id}> ha rechazado la unión.`,

            embeds: [],

            components: []

        });


    }

};
