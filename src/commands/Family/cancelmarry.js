import {
    SlashCommandBuilder
} from 'discord.js';

import {
    deleteMarriageRequest
} from '../../utils/marriageRequests.js';


export default {

    data: new SlashCommandBuilder()

        .setName('cancelarsoli')

        .setDescription('Cancela tu solicitud de unión pendiente.'),



    async execute(interaction) {


        await deleteMarriageRequest(

            interaction.guild.id,

            interaction.user.id

        );



        await interaction.reply({

            content:
                '❌ Solicitud de unión cancelada.',

            ephemeral:
                true

        });


    }

};
