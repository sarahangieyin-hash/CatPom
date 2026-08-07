import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

// Mapa global para guardar los estados AFK de los usuarios por servidor (guildId -> Map(userId -> { reason, timestamp }))
export const afkUsers = new Map();

export default {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Establece tu estado como ausente (AFK)')
        .addStringOption(option =>
            option.setName('motivo')
                .setDescription('El motivo por el cual te ausentas')
                .setRequired(false)
        ),

    async execute(interaction, client) {
        const guildId = interaction.guild.id;
        const userId = interaction.user.id;
        const motivo = interaction.options.getString('motivo') || 'Sin motivo especificado';

        if (!afkUsers.has(guildId)) {
            afkUsers.set(guildId, new Map());
        }

        const guildAfk = afkUsers.get(guildId);
        guildAfk.set(userId, {
            reason: motivo,
            timestamp: Date.now()
        });

        const embed = new EmbedBuilder()
            .setTitle('💤 Estado AFK Activado')
            .setDescription(`Has quedado registrado como AFK.\n📌 **Motivo:** ${motivo}`)
            .setColor('#f39c12')
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });

        // Opcional: Cambiar temporalmente el apodo del usuario añadiendo "[AFK]" si el bot tiene permisos
        try {
            const member = interaction.member;
            if (member.manageable && !member.displayName.includes('[AFK]')) {
                await member.setNickname(`[AFK] ${member.displayName}`).catch(() => {});
            }
        } catch (e) {
            // Ignorar si no hay permisos para cambiar el apodo
        }
    }
};
