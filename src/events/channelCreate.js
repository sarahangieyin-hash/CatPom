import {
    Events,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} from "discord.js";

export default {

    name: Events.ChannelCreate,

    async execute(channel) {

        // Solo canales de texto
        if (!channel.isTextBased()) return;

        // Categoría de tickets
        if (channel.parentId !== "1519058009232248853") return;

        // Esperar a que Ticket Tool termine de crear el canal
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Buscar al único miembro que no sea bot y que no tenga el rol Admin
        const members = [...channel.members.values()].filter(member =>
            !member.user.bot &&
            !member.roles.cache.has("1515791573026082948")
        );

        if (!members.length) return;

        const member = members[0];

        const embed = new EmbedBuilder()
            .setColor("#8FBF8F")
            .setTitle(`Bienvenida a ${channel.guild.name}`)
            .setDescription(
`${member}

Antes de continuar, selecciona el tipo de ticket que deseas abrir.

🪪 **Verificación**
> Para completar el proceso de verificación.

💬 **Consultas**
> Para miembros del servidor o cualquier otro asunto.`
            );

        const row = new ActionRowBuilder().addComponents(

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
            embeds: [embed],
            components: [row]
        });

    }

};
