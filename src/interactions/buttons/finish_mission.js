import { getMission, updateMission } from '../../utils/missions.js';
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

        // Repartir recompensa
        for (const userId of usuarios) {

            await addPomp(
                interaction.guild.id,
                userId,
                mission.puntos
            );

            // Quitar el rol temporal
            if (mission.roleId) {

                const member = await interaction.guild.members
                    .fetch(userId)
                    .catch(() => null);

                if (member) {
                    await member.roles
                        .remove(mission.roleId)
                        .catch(() => {});
                }

            }

        }

        // Eliminar el rol de la misión
        if (mission.roleId) {

            const role = interaction.guild.roles.cache.get(mission.roleId);

            if (role) {
                await role.delete().catch(() => {});
            }

        }

        mission.active = false;

        await updateMission(
            interaction.guild.id,
            id,
            mission
        );

        await interaction.reply(
            `✅ Misión completada. ${usuarios.length} participantes recibieron ${mission.puntos} Pomp y la misión fue enviada al historial.`
        );

    }

};
