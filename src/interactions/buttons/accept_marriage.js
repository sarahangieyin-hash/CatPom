import {
    getFamilyRequest,
    acceptFamilyRequest,
    deleteFamilyRequest
} from '../../family/requests/familyRequests.js';

import {
    createFamily,
    getFamilyByMember
} from '../../utils/families.js';


export default {

    customId: 'accept_marriage',


    async execute(interaction, client, args) {


        const requestId = args[0];


        const request =
            await getFamilyRequest(
                interaction.guild.id,
                requestId
            );


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
                    '❌ No formas parte de esta solicitud.',

                ephemeral: true

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
                member =>
                    updated.accepted.includes(member)
            );



        if (!allAccepted) {

            return interaction.reply({

                content:
                    '✅ Has aceptado. Esperando al resto de personas.',

                ephemeral: true

            });

        }



        const alreadyInFamily =
            await Promise.any(

                updated.members.map(
                    async member => {

                        return await getFamilyByMember(

                            interaction.guild.id,

                            member

                        );

                    }

                )

            ).catch(
                () => null
            );



        if (alreadyInFamily) {

            await deleteFamilyRequest(

                interaction.guild.id,

                requestId

            );


            return interaction.update({

                content:
                    '❌ Alguien ya pertenece a una unión.',

                embeds: [],

                components: []

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



        await deleteFamilyRequest(

            interaction.guild.id,

            requestId

        );



        await interaction.update({

            content:

                `💍 Unión creada entre ${updated.members.map(id => `<@${id}>`).join(', ')}.`,

            embeds: [],

            components: []

        });


    }

};
