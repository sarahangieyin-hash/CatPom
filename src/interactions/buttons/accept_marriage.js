import {
    getFamilyByMember,
    createFamily,
    updateFamily
} from '../../utils/families.js';

import {
    setInDb
} from '../../utils/database/wrapper.js';


export default {

    customId: 'accept_marriage',


    async execute(interaction, client, args) {


        const familyId =
            args[0];



        const family =
            await getFamilyByMember(

                interaction.guild.id,

                interaction.user.id

            );



        if (family) {

            return interaction.reply({

                content:
                    '❌ Ya perteneces a una familia.',

                ephemeral:
                    true

            });

        }



        const requestFamily =
            await getFromDb(

                `family:${interaction.guild.id}:${familyId}`,

                null

            );



        if (!requestFamily) {

            return interaction.reply({

                content:
                    '❌ La solicitud de unión ya no existe.',

                ephemeral:
                    true

            });

        }



        if (
            !requestFamily.members.includes(
                interaction.user.id
            )
        ) {

            requestFamily.members.push(

                interaction.user.id

            );

        }



        await updateFamily(

            interaction.guild.id,

            requestFamily.id,

            requestFamily

        );



        await setInDb(

            `familyMember:${interaction.guild.id}:${interaction.user.id}`,

            requestFamily.id

        );



        await interaction.update({

            content:
                `💍 <@${interaction.user.id}> ha aceptado la unión.`,

            components: []

        });


    }

};
