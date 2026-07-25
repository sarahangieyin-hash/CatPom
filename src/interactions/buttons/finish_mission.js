import { getMission, deleteMission } from '../../utils/missions.js';
import { addPomp } from '../../utils/points.js';

export default {

    customId: 'finish_mission',

    async execute(interaction, client, args) {

        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({
                content: '❌ Solo admins.',
                ephemeral: true
            });
        }

        const id = args[0];

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

        const usuarios = Array.isArray(mission.usuarios)
            ? mission.usuarios
            : [];

        for (const user of usuarios) {
            await addPomp(
                interaction.guild.id,
                user,
                mission.puntos
            );
        }

        console.log("========== FINISH MISSION ==========");
        console.log("Mission ID:", id);
        console.log("Guild ID:", interaction.guild.id);
        console.log("Key:", `mission:${interaction.guild.id}:${id}`);

        await deleteMission(
            interaction.guild.id,
            id
        );

        console.log("Misión eliminada de la base de datos.");

        await interaction.reply(
            `✅ Misión completada y eliminada. ${usuarios.length} participantes recibieron ${mission.puntos} Pomp.`
        );
    }

};
