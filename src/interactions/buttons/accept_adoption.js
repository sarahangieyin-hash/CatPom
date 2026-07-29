import {
    getFamilyByMember,
    createFamily,
    updateFamily
} from '../../utils/families.js';

export default {

    customId: 'accept_adoption',

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

        let family =
            await getFamilyByMember(

                interaction.guild.id,

                parentId

            );

        if (!family) {

            family =
                await createFamily(

                    interaction.guild.id,

                    [
                        parentId
                    ]

                );

        }

        if (
            !Array.isArray(
                family.children
            )
        ) {

            family.children = [];

        }

        /*
            IMPORTANTE:
            EL HIJO NO SE AÑADE A family.members
            SOLO SE REGISTRA EN children.
        */

        if (
            !family.children.some(
                child => child.id === childId
            )
        ) {

            family.children.push({

                id:
                    childId,

                parent:
                    parentId,

                adoptedAt:
                    Date.now()

            });

        }

        await updateFamily(

            interaction.guild.id,

            family.id,

            family

        );

        await interaction.update({

            content:
                `👶 <@${childId}> ha aceptado ser adoptado/a por <@${parentId}>.`,

            components: []

        });

    }

};
