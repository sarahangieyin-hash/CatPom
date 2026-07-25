import { SlashCommandBuilder } from 'discord.js';
import { getAllMissions } from '../../utils/missions.js';

export default {
    data: new SlashCommandBuilder()
        .setName('misiones')
        .setDescription('Ver todas las misiones activas'),

    async execute(interaction) {

        let missions = await getAllMissions(interaction.guild.id);

        if (!missions) missions = [];

        if (!Array.isArray(missions)) {
            missions = Object.values(missions);
        }

        if (missions.length === 0) {
            return interaction.reply({
                content: 'No hay misiones activas.',
                ephemeral: true
            });
        }

        let text = '';

        for (const mission of missions) {

            const usuarios = Array.isArray(mission?.usuarios)
                ? mission.usuarios
                : [];

            text += `🏗️ **${mission?.nombre ?? 'Sin nombre'}**\n`;
            text += `👥 ${usuarios.length}/${mission?.personas ?? 0} participantes\n`;
            text += `💎 ${mission?.puntos ?? 0} Pomp\n`;

            if (usuarios.length === 0) {
                text += '• Nadie apuntado\n\n';
            } else {
                for (const user of usuarios) {
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