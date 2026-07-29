import {
    getFamilyByMember,
    createFamily,
    updateFamily
} from '../../utils/families.js';

import {
    getFromDb,
    setInDb
} from '../../utils/database/wrapper.js';



export default {

    customId:
        'accept_adoption',



    async execute(
        interaction,
        client,
        args
    ) {


        try {


            console.log("1 - Inicio accept adoption");



            const parentId =
                args[0];


            const childId =
                args[1];



            console.log(
                "2 - IDs:",
                {
                    parentId,
                    childId
                }
            );



            if (
                interaction.user.id !== childId
            ) {


                return interaction.reply({

                    content:
                        '❌ Esta solicitud no es para ti.',

                    ephemeral:
                        true

                });


            }



            console.log(
                "3 - Usuario correcto"
            );



            let family =
                await getFamilyByMember(

                    interaction.guild.id,

                    parentId

                );



            console.log(
                "4 - Familia padre:",
                family
            );



            if (!family) {


                family =
                    await createFamily(

                        interaction.guild.id,

                        [
                            parentId
                        ]

                    );


                console.log(
                    "5 - Familia creada"
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
                EVITAR DUPLICADOS
            */


            const alreadyChild =

                family.children.some(

                    child =>
                        child.id === childId

                );



            if (!alreadyChild) {


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
                QUITAR AL HIJO DE MEMBERS

                Una persona adoptada NO es pareja.
            */


            if (
                Array.isArray(
                    family.members
                )
            ) {


                family.members =

                    family.members.filter(

                        id =>
                            id !== childId

                    );


            }



            /*
                GUARDAR FAMILIA
            */


            await updateFamily(

                interaction.guild.id,

                family.id,

                family

            );



            console.log(
                "6 - Familia actualizada"
            );



            /*
                ASIGNAR FAMILIA AL HIJO
            */


            await setInDb(

                `familyMember:${interaction.guild.id}:${childId}`,

                family.id

            );



            console.log(
                "7 - familyMember guardado"
            );



            await interaction.update({

                content:

                    `👶 <@${childId}> ha aceptado ser adoptado/a por <@${parentId}>.`,

                components:

                    []

            });



            console.log(
                "8 - Interaction finalizada"
            );



        } catch(error) {


            console.error(
                "========== ERROR ACCEPT_ADOPTION =========="
            );


            console.error(error);


            console.error(error.stack);



            if (
                !interaction.replied &&
                !interaction.deferred
            ) {


                await interaction.reply({

                    content:

                        `❌ Error: ${error.message}`,

                    ephemeral:

                        true

                }).catch(() => {});



            } else {


                await interaction.followUp({

                    content:

                        `❌ Error: ${error.message}`,

                    ephemeral:

                        true

                }).catch(() => {});


            }


        }


    }


};
