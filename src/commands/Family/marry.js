import {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} from 'discord.js';

import {
    createFamilyRequest
} from '../../family/requests/familyRequests.js';

import {
    isUserInFamily
} from '../../utils/families.js';


export default {

    data: new SlashCommandBuilder()

        .setName('marry')

        .setDescription('Solicita una unión matrimonial.')

        .addUserOption(option =>
            option
                .setName('persona1')
                .setDescription('Primera persona')
                .setRequired(true)
        )

        .addUserOption(option =>
            option
                .setName('persona2')
                .setDescription('Segunda persona')
                .setRequired(false)
        )

        .addUserOption(option =>
            option
                .setName('persona3')
                .setDescription('Tercera persona')
                .setRequired(false)
        ),


    async execute(interaction) {


        const personas = [

            interaction.options.getUser('persona1'),

            interaction.options.getUser('persona2'),

            interaction.options.getUser('persona3')

        ]
        .filter(Boolean);



        const miembros = [

            interaction.user,

            ...personas

        ];



        const ids =
            miembros.map(
                user => user.id
            );



        if (
            new Set(ids).size !== ids.length
        ) {

            return interaction.reply({

                content:
                    '❌ No puedes añadir a la misma persona varias veces.',

                ephemeral: true

            });

        }



        for (
            const user of miembros
        ) {


            const exists =
                await isUserInFamily(

                    interaction.guild.id,

                    user.id

                );



            if (exists) {

                return interaction.reply({

                    content:
                        `❌ ${user} ya pertenece a una unión.`,

                    ephemeral: true

                });

            }

        }



        const request =

            createFamilyRequest(

                'marriage',

                {

                    members: ids,

                    creator:
                        interaction.user.id

                }

            );



        const embed =

            new EmbedBuilder()

                .setTitle(
                    '💍 Nueva solicitud de unión'
                )

                .setDescription(

                    `${interaction.user} quiere formar una unión con:\n\n` +

                    personas
                        .map(
                            user =>
                                `💍 ${user}`
                        )
                        .join('\n')

                )

                .setFooter({

                    text:
                        `Solicitud: ${request.id}`

                });



        const buttons =

            new ActionRowBuilder()

                .addComponents(

                    new ButtonBuilder()

                        .setCustomId(
                            `accept_marriage:${request.id}`
                        )

                        .setLabel(
                            'Aceptar'
                        )

                        .setStyle(
                            ButtonStyle.Success
                        ),


                    new ButtonBuilder()

                        .setCustomId(
                            `reject_marriage:${request.id}`
                        )

                        .setLabel(
                            'Rechazar'
                        )

                        .setStyle(
                            ButtonStyle.Danger
                        )

                );



        await interaction.reply({

            embeds: [
                embed
            ],

            components: [
                buttons
            ]

        });


    }

};
