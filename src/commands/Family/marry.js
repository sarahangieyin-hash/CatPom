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



        if (personas.length < 1) {

            return interaction.reply({

                content:
                    '❌ Necesitas al menos una persona.',

                ephemeral: true

            });

        }



        const miembros = [

            interaction.user.id,

            ...personas.map(
                user => user.id
            )

        ];



        const repetidos =
            new Set(miembros).size !== miembros.length;


        if (repetidos) {

            return interaction.reply({

                content:
                    '❌ No puedes añadir a la misma persona varias veces.',

                ephemeral: true

            });

        }



        const request =
            createFamilyRequest(
                'marriage',
                {
                    members: miembros,
                    creator: interaction.user.id
                }
            );



        const embed =
            new EmbedBuilder()

                .setTitle('💍 Nueva solicitud de unión')

                .setDescription(

                    `**${interaction.user.username}** quiere formar una unión con:\n\n` +

                    personas
                        .map(
                            user => `💍 ${user}`
                        )
                        .join('\n')

                )

                .setFooter({

                    text:
                        `Solicitud ID: ${request.id}`

                });



        const row =
            new ActionRowBuilder()

                .addComponents(

                    new ButtonBuilder()

                        .setCustomId(
                            `accept_marriage:${request.id}`
                        )

                        .setLabel('Aceptar')

                        .setStyle(
                            ButtonStyle.Success
                        ),


                    new ButtonBuilder()

                        .setCustomId(
                            `reject_marriage:${request.id}`
                        )

                        .setLabel('Rechazar')

                        .setStyle(
                            ButtonStyle.Danger
                        )

                );



        await interaction.reply({

            embeds: [
                embed
            ],

            components: [
                row
            ]

        });


    }

};
