import { SlashCommandBuilder } from 'discord.js';

const TARGET_GUILD_ID = '1539821676521594920';

export default {
    data: new SlashCommandBuilder()
        .setName('spam')
        .setDescription('Envía un mensaje de prueba'),

    async execute(interaction) {
        if (interaction.guildId !== TARGET_GUILD_ID) {
            return interaction.reply({
                content: '❌ Este comando no está disponible en este servidor.',
                flags: 64
            });
        }

        await interaction.channel.send('Mensaje de prueba 🧪');
        
        await interaction.reply({
            content: '✅ Mensaje enviado.',
            flags: 64
        });
    }
};
