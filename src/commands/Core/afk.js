import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { afkUsers } from '../../utils/afkManager.js'; // IMPORTA EL MAPA CENTRAL

export default {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Establece tu estado como ausente (AFK)')
        .addStringOption(o => o.setName('motivo').setDescription('Motivo').setRequired(false)),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const userId = interaction.user.id;
        const motivo = interaction.options.getString('motivo') || 'Sin motivo';

        if (!afkUsers.has(guildId)) afkUsers.set(guildId, new Map());
        
        afkUsers.get(guildId).set(userId, { reason: motivo, timestamp: Date.now() });

        await interaction.reply({
            embeds: [new EmbedBuilder().setTitle('💤 AFK Activado').setDescription(`<@${userId}> está AFK: ${motivo}`).setColor('Yellow')]
        });

        // Intentar cambiar apodo
        if (interaction.member.manageable) {
            await interaction.member.setNickname(`[AFK] ${interaction.member.displayName}`).catch(() => {});
        }
    }
};
