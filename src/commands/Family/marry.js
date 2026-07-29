import {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} from 'discord.js';

import {
    createFamilyRequest,
    getFamilyRequestByCreator
} from '../../family/requests/familyRequests.js';


export default {

    data: new SlashCommandBuilder()

        .setName('marry')
        .setDescription('Solicita un matrimonio o unión.')

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


        const existing =
            await getFamilyRequestByCreator(
                interaction.guild.id,
                interaction.user.id
            );


        if (existing) {

            return interaction.reply({

                content:
                    '❌ Ya tienes una solicitud de unión pendiente.',

                ephemeral:
                    true

            });

        }



        const personas = [

            interaction.options.getUser('persona1'),
            interaction.options.getUser('persona2'),
            interaction.options.getUser('persona3')

        ].filter(Boolean);



        const miembros = [

            interaction.user,
            ...personas

        ];



        const ids =
            miembros.map(
                user => user.id
            );



        const requestId =
            `marriage_${Date.now()}`;



        await createFamilyRequest(

            interaction.guild.id,

            requestId,

            {

                type:
                    'marriage',

                members:
                    ids,

                creator:
                    interaction.user.id,

                accepted:
                    [
                        interaction.user.id
                    ],

                createdAt:
                    Date.now()

            }

        );



        const embed =
            new EmbedBuilder()

                .setTitle(
                    '💍 Solicitud de unión'
                )

                .setDescription(

                    `${interaction.user} quiere formar una unión con:\n\n` +

                    personas
                        .map(
                            user => `💍 ${user}`
                        )
                        .join('\n')

                );



        const row =
            new ActionRowBuilder()

                .addComponents(

                    new ButtonBuilder()

                        .setCustomId(
                            `accept_marriage_${requestId}`
                        )

                        .setLabel(
                            'Aceptar'
                        )

                        .setStyle(
                            ButtonStyle.Success
                        ),


                    new ButtonBuilder()

                        .setCustomId(
                            `reject_marriage_${requestId}`
                        )

                        .setLabel(
                            'Rechazar'
                        )

                        .setStyle(
                            ButtonStyle.Danger
                        )

                );



        await interaction.reply({

            embeds:
                [
                    embed
                ],

            components:
                [
                    row
                ]

        });


    }

};
