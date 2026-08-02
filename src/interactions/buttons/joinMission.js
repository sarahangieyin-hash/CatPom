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
                flags: 64
            });
        }

        // Asegurar que mission.usuarios exista siempre como array
        if (!Array.isArray(mission.usuarios)) {
            mission.usuarios = [];
        }

        // ¿Ya está apuntado a esta misión?
        if (mission.usuarios.includes(interaction.user.id)) {
            return interaction.reply({
                content: '❌ Ya estás apuntado.',
                flags: 64
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
                flags: 64
            });
        }

        // ¿Está llena?
        if (mission.usuarios.length >= mission.personas) {
            return interaction.reply({
                content: '❌ Esta misión ya está completa.',
                flags: 64
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
                await interaction.member.roles.add(role).catch(() => {});
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
