import {
    SlashCommandBuilder
} from 'discord.js';

import {
    getFamilyByMember,
    updateFamily
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

            return interaction.editReply(
                '❌ No perteneces a ninguna familia.'
            );

        }



        const myChildren =
            family.children?.filter(

                child =>
                    child.parent === userId

            ) || [];



        const otherMembers =
            family.members.filter(

                id =>
                    id !== userId

            );



        /*
            Quitamos al usuario de la unión
        */

        family.members =
            otherMembers;



        /*
            Quitamos sus hijos de esta familia
        */

        family.children =
            family.children.filter(

                child =>
                    child.parent !== userId

            );



        await updateFamily(

            guildId,

            family.id,

            family

        );



        /*
            Si tiene hijos adoptados,
            crea una familia individual
            solo para él y sus hijos
        */

        if (
            myChildren.length > 0
        ) {


            const newFamily = {

                id:
                    Date.now().toString(),

                members:
                    [],

                children:
                    myChildren,

                parents:
                    [],

                siblings:
                    [],

                lovers:
                    [],

                createdAt:
                    Date.now()

            };



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
                const child of myChildren
            ) {

                await setInDb(

                    `familyMember:${guildId}:${child.id}`,

                    newFamily.id

                );

            }


        }



        await interaction.editReply({

            content:
                '💔 Has terminado la unión correctamente.'

        });


    }

};
