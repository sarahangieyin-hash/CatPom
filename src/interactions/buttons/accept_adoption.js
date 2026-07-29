import {
    getFamilyByMember,
    createFamily,
    updateFamily
} from '../../utils/families.js';


export default async function(interaction) {


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



    if (
        !family.members.includes(
            childId
        )
    ) {

        family.members.push(
            childId
        );

    }



    family.children.push({

        id:
            childId,

        parent:
            parentId,

        adoptedAt:
            Date.now()

    });



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
