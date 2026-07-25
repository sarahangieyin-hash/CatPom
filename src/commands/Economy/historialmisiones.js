import { SlashCommandBuilder } from 'discord.js';
import { getAllMissions } from '../../utils/missions.js';

export default {

    data: new SlashCommandBuilder()
        .setName('historialmisiones')
        .setDescription('Ver misiones completadas'),

    async execute(interaction) {

        let missions = await getAllMissions(interaction.guild.id);

        if (!missions) missions = [];

        const finishedMissions = missions
            .map(entry => entry?.value ?? entry)
            .filter(mission =>
                mission &&
                typeof mission === 'object' &&
                mission.nombre &&
                mission.active === false
            );

        if (finishedMissions.length === 0) {
            return interaction.reply({
                content: '📜 No hay misiones completadas.'
            });
        }

        let text = '📜 **Historial de misiones**\n\n';

        let number = 1;

        for (const mission of finishedMissions) {

            const usuarios = Array.isArray(mission.usuarios)
                ? mission.usuarios
                : [];

            text += `**${number}.** 🏗️ ${mission.nombre}\n`;
            text += `👥 ${usuarios.length}/${mission.personas} participantes\n`;
            text += `💎 ${mission.puntos} Pomp\n\n`;

            number++;
        }

        await interaction.reply({
            content: text,
            allowedMentions: {
                parse: []
            }
        });

    }

};
