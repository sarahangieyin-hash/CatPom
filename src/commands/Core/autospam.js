import { SlashCommandBuilder } from 'discord.js';

const TARGET_GUILD_ID = '1539821676521594920';

let interval = null;

export default {
    data: new SlashCommandBuilder()
        .setName('autospam')
        .setDescription('Activa mensajes periódicos de prueba'),

    async execute(interaction) {
        if (interaction.guildId !== TARGET_GUILD_ID) {
            return interaction.reply({
                content: '❌ Este comando no está disponible en este servidor.',
                flags: 64
            });
        }

        if (interval) {
            return interaction.reply({
                content: '⚠️ El autospam ya está activo.',
                flags: 64
            });
        }

        await interaction.reply({
            content: '✅ Autospam activado. Se enviará un mensaje cada 30 segundos.',
            flags: 64
        });

        interval = setInterval(async () => {
            try {
                await interaction.channel.send('Mensaje automático');
            } catch (error) {
                console.error('Error enviando mensaje automático:', error);
            }
        }, 10000);
    }
};
