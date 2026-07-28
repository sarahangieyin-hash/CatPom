import {
    getMission,
    updateMission,
    getAllMissions
} from '../../utils/missions.js';

export default {

    customId: 'join_mission',

    async execute(interaction, client, args) {

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

        // ¿Ya está apuntado a esta misión?
        if (mission.usuarios.includes(interaction.user.id)) {
            return interaction.reply({
                content: '❌ Ya estás apuntado.',
                ephemeral: true
            });
        }

        // ¿Está en otra misión activa?
        const missions = await getAllMissions(interaction.guild.id);

        const otherMission = missions.find(m =>
            m.active &&
            m.id !== id &&
            Array.isArray(m.usuarios) &&
            m.usuarios.includes(interaction.user.id)
        );

        if (otherMission) {
            return interaction.reply({
                content: `❌ Ya participas en la misión **${otherMission.nombre}**. Sal de ella antes de unirte a otra.`,
                ephemeral: true
            });
        }

        // ¿Está llena?
        if (mission.usuarios.length >= mission.personas) {
            return interaction.reply({
                content: '❌ Esta misión ya está completa.',
                ephemeral: true
            });
        }

        mission.usuarios.push(interaction.user.id);

        await updateMission(
            interaction.guild.id,
            id,
            mission
        );

        // Dar rol temporal
        if (mission.roleId) {

            const role = interaction.guild.roles.cache.get(mission.roleId);

            if (role) {
                await interaction.member.roles.add(role);
            }

        }

        const embed = interaction.message.embeds[0];

        embed.data.description =
            `👥 Participantes: ${mission.usuarios.length}/${mission.personas}\n\n💎 Recompensa: ${mission.puntos} Pomp`;

        await interaction.update({
            embeds: [embed],
            components: interaction.message.components
        });

    }

};
