import {
    getFamilyRequest,
    acceptFamilyRequest,
    deleteFamilyRequest
} from '../../family/requests/familyRequests.js';

import {
    createFamily,
    getFamilyByMember,
    updateFamily
} from '../../utils/families.js';


export default {

    customId: 'accept_marriage',


    async execute(interaction, client, args) {


        const id = args[0];


        const request =
            getFamilyRequest(id);



        if (!request) {

            return interaction.reply({

                content:
                    '❌ Esta solicitud ya no existe.',

                ephemeral: true

            });

        }



        if (
            !request.members.includes(
                interaction.user.id
            )
        ) {

            return interaction.reply({

                content:
                    '❌ No formas parte de esta unión.',

                ephemeral: true

            });

        }



        acceptFamilyRequest(
            id,
            interaction.user.id
        );



        const updated =
            getFamilyRequest(id);



        const accepted =
            updated.members.every(
                member =>
                    updated.accepted.includes(member)
            );



        if (!accepted) {


            return interaction.reply({

                content:
                    '✅ Has aceptado la unión. Esperando al resto de personas.',

                ephemeral: true

            });


        }



        const unionId =
            `union_${Date.now()}`;



        await createFamily(

            interaction.guild.id,

            unionId,

            {

                members:
                    updated.members,

                children: [],

                lovers: [],

                createdBy:
                    updated.creator

            }

        );



        for (
            const member of updated.members
        ) {


            const oldFamily =
                await getFamilyByMember(
                    interaction.guild.id,
                    member
                );


            if (oldFamily) {

                oldFamily.members =
                    oldFamily.members.filter(
                        id =>
                            id !== member
                    );


                await updateFamily(

                    interaction.guild.id,

                    oldFamily.id,

                    oldFamily

                );

            }

        }



        deleteFamilyRequest(id);



        await interaction.update({

            content:

                `💍 Unión creada entre ${updated.members.map(id => `<@${id}>`).join(', ')}.`,

            embeds: [],

            components: []

        });


    }

};
