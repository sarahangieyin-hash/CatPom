import {
    ChannelType,
    PermissionFlagsBits
} from "discord.js";


export default {

    customId: "create_verification_ticket",


    async execute(interaction, client) {


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



        await channel.send({

            content:
                `${interaction.user}`,


            embeds: [

                {

                    color:
                        0x8FBF8F,

                    title:
                        "Verificación",

                    description:
`Antes de darte acceso al servidor debemos completar una pequeña verificación.

**1. Usuario de Minecraft**
Indica tu usuario de Minecraft Bedrock.

**2. Audio de verificación**
Envía un audio diciendo un trabalenguas.

**3. Elegir pueblo**
Cuando finalices la verificación podrás escoger entre:
- Metztlan
- Sakura
- Hrafheim`

                }

            ]

        });


    }

};
