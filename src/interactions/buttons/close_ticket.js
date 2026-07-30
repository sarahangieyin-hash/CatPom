import {
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder
} from "discord.js";

export default {

    customId: "close_ticket",

    async execute(interaction) {

        const member = interaction.guild.members.cache.get(
            interaction.user.id
        );

        if (
            !member?.roles.cache.has("1515791573026082948")
        ) {

            return interaction.reply({

                content:
                    "❌ Solo el equipo administrativo puede cerrar tickets.",

                ephemeral:
                    true

            });

        }

        const channel = interaction.channel;

        // Buscar el creador del ticket mediante el topic
        const ownerId =
            channel.topic?.replace(
                "ticket-owner:",
                ""
            );

        if (ownerId) {

            await channel.permissionOverwrites.edit(
                ownerId,
                {
                    ViewChannel: false
                }
            );

        }

        await channel.setName(
            `cerrado-${channel.name.replace(/^🪪・|^💬・/, "")}`
        );

        const embed =
            new EmbedBuilder()

                .setColor(0xE67E22)

                .setTitle("Ticket cerrado")

                .setDescription(
`Este ticket ha sido cerrado y permanecerá guardado como registro.

Si en algún momento ya no es necesario conservarlo, un administrador puede eliminarlo usando el botón de abajo.`
                );

        const row =
            new ActionRowBuilder()

                .addComponents(

                    new ButtonBuilder()

                        .setCustomId(
                            "delete_ticket"
                        )

                        .setLabel(
                            "Eliminar ticket"
                        )

                        .setEmoji(
                            "🗑️"
                        )

                        .setStyle(
                            ButtonStyle.Danger
                        )

                );

        await interaction.update({

            embeds: [embed],

            components: [row]

        });

    }

};
