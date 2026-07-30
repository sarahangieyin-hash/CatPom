import {
    Events,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType
} from "discord.js";

export default {

    name: Events.ChannelCreate,

    async execute(channel) {

        // Solo canales de texto normales
        if (channel.type !== ChannelType.GuildText) return;

        // Solo la categoría de tickets
        if (channel.parentId !== "1519058009232248853") return;

        // Esperar a que Ticket Tool termine de crear el canal
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Evitar enviar el panel dos veces
        const messages = await channel.messages.fetch({ limit: 10 });

        const alreadySent = messages.some(message =>
            message.author.id === channel.client.user.id &&
            message.components.length > 0
        );

        if (alreadySent) return;

        const embed = new EmbedBuilder()
            .setColor(0x8FBF8F)
            .setTitle(`Bienvenida a ${channel.guild.name}`)
            .setDescription(
`Selecciona el tipo de ticket que deseas abrir.

🪪 **Verificación**
> Para completar el proceso de verificación.

💬 **Consultas**
> Para miembros del servidor o cualquier otro asunto.`
            )
            .setFooter({
                text: "Solo podrás seleccionar una opción."
            });

        const row = new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()
                    .setCustomId("join_server")
                    .setLabel("Verificación")
                    .setEmoji("🪪")
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId("member_ticket")
                    .setLabel("Consultas")
                    .setEmoji("💬")
                    .setStyle(ButtonStyle.Secondary)

            );

        await channel.send({

            content: "## Bienvenida",

            embeds: [embed],

            components: [row]

        });

    }

};
