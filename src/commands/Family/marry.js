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


export default {

    data: new SlashCommandBuilder()

        .setName('marry')

        .setDescription('Solicita una unión.')

        .addUserOption(option =>
            option
                .setName('persona1')
                .setDescription('Persona con la que casarte')
                .setRequired(true)
        )

        .addUserOption(option =>
            option
                .setName('persona2')
                .setDescription('Segunda persona (opcional)')
                .setRequired(false)
        )

        .addUserOption(option =>
            option
                .setName('persona3')
                .setDescription('Tercera persona (opcional)')
                .setRequired(false)
        ),



    async execute(interaction) {


        const users = [

            interaction.user,

            interaction.options.getUser('persona1'),

            interaction.options.getUser('persona2'),

            interaction.options.getUser('persona3')

        ].filter(Boolean);



        const ids =
            users.map(
                user => user.id
            );



        if (
            new Set(ids).size !== ids.length
        ) {

            return interaction.reply({

                content:
                    '❌ No puedes repetir personas.',

                ephemeral:
                    true

            });

        }



        if (
            ids.includes(
                interaction.user.id
            ) === false
        ) {

            return interaction.reply({

                content:
                    '❌ Error creando solicitud.',

                ephemeral:
                    true

            });

        }



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
                    ]

            }

        );



        const embed =
            new EmbedBuilder()

                .setTitle(
                    '💍 Solicitud de unión'
                )

                .setDescription(

                    `${interaction.user} quiere formar una unión con:\n\n` +

                    users

                        .slice(1)

                        .map(
                            user =>
                                `💍 ${user}`
                        )

                        .join('\n')

                )

                .setColor(
                    0xffc0cb
                );



        const buttons =
            new ActionRowBuilder()

                .addComponents(

                    new ButtonBuilder()

                        .setCustomId(
                            `accept_marriage:${requestId}`
                        )

                        .setLabel(
                            'Aceptar'
                        )

                        .setStyle(
                            ButtonStyle.Success
                        ),


                    new ButtonBuilder()

                        .setCustomId(
                            `reject_marriage:${requestId}`
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
                    buttons
                ]

        });

    }

};
