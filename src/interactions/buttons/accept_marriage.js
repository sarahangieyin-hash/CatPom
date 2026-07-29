import {
    EmbedBuilder
} from 'discord.js';

import {
    acceptFamilyRequest,
    getFamilyRequest,
    deleteFamilyRequest
} from '../../family/requests/familyRequests.js';

import {
    getFamilyByMember,
    createFamily,
    updateFamily
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



            /*
                BUSCAR FAMILIAS EXISTENTES

                IMPORTANTE:
                No crear una nueva si alguien
                ya tiene hijos/adopciones.
            */


            let family = null;



            for (

                const member of updated.members

            ) {


                const existing =

                    await getFamilyByMember(

                        interaction.guild.id,

                        member

                    );



                if (existing) {

                    family = existing;

                    break;

                }


            }





            /*
                SI NADIE TIENE FAMILIA
            */


            if (!family) {


                family =

                    await createFamily(

                        interaction.guild.id,

                        updated.members

                    );


            } else {



                /*
                    AÑADIR NUEVAS PAREJAS

                    NO TOCAR:
                    - children
                    - parents
                    - siblings
                    - lovers
                */


                if (
                    !Array.isArray(
                        family.members
                    )
                ) {

                    family.members = [];

                }



                for (

                    const member of updated.members

                ) {


                    if (

                        !family.members.includes(

                            member

                        )

                    ) {


                        family.members.push(

                            member

                        );


                    }


                }





                await updateFamily(

                    interaction.guild.id,

                    family.id,

                    family

                );


            }





            await deleteFamilyRequest(

                interaction.guild.id,

                requestId

            );





            const miembros =

                updated.members.map(

                    id =>
                        `<@${id}>`

                );





            let lista;



            if (

                miembros.length === 2

            ) {


                lista =
                    `${miembros[0]} y ${miembros[1]}`;


            } else {


                lista =

                    miembros

                        .slice(0, -1)

                        .join(', ') +

                    ' y ' +

                    miembros.at(-1);


            }





            const embed =

                new EmbedBuilder()


                    .setTitle(

                        '🎉💍 ¡Felicidades! ¡Estáis casados!'

                    )


                    .setDescription(

                        `❤️ ${lista} ahora forman una unión.\n\n` +

                        '✨ Que vuestro vínculo dure para siempre ✨'

                    )


                    .setColor(

                        0xff69b4

                    );





            await interaction.message.edit({

                content:
                    '',

                embeds:
                    [

                        embed

                    ],

                components:
                    []

            });





            await interaction.deferUpdate();



            return;


        }





        const restantes =

            updated.members.length -

            updated.accepted.length;





        await interaction.deferUpdate();





        await interaction.channel.send({

            content:

                `💍 <@${interaction.user.id}> ha aceptado la unión.\n\n` +

                `⏳ Esperando a **${restantes}** persona(s) más.`

        });



    }


};
