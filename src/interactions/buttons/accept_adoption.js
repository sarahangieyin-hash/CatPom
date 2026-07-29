import {
    getFamilyByMember,
    createFamily,
    updateFamily
} from '../../utils/families.js';

import {
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


            const parentId =
                args[0];


            const childId =
                args[1];



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





            /*
                ASEGURAR ESTRUCTURA
            */


            if (

                !Array.isArray(
                    family.members
                )

            ) {

                family.members = [];

            }


            if (

                !Array.isArray(
                    family.children
                )

            ) {

                family.children = [];

            }





            /*
                EL PADRE SIEMPRE ES MIEMBRO PRINCIPAL
            */


            if (

                !family.members.includes(
                    parentId
                )

            ) {


                family.members.push(
                    parentId
                );


            }





            /*
                AÑADIR HIJO INDIVIDUAL

                Los hijos NO son members.
                Los hijos NO desaparecen
                al casarse.
            */


            const exists =

                family.children.some(

                    child =>

                        child.id === childId

                );





            if (!exists) {


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
                LIMPIAR HIJO DE MEMBERS

                Evita que salga como pareja.
            */


            family.members =

                family.members.filter(

                    id =>

                        id !== childId

                );





            /*
                GUARDAR FAMILIA
            */


            await updateFamily(

                interaction.guild.id,

                family.id,

                family

            );





            /*
                RELACIONAR AL HIJO

                Esto NO convierte al hijo
                en miembro principal.
            */


            await setInDb(

                `familyMember:${interaction.guild.id}:${childId}`,

                family.id

            );





            await interaction.update({

                content:

                    `👶 <@${childId}> ha aceptado ser adoptado/a por <@${parentId}>.`,

                components:

                    []

            });





        } catch(error) {


            console.error(
                "========== ERROR ACCEPT_ADOPTION =========="
            );


            console.error(error);




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
