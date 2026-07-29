import {
    SlashCommandBuilder
} from 'discord.js';

import {
    getFamilyByMember,
    updateFamily
} from '../../utils/families.js';


export default {

    data: new SlashCommandBuilder()

        .setName('unlover')

        .setDescription('Quita una relación de amante 🔥.')

        .addUserOption(option =>
            option
                .setName('persona')
                .setDescription('Persona amante')
                .setRequired(true)
        ),



    async execute(interaction) {


        const user =
            interaction.options.getUser('persona');



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



        if (
            !Array.isArray(
                family.lovers
            ) ||
            !family.lovers.includes(
                user.id
            )
        ) {

            return interaction.reply({

                content:
                    '❌ Esa persona no aparece como amante.',

                ephemeral: true

            });

        }



        family.lovers =
            family.lovers.filter(

                id =>
                    id !== user.id

            );



        await updateFamily(

            interaction.guild.id,

            family.id,

            family

        );



        await interaction.reply(

            `🧊 ${user} ya no aparece como amante.`

        );


    }

};
