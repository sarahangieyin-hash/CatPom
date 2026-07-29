import {
    SlashCommandBuilder
} from 'discord.js';

import {
    getFamilyByMember,
    updateFamily
} from '../../utils/families.js';


export default {

    data: new SlashCommandBuilder()

        .setName('sibling')

        .setDescription('Añade un hermano o hermana.')

        .addUserOption(option =>
            option
                .setName('persona')
                .setDescription('Hermano o hermana')
                .setRequired(true)
        ),



    async execute(interaction) {


        const sibling =
            interaction.options.getUser('persona');



        if (
            sibling.id === interaction.user.id
        ) {

            return interaction.reply({

                content:
                    '❌ No puedes añadirte a ti mismo.',

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
                    '❌ Necesitas pertenecer a una familia.',

                ephemeral: true

            });

        }



        if (
            !family.siblings
        ) {

            family.siblings = [];

        }



        const exists =
            family.siblings.some(

                relation =>

                    relation.id === sibling.id

            );



        if (exists) {

            return interaction.reply({

                content:
                    '❌ Esa persona ya aparece como hermano/a.',

                ephemeral: true

            });

        }



        family.siblings.push({

            id:
                sibling.id,

            member:
                interaction.user.id

        });



        await updateFamily(

            interaction.guild.id,

            family.id,

            family

        );



        await interaction.reply(

            `👥 ${sibling} añadido como hermano/a.`

        );


    }

};
