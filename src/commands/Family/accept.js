import { SlashCommandBuilder } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('accept')
        .setDescription('Acepta una solicitud familiar mediante ID.')
        .addStringOption(option =>
            option
                .setName('id')
                .setDescription('ID de la solicitud')
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.reply({
            content: 'ℹ️ Usa los botones de los mensajes para aceptar o rechazar solicitudes.',
            ephemeral: true
        });
    }
};
