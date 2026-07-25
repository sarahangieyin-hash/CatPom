import { getMission } from '../../utils/missions.js';
import { addPomp } from '../../utils/points.js';

export default {
    customId: 'finish_mission',

    async execute(interaction) {

        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({
                content: '❌ Solo admins.',
                ephemeral: true
            });
        }

        const id = interaction.customId.split(':')[1];

        const mission = await getMission(
            interaction.guild.id,
            id
        );

        if (!mission) {
            return interaction.reply({
                content: '❌ Misión no encontrada.',
                ephemeral: true
            });
        }

        for (const user of mission.usuarios) {
            await addPomp(
                interaction.guild.id,
                user,
                mission.puntos
            );
        }

const participantes = mission.usuarios
    .map(user => `<@${user}>`)
    .join('\n');


await interaction.reply(
    `✅ **Misión completada**\n\n` +
    `👥 Participantes:\n${participantes}\n\n` +
    `💎 Cada participante recibió **${mission.puntos} Pomp**.`
    
);
        );
    }
};
