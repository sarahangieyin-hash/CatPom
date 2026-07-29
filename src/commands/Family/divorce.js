import {
    SlashCommandBuilder
} from 'discord.js';

import {
    getFamilyByMember,
    updateFamily,
    createFamily
} from '../../utils/families.js';

import {
    setInDb
} from '../../utils/database/wrapper.js';


export default {

    data: new SlashCommandBuilder()

        .setName('divorce')

        .setDescription('Termina tu unión.'),



    async execute(interaction) {


        await interaction.deferReply();



        const guildId =
            interaction.guild.id;


        const userId =
            interaction.user.id;



        const family =
            await getFamilyByMember(

                guildId,

                userId

            );



        if (!family) {

            return interaction.editReply({

                content:
                    '❌ No perteneces a ninguna unión.'

            });

        }



        if (
            !family.members ||
            family.members.length < 2
        ) {

            return interaction.editReply({

                content:
                    '❌ No tienes pareja.'

            });

        }



        const childrenToKeep =
            family.children?.filter(

                child =>
                    child.parent === userId

            ) || [];



        family.members =
            family.members.filter(

                id =>
                    id !== userId

            );



        family.children =
            family.children?.filter(

                child =>
                    child.parent !== userId

            ) || [];



        await updateFamily(

            guildId,

            family.id,

            family

        );



        if (
            childrenToKeep.length > 0
        ) {


            const newFamily =
                await createFamily(

                    guildId,

                    [
                        userId
                    ]

                );



            newFamily.children =
                childrenToKeep;



            await updateFamily(

                guildId,

                newFamily.id,

                newFamily

            );



            await setInDb(

                `familyMember:${guildId}:${userId}`,

                newFamily.id

            );



            for (
                const child of childrenToKeep
            ) {

                await setInDb(

                    `familyMember:${guildId}:${child.id}`,

                    newFamily.id

                );

            }


        } else {


            await setInDb(

                `familyMember:${guildId}:${userId}`,

                null

            );


        }



        await interaction.editReply({

            content:
                '💔 Has terminado la unión correctamente.'

        });


    }

};
