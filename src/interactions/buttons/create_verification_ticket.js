import {
    ChannelType,
    PermissionFlagsBits,
    EmbedBuilder
} from "discord.js";


export default {

    customId: "create_verification_ticket",


    async execute(interaction) {


        const guild = interaction.guild;


        const existing = guild.channels.cache.find(channel =>
            channel.topic === `ticket-owner:${interaction.user.id}`
        );


        if (existing) {

            return interaction.reply({

                content:
                    "Ya tienes un ticket abierto.",

                ephemeral:
                    true

            });

        }



        const channel =
            await guild.channels.create({

                name:
                    `🪪・verificacion・${interaction.user.username}`
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
                `Tu ticket ha sido creado: ${channel}`,

            ephemeral:
                true

        });



        const embed =
            new EmbedBuilder()

                .setColor(0x8FBF8F)

                .setTitle(
                    "Verificación"
                )

                .setDescription(
`Antes de darte acceso al servidor debemos completar una pequeña verificación.

**1. Usuario de Minecraft**
Indica tu usuario de Minecraft Bedrock en <#1518347843935539320>.

**2. Edad**
Indica tu edad en este ticket.

**3. Audio de verificación**
Envía un audio diciendo un trabalenguas en <#1530837580667682957>.

**4. Captura del enlace**
Envía una captura del chat donde recibiste el enlace de invitación al servidor.

**5. Elegir pueblo**
Cuando terminemos la verificación podrás escoger uno de nuestros pueblos:

- Metztlan
- Sakura
- Hrafheim

Puedes preguntar cualquier duda en este ticket.`
                );



        await channel.send({

            content:
                `${interaction.user} <@&1515791573026082948>`,

            embeds: [

                embed

            ]

        });


    }

};
