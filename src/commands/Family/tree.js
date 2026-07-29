import {
    SlashCommandBuilder
} from 'discord.js';

import {
    getFamilyByMember,
    updateFamily
} from '../../utils/families.js';

import {
    renderFamilyTree
} from '../../family/render/treeRenderer.js';


export default {

    data: new SlashCommandBuilder()

        .setName('tree')

        .setDescription('Muestra el árbol familiar.'),



    async execute(interaction) {


        let family =
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



        /*
            LIMPIEZA AUTOMÁTICA

            - Quita hijos duplicados
            - Quita hijos que también estén como miembros
        */


        if (
            Array.isArray(family.children)
        ) {

            family.children =
                Array.from(

                    new Map(

                        family.children.map(

                            child => [

                                child.id,

                                child

                            ]

                        )

                    ).values()

                );



            const childIds =
                family.children.map(
                    child =>
                        child.id
                );



            family.members =
                family.members.filter(

                    id =>
                        !childIds.includes(id)

                );

        }



        await updateFamily(

            interaction.guild.id,

            family.id,

            family

        );



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
