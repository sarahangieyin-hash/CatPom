import {
    SlashCommandBuilder
} from 'discord.js';

import {
    getFamilyByMember,
    updateFamily
} from '../../utils/families.js';


export default {

    data: new SlashCommandBuilder()

        .setName('parent')

        .setDescription('Añade un padre o madre.')

        .addUserOption(option =>
            option
                .setName('persona')
                .setDescription('Padre o madre')
                .setRequired(true)
        ),



    async execute(interaction) {


        const parent =
            interaction.options.getUser('persona');



        const family =
            await getFamilyByMember(

                interaction.guild.id,

                interaction.user.id

            );



        if (!family) {

            return interaction.reply({

                content:
                    '❌ Necesitas pertenecer a una familia.',

                ephemeral: true

            });

        }



        if (
            !family.parents
        ) {

            family.parents = [];

        }



        if (
            family.parents.includes(
                parent.id
            )
        ) {

            return interaction.reply({

                content:
                    '❌ Esa persona ya es tu padre/madre.',

                ephemeral: true

            });

        }



        family.parents.push({

            id:
                parent.id,

            child:
                interaction.user.id

        });



        await updateFamily(

            interaction.guild.id,

            family.id,

            family

        );



        await interaction.reply(

            `👨‍👩‍👧 ${parent} añadido como padre/madre.`

        );


    }

};
