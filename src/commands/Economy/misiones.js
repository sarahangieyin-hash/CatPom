import { SlashCommandBuilder } from 'discord.js';
import { getAllMissions } from '../../utils/missions.js';

export default {

    data: new SlashCommandBuilder()
        .setName('misiones')
        .setDescription('Ver todas las misiones activas'),

    async execute(interaction) {

        const missions = await getAllMissions(interaction.guild.id);

        if (missions.length === 0) {
            return interaction.reply('No hay misiones activas.');
        }

        let text = '';

        for (const mission of missions) {

            text += `🏗️ **${mission.nombre}**\n`;
            text += `👥 ${mission.usuarios.length}/${mission.personas} participantes\n`;
            text += `💎 ${mission.puntos} Pomp\n\n`;

            if (mission.usuarios.length === 0) {
                text += '• Nadie apuntado\n\n';
            } else {
                for (const user of mission.usuarios) {
                    text += `• <@${user}>\n`;
                }
                text += '\n';
            }
        }

        await interaction.reply({
            content: text
        });
    }
};
