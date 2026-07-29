import {
    SlashCommandBuilder
} from 'discord.js';

import {
    getFamilyByMember,
    updateFamily
} from '../../utils/families.js';


export default {

    data: new SlashCommandBuilder()

        .setName('divorce')

        .setDescription('Termina tu unión.'),


    async execute(interaction) {


        const family =
            await getFamilyByMember(

                interaction.guild.id,

                interaction.user.id

            );


        if (!family) {

            return interaction.reply({

                content:
                    '❌ No perteneces a ninguna unión.',

                ephemeral: true

            });

        }


        family.members =
            family.members.filter(

                id =>
                    id !== interaction.user.id

            );


        await updateFamily(

            interaction.guild.id,

            family.id,

            family

        );


        await interaction.reply(

            '💔 Has salido de la unión.'

        );


    }

};
