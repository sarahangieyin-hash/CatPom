import {
    SlashCommandBuilder
} from 'discord.js';


import {
    getFamilyRequestByCreator,
    deleteFamilyRequest
} from '../../family/requests/familyRequests.js';



export default {

    data: new SlashCommandBuilder()

        .setName('cancelarsoli')

        .setDescription(
            'Cancela tu solicitud de unión pendiente.'
        ),



    async execute(interaction) {


        const guildId =
            interaction.guild.id;


        const userId =
            interaction.user.id;



        const request =
            await getFamilyRequestByCreator(

                guildId,

                userId

            );



        if (!request) {


            return interaction.reply({

                content:
                    '❌ No tienes ninguna solicitud de unión pendiente.',

                ephemeral:
                    true

            });


        }



        await deleteFamilyRequest(

            guildId,

            request.id

        );



        await interaction.reply({

            content:
                '❌ Solicitud de unión cancelada.',

            ephemeral:
                true

        });


    }

};
