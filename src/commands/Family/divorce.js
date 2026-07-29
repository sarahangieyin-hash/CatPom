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

            return interaction.editReply(
                '❌ No perteneces a ninguna familia.'
            );

        }



        const myChildren =
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
            family.children.filter(

                child =>
                    child.parent !== userId

            );



        await updateFamily(

            guildId,

            family.id,

            family

        );



        const newFamily =
            await createFamily(

                guildId,

                [
                    userId
                ]

            );



        newFamily.children =
            myChildren;



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



        await interaction.editReply(

            '💔 La unión se ha separado.'

        );


    }

};
