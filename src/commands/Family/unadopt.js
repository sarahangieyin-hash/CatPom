import {
    SlashCommandBuilder
} from 'discord.js';

import {
    getFamilyByMember,
    updateFamily
} from '../../utils/families.js';


export default {

    data: new SlashCommandBuilder()

        .setName('unadopt')

        .setDescription('Elimina una adopción.')

        .addUserOption(option =>
            option
                .setName('persona')
                .setDescription('Hijo adoptado')
                .setRequired(true)
        ),



    async execute(interaction) {


        const child =
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
                family.children
            )
        ) {

            return interaction.reply({

                content:
                    '❌ No hay hijos adoptados en esta unión.',

                ephemeral: true

            });

        }



        const exists =
            family.children.some(

                childData =>

                    childData.id === child.id

            );



        if (!exists) {

            return interaction.reply({

                content:
                    '❌ Esa persona no aparece como hija de la unión.',

                ephemeral: true

            });

        }



        family.children =
            family.children.filter(

                childData =>

                    childData.id !== child.id

            );



        await updateFamily(

            interaction.guild.id,

            family.id,

            family

        );



        await interaction.reply(

            `❌ ${child} ya no forma parte de la unión como hijo/a adoptado/a.`

        );


    }

};
