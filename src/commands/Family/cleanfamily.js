import {
    SlashCommandBuilder
} from 'discord.js';

import {
    getFamilyByMember,
    updateFamily
} from '../../utils/families.js';


export default {

    data: new SlashCommandBuilder()

        .setName('cleanfamily')

        .setDescription('Limpia hijos de la familia.'),



    async execute(interaction) {


        const family =
            await getFamilyByMember(

                interaction.guild.id,

                interaction.user.id

            );



        if (!family) {

            return interaction.reply({

                content:
                    '❌ No tienes familia.',

                ephemeral:
                    true

            });

        }



        family.children = [];



        await updateFamily(

            interaction.guild.id,

            family.id,

            family

        );



        await interaction.reply({

            content:
                '✅ Hijos limpiados de esta familia.',

            ephemeral:
                true

        });


    }

};
