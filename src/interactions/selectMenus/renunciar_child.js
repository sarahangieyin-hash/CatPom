import {
    getFamilyByMember,
    updateFamily
} from '../../utils/families.js';


export default {

    customId: 'renunciar_child',


    async execute(interaction) {


        const childId =
            interaction.values[0];


        const family =
            await getFamilyByMember(

                interaction.guild.id,

                interaction.user.id

            );


        if (!family) {

            return interaction.reply({

                content:
                    '❌ No se encontró la familia.',

                ephemeral: true

            });

        }



        const child =
            family.children.find(

                c =>
                    c.id === childId &&
                    c.parent === interaction.user.id

            );



        if (!child) {

            return interaction.reply({

                content:
                    '❌ Ese hijo/a no pertenece a tu familia.',

                ephemeral: true

            });

        }



        family.children =
            family.children.filter(

                c =>
                    c.id !== childId

            );



        /*
            Quitarlo de miembros si ya no tiene
            ninguna relación dentro de la familia
        */

        const stillRelated =
            family.children.some(

                c =>
                    c.id === childId

            )
            ||
            family.parents?.some(

                p =>
                    p.id === childId

            )
            ||
            family.siblings?.some(

                s =>
                    s.id === childId

            )
            ||
            family.lovers?.includes(
                childId
            );



        if (!stillRelated) {

            family.members =
                family.members.filter(

                    id =>
                        id !== childId

                );

        }



        await updateFamily(

            interaction.guild.id,

            family.id,

            family

        );



        await interaction.update({

            content:
                `❌ <@${childId}> ya no forma parte de tu familia como hijo/a.`,

            components: []

        });


    }

};
