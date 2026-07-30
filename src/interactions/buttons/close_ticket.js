import {
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} from "discord.js";


export default {

    customId: "close_ticket",


    async execute(interaction) {


        const channel = interaction.channel;


        await channel.permissionOverwrites.edit(
            interaction.user.id,
            {
                ViewChannel: false
            }
        );



        const row =
            new ActionRowBuilder()

                .addComponents(

                    new ButtonBuilder()

                        .setCustomId(
                            "delete_ticket"
                        )

                        .setLabel(
                            "Borrar ticket"
                        )

                        .setEmoji(
                            "🗑️"
                        )

                        .setStyle(
                            ButtonStyle.Danger
                        )

                );



        await interaction.reply({

            content:
                "Ticket cerrado. Un administrador puede eliminarlo cuando quiera.",

            components:
                [
                    row
                ]

        });


    }

};
