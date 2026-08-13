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

If tienes cualquier duda, pregunta en este ticket o menciona a <@&1515791573026082948>.`
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

        // 🕒 1. PRIMER AVISO: A los 10 minutos (600,000 ms)
        const TIEMPO_10M = 10 * 60 * 1000; 

        setTimeout(async () => {
            try {
                const channelCheck = await guild.channels.fetch(channel.id).catch(() => null);
                if (!channelCheck) return;

                const messages = await channelCheck.messages.fetch({ limit: 20 });
                
                const userHasSpoken = messages.some(m => m.author.id === interaction.user.id);
                const botAlreadyWarned10M = messages.some(m => m.author.id === guild.client.user.id && m.content.includes("10 minutos"));

                if (!userHasSpoken && !botAlreadyWarned10M) {
                    await channelCheck.send({
                        content: `🔔 ${interaction.user}, ¡Hola! Han pasado 10 minutos y notamos que aún no has respondido en este ticket.\n\nPor favor, **lee las instrucciones de arriba** y envíanos los datos requeridos para poder verificarte.`
                    });
                }
            } catch (error) {
                console.error("Error en el recordatorio de 10m:", error);
            }
        }, TIEMPO_10M);

        // 🕒 2. SEGUNDO AVISO: A las 12 horas (43,200,000 ms)
        const TIEMPO_12H = 12 * 60 * 60 * 1000; 

        setTimeout(async () => {
            try {
                const channelCheck = await guild.channels.fetch(channel.id).catch(() => null);
                if (!channelCheck) return;

                const messages = await channelCheck.messages.fetch({ limit: 30 });
                
                const userHasSpoken = messages.some(m => m.author.id === interaction.user.id);
                const botAlreadyWarned12H = messages.some(m => m.author.id === guild.client.user.id && m.content.includes("12 horas"));

                if (!userHasSpoken && !botAlreadyWarned12H) {
                    await channelCheck.send({
                        content: `⚠️ ${interaction.user}, ¡Atención! Han pasado 12 horas y este ticket de verificación sigue sin actividad por tu parte.\n\nPor favor, aporta la información necesaria (usuario, edad, audio, captura y pueblo) para completar tu acceso.`
                    });
                }
            } catch (error) {
                console.error("Error en el recordatorio de 12h:", error);
            }
        }, TIEMPO_12H);
    }
};
