import {
    getFamilyByMember,
    createFamily,
    updateFamily
} from '../../utils/families.js';

import {
    setInDb
} from '../../utils/database/wrapper.js';


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



        if (
            !family.children.some(

                child =>
                    child.id === childId

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



        /*
            REGISTRAR AL HIJO COMO PARTE DE LA FAMILIA
            PARA QUE PUEDA USAR /tree
        */

        await setInDb(

            `familyMember:${interaction.guild.id}:${childId}`,

            family.id

        );



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
