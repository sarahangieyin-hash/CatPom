import {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} from "discord.js";


export default {

    data: new SlashCommandBuilder()

        .setName("ticketpanel")

        .setDescription(
            "Crear panel de tickets"
        ),



    async execute(interaction) {


        if (
            !interaction.member.roles.cache.has(
                "1515791573026082948"
            )
        ) {

            return interaction.reply({

                content:
                    "❌ No tienes permisos para usar este comando.",

                ephemeral:
                    true

            });

        }



        const embed =
            new EmbedBuilder()

                .setColor(0x8FBF8F)

                .setTitle(
                    `Bienvenida a ${interaction.guild.name}`
                )

                .setDescription(
`¿En qué podemos ayudarte?

🪪 **Verificación**
> Para completar el proceso de verificación y acceder al servidor.

💬 **Consultas**
> Para incidencias, dudas o problemas relacionados con el servidor.`
                );



        const row =
            new ActionRowBuilder()

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
                "Panel creado correctamente.",

            ephemeral:
                true

        });


    }

};
