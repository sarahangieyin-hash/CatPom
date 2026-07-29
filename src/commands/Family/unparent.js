import {
    SlashCommandBuilder
} from 'discord.js';

import {
    getFamilyByMember,
    updateFamily
} from '../../utils/families.js';


export default {

    data: new SlashCommandBuilder()

        .setName('unparent')

        .setDescription('Abandona tu familia de sangre.'),


    async execute(interaction) {


        const userId =
            interaction.user.id;


        const family =
            await getFamilyByMember(

                interaction.guild.id,

                userId

            );


        if (!family) {

            return interaction.reply({

                content:
                    '❌ No perteneces a ninguna familia.',

                ephemeral: true

            });

        }



        // Quitar relación con padres

        family.parents =
            (family.parents || []).filter(

                parent =>
                    parent.id !== userId

            );



        // Quitar relación como hijo

        family.children =
            (family.children || []).filter(

                child =>
                    child.id !== userId

            );



        // Quitar hermanos

        family.siblings =
            (family.siblings || []).filter(

                sibling =>
                    sibling.id !== userId

            );



        // Mantener:
        // - lovers 💍🔥
        // - tus propios hijos 👶



        // Quitar al usuario de miembros
        // solo si no tiene hijos ni pareja

        const hasChildren =
            family.children.some(

                child =>
                    child.parent === userId

            );


        const hasLovers =
            (family.lovers || []).includes(
                userId
            );


        if (
            !hasChildren &&
            !hasLovers
        ) {

            family.members =
                family.members.filter(

                    id =>
                        id !== userId

                );

        }



        await updateFamily(

            interaction.guild.id,

            family.id,

            family

        );



        await interaction.reply({

            content:
                '🚪 Has abandonado tu familia de sangre. Tus hijos y parejas siguen contigo.',

        });


    }

};
