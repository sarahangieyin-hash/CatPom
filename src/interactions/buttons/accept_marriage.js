import {
    EmbedBuilder
} from 'discord.js';

import {
    acceptFamilyRequest,
    getFamilyRequest,
    deleteFamilyRequest
} from '../../family/requests/familyRequests.js';

import {
    createFamily
} from '../../utils/families.js';



export default {

    customId:
        'accept_marriage',



    async execute(
        interaction,
        client,
        args
    ) {


        const requestId =
            args[0];



        const request =
            await getFamilyRequest(

                interaction.guild.id,

                requestId

            );



        if (!request) {

            return interaction.reply({

                content:
                    '❌ La solicitud de unión ya no existe.',

                ephemeral:
                    true

            });

        }



        if (
            !request.members.includes(
                interaction.user.id
            )
        ) {

            return interaction.reply({

                content:
                    '❌ Esta solicitud no es para ti.',

                ephemeral:
                    true

            });

        }



        await acceptFamilyRequest(

            interaction.guild.id,

            requestId,

            interaction.user.id

        );



        const updated =
            await getFamilyRequest(

                interaction.guild.id,

                requestId

            );



        const allAccepted =
            updated.members.every(

                id =>
                    updated.accepted.includes(id)

            );



if (allAccepted) {

    await createFamily(

        interaction.guild.id,

        updated.members

    );

    await deleteFamilyRequest(

        interaction.guild.id,

        requestId

    );

    const embed =
        new EmbedBuilder()

            .setTitle(
                '💍 ¡Se han casado!'
            )

            .setDescription(

                updated.members
                    .map(id => `<@${id}>`)
                    .join(' ❤️ ')

            )

            .setColor(
                0xff69b4
            );

    await interaction.message.edit({

        content: '',

        embeds: [
            embed
        ],

        components: []

    });

    await interaction.deferUpdate();

    return;

}


/*
    Aún faltan personas por aceptar
*/

const restantes =
    updated.members.length -
    updated.accepted.length;

await interaction.reply({

    content:
        '✅ Has aceptado la unión.',

    ephemeral: true

});

await interaction.channel.send({

    content:

        `💍 <@${interaction.user.id}> ha aceptado la unión.\n\n` +

        `⏳ Esperando a **${restantes}** persona(s) más.`

});

return;
