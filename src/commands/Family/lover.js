import {
    SlashCommandBuilder
} from 'discord.js';

import {
    getFamilyByMember,
    updateFamily
} from '../../utils/families.js';


export default {

    data: new SlashCommandBuilder()

        .setName('lover')

        .setDescription('Añade una relación de amante 🔥.')

        .addUserOption(option =>
            option
                .setName('persona')
                .setDescription('Persona amante')
                .setRequired(true)
        ),



    async execute(interaction) {


        const user =
            interaction.options.getUser('persona');



        if (
            user.id === interaction.user.id
        ) {

            return interaction.reply({

                content:
                    '❌ No puedes añadirse a ti mismo.',

                ephemeral: true

            });

        }



        const family =
            await getFamilyByMember(

                interaction.guild.id,

                interaction.user.id

            );



        if (!family) {

            return interaction.reply({

                content:
                    '❌ Necesitas pertenecer a una unión para tener amantes.',

                ephemeral: true

            });

        }



        if (
            !family.lovers
        ) {

            family.lovers = [];

        }



        if (
            family.lovers.includes(
                user.id
            )
        ) {

            return interaction.reply({

                content:
                    '❌ Esa persona ya está registrada como amante.',

                ephemeral: true

            });

        }



        family.lovers.push(
            user.id
        );



        await updateFamily(

            interaction.guild.id,

            family.id,

            family

        );



        await interaction.reply(

            `🔥 ${user} ha sido añadido como amante.`

        );


    }

};
