import {
    SlashCommandBuilder
} from 'discord.js';

import {
    getFamilyByMember
} from '../../utils/families.js';

import {
    renderFamilyTree
} from '../../family/render/treeRenderer.js';


export default {

    data: new SlashCommandBuilder()

        .setName('tree')

        .setDescription('Muestra el árbol familiar.'),



    async execute(interaction) {


        const family =
            await getFamilyByMember(

                interaction.guild.id,

                interaction.user.id

            );



        if (!family) {

            return interaction.reply({

                content:
                    '❌ No perteneces a ninguna familia.',

                ephemeral: true

            });

        }



        await interaction.deferReply();



        const image =
            await renderFamilyTree(

                interaction.guild,

                family

            );



        await interaction.editReply({

            files: [

                {

                    attachment:
                        image,

                    name:
                        'arbol-familiar.png'

                }

            ]

        });


    }

};
