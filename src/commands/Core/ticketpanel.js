import {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionFlagsBits
} from "discord.js";

export default {

    name: "ticketpanel",

    description: "Crear panel de tickets",

    async execute(interaction) {

        if (
            !interaction.member.permissions.has(
                PermissionFlagsBits.Administrator
            )
        ) {
            return interaction.reply({
                content: "❌ No tienes permisos para usar este comando.",
                ephemeral: true
            });
        }


        const embed = new EmbedBuilder()

            .setColor(0x8FBF8F)

            .setTitle(
                `🌲 Bienvenida a ${interaction.guild.name}`
            )

            .setDescription(
`¿En qué podemos ayudarte?

🪪 **Verificación**
> Para completar el proceso de verificación y acceder al servidor.

💬 **Consultas**
> Para incidencias, dudas o problemas relacionados con el servidor.`
            );


        const row = new ActionRowBuilder()

            .addComponents(

                new ButtonBuilder()

                    .setCustomId(
                        "create_verification_ticket"
                    )

                    .setLabel(
                        "Verificación"
                    )

                    .setEmoji(
                        "🪪"
                    )

                    .setStyle(
                        ButtonStyle.Success
                    ),


                new ButtonBuilder()

                    .setCustomId(
                        "create_question_ticket"
                    )

                    .setLabel(
                        "Consultas"
                    )

                    .setEmoji(
                        "💬"
                    )

                    .setStyle(
                        ButtonStyle.Secondary
                    )

            );


        await interaction.channel.send({

            embeds: [
                embed
            ],

            components: [
                row
            ]

        });


        await interaction.reply({

            content:
                "✅ Panel creado.",

            ephemeral:
                true

        });

    }

};
