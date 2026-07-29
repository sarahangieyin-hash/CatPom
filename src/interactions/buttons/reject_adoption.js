export default {

    customId: 'reject_adoption',

    async execute(
        interaction,
        client,
        args
    ) {

        const [
            parentId,
            childId
        ] = args;

        if (
            interaction.user.id !== childId
        ) {

            return interaction.reply({

                content:
                    '❌ Esta solicitud no es para ti.',

                ephemeral: true

            });

        }

        await interaction.update({

            content:
                `❌ <@${childId}> ha rechazado la adopción de <@${parentId}>.`,

            components: []

        });

    }

};export default {

    customId: 'reject_adoption',

    async execute(interaction) {


        const [
            ,
            parentId,
            childId
        ] = interaction.customId.split('_');



        if (
            interaction.user.id !== childId
        ) {

            return interaction.reply({

                content:
                    '❌ Esta solicitud no es para ti.',

                ephemeral: true

            });

        }



        await interaction.update({

            content:
                `❌ <@${childId}> ha rechazado la adopción de <@${parentId}>.`,

            components: []

        });


    }

};
