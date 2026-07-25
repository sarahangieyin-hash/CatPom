import { SlashCommandBuilder } from 'discord.js';
import { getAllMissions } from '../../utils/missions.js';

export default {

    data: new SlashCommandBuilder()
        .setName('misiones')
        .setDescription('Ver todas las misiones activas'),

    async execute(interaction) {

        let missions = await getAllMissions(interaction.guild.id);

        if (!missions) missions = [];

        const validMissions = missions
            .map(entry => entry?.value ?? entry)
            .filter(mission =>
                mission &&
                typeof mission === 'object' &&
                mission.nombre
            );

        if (validMissions.length === 0) {
            return interaction.reply({
                content: 'No hay misiones activas.'
            });
        }

        let text = '';

        for (const mission of validMissions) {

            const usuarios = Array.isArray(mission.usuarios)
                ? mission.usuarios
                : [];

            text += `🏗️ **${mission.nombre}**\n`;
            text += `👥 ${usuarios.length}/${mission.personas} participantes\n`;
            text += `💎 ${mission.puntos} Pomp\n`;

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
