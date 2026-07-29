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
                "4 - Familia encontrada:",
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



            /*
                ASEGURAR MIEMBROS PRINCIPALES

                El padre siempre debe estar
                en members.
            */


            if (
                !Array.isArray(
                    family.members
                )
            ) {

                family.members = [];

            }



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
                ASEGURAR HIJOS
            */


            if (
                !Array.isArray(
                    family.children
                )
            ) {

                family.children = [];

            }



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
                SI EL HIJO ESTABA COMO MIEMBRO
                LO QUITAMOS

                Un hijo no aparece arriba
                como pareja.
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



            console.log(
                "6 - Familia guardada:",
                family
            );




            /*
                RELACIONAR HIJO CON FAMILIA
            */


            await setInDb(

                `familyMember:${interaction.guild.id}:${childId}`,

                family.id

            );



            console.log(
                "7 - familyMember actualizado"
            );




            await interaction.update({

                content:

                    `👶 <@${childId}> ha aceptado ser adoptado/a por <@${parentId}>.`,

                components:

                    []

            });



            console.log(
                "8 - Fin accept adoption"
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
