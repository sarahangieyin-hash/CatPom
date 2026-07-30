import {
    ChannelType,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} from "discord.js";


export default {

    customId: "create_question_ticket",


    async execute(interaction) {


        const guild = interaction.guild;


        const channel =
            await guild.channels.create({

                name:
                    `💬・consulta・${interaction.user.username}`
                        .toLowerCase(),


                type:
                    ChannelType.GuildText,


                parent:
                    "1519058009232248853",


                topic:
                    `ticket-owner:${interaction.user.id}`,


                permissionOverwrites: [

                    {

                        id:
                            guild.roles.everyone.id,

                        deny: [

                            PermissionFlagsBits.ViewChannel

                        ]

                    },


                    {

                        id:
                            interaction.user.id,

                        allow: [

                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory

                        ]

                    },


                    {

                        id:
                            "1515791573026082948",

                        allow: [

                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory

                        ]

                    }

                ]

            });



        await interaction.reply({

            content:
                `Tu consulta ha sido creada: ${channel}`,

            ephemeral:
                true

        });



        const embed =
            new EmbedBuilder()

                .setColor(0x8FBF8F)

                .setTitle(
                    "Consultas"
                )

                .setDescription(
`Cuéntanos qué necesitas y una administradora te ayudará.

Este ticket puede utilizarse para:

• Problemas con tumbas.
• Dudas sobre el servidor.
• Problemas técnicos.
• Cualquier otro asunto relacionado con Valbruma.

Describe tu problema con el mayor detalle posible para que podamos ayudarte más rápido.

Si necesitas ayuda adicional, escribe en este ticket o menciona a <@&1515791573026082948>.`
                );



        await channel.send({

            content:
                `${interaction.user} <@&1515791573026082948>`,

            embeds: [

                embed

            ],

            components: [

                new ActionRowBuilder()

                    .addComponents(

                        new ButtonBuilder()

                            .setCustomId(
                                "close_ticket"
                            )

                            .setLabel(
                                "Cerrar ticket"
                            )

                            .setEmoji(
                                "🔒"
                            )

                            .setStyle(
                                ButtonStyle.Danger
                            )

                    )

            ]

        });


    }

};
