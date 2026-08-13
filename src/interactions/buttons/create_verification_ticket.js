import {
    ChannelType,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} from "discord.js";

export default {
    customId: "create_verification_ticket",

    async execute(interaction) {
        const guild = interaction.guild;

        const channel = await guild.channels.create({
            name: `🪪・verificacion・${interaction.user.username}`.toLowerCase(),
            type: ChannelType.GuildText,
            parent: "1519058009232248853",
            topic: `ticket-owner:${interaction.user.id}`,
            permissionOverwrites: [
                {
                    id: guild.roles.everyone.id,
                    deny: [PermissionFlagsBits.ViewChannel]
                },
                {
                    id: interaction.user.id,
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory
                    ]
                },
                {
                    id: "1515791573026082948",
                    allow: [
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.ReadMessageHistory
                    ]
                }
            ]
        });

        await interaction.reply({
            content: `Tu ticket ha sido creado: ${channel}`,
            ephemeral: true
        });

        const embed = new EmbedBuilder()
            .setColor(0x8FBF8F)
            .setTitle("Verificación")
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
Puedes consultar las opciones disponibles en <#1526731395790016545>.

Indícanos por este ticket qué pueblo eliges:
- Metztlan
- Sakura
- Hrafheim

Si tienes cualquier duda, pregunta en este ticket o menciona a <@&1515791573026082948>.`
            );

        await channel.send({
            content: `${interaction.user} <@&1515791573026082948>`,
            embeds: [embed],
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId("close_ticket")
                            .setLabel("Cerrar ticket")
                            .setEmoji("🔒")
                            .setStyle(ButtonStyle.Danger)
                    )
            ]
        });

        // 🕒 RECORDATORIO AUTOMÁTICO DE INACTIVIDAD (A los 10 minutos = 600000 ms)
        const TIEMPO_ESPERA = 10 * 60 * 1000; 

        setTimeout(async () => {
            try {
                // Volvemos a buscar el canal para asegurarnos de que sigue abierto
                const channelCheck = await guild.channels.fetch(channel.id).catch(() => null);
                if (!channelCheck) return;

                // Comprobamos los últimos mensajes del canal
                const messages = await channelCheck.messages.fetch({ limit: 10 });
                
                // Verificamos si el usuario ya ha escrito algo
                const userHasSpoken = messages.some(m => m.author.id === interaction.user.id);

                // Si pasaron 10 minutos y el usuario NO ha dicho nada, mandamos el aviso
                if (!userHasSpoken) {
                    await channelCheck.send({
                        content: `🔔 ${interaction.user}, ¡Hola! Notamos que aún no has respondido en este ticket.\n\nPor favor, **lee las instrucciones de arriba** y envíanos los datos requeridos (usuario de Minecraft, edad, audio, captura y pueblo) para poder verificarte.`
                    });
                }
            } catch (error) {
                console.error("Error al enviar el recordatorio de verificación:", error);
            }
        }, TIEMPO_ESPERA);
    }
};
