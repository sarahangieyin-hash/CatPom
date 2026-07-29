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

            return interaction.reply({

                content:
                    '❌ No perteneces a ninguna unión.',

                ephemeral:
                    true

            });

        }



        if (
            family.members.length <= 1
        ) {

            return interaction.reply({

                content:
                    '❌ No tienes pareja que abandonar.',

                ephemeral:
                    true

            });

        }



        const remainingMembers =
            family.members.filter(

                id =>
                    id !== userId

            );



        const leavingChildren =
            family.children.filter(

                child =>
                    child.parent === userId

            );



        const stayingChildren =
            family.children.filter(

                child =>
                    child.parent !== userId

            );



        family.members =
            remainingMembers;



        family.children =
            stayingChildren;



        await updateFamily(

            guildId,

            family.id,

            family

        );



        /*
            Crear familia nueva para quien se va
            con sus hijos adoptados
        */


        if (
            leavingChildren.length > 0
        ) {


            const newFamily =
                await createFamily(

                    guildId,

                    [
                        userId
                    ]

                );



            newFamily.children =
                leavingChildren;



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
                const child of leavingChildren
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



        await interaction.reply(

            '💔 Has terminado la unión y la familia se ha separado correctamente.'

        );


    }

};
