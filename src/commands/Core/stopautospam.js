import { SlashCommandBuilder } from 'discord.js';

const TARGET_GUILD_ID = '1539821676521594920';

export default {
    data: new SlashCommandBuilder()
        .setName('stopautospam')
        .setDescription('Detiene el autospam'),

    async execute(interaction) {
        if (interaction.guildId !== TARGET_GUILD_ID) {
            return interaction.reply({
                content: '❌ Este comando no está disponible en este servidor.',
                flags: 64
            });
        }

        if (!globalThis.autospamInterval) {
            return interaction.reply({
                content: '⚠️ No hay ningún autospam activo.',
                flags: 64
            });
        }

        clearInterval(globalThis.autospamInterval);
        globalThis.autospamInterval = null;

        await interaction.reply({
            content: '🛑 Autospam detenido.',
            flags: 64
        });
    }
};
