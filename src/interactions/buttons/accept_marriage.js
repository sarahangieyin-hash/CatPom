import {
    getFromDb,
    setInDb
} from '../../utils/database/wrapper.js';

import {
    updateFamily
} from '../../utils/families.js';


export default {

    customId: 'accept_marriage:marriage',


    async execute(interaction, client, args) {


        const familyId =
            args[0];



        const family =
            await getFromDb(

                `family:${interaction.guild.id}:${familyId}`,

                null

            );



        if (!family) {

            return interaction.reply({

                content:
                    '❌ La solicitud de unión ya no existe.',

                ephemeral:
                    true

            });

        }



        if (
            !family.members.includes(
                interaction.user.id
            )
        ) {

            family.members.push(

                interaction.user.id

            );

        }



        await updateFamily(

            interaction.guild.id,

            family.id,

            family

        );



        await setInDb(

            `familyMember:${interaction.guild.id}:${interaction.user.id}`,

            family.id

        );



        await interaction.update({

            content:
                `💍 <@${interaction.user.id}> ha aceptado la unión.`,

            components: []

        });


    }

};
