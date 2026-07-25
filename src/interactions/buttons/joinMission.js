import { getMission, updateMission } from '../../utils/missions.js';

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


        if (mission.usuarios.includes(interaction.user.id)) {
            return interaction.reply({
                content: '❌ Ya estás apuntado.',
                ephemeral: true
            });
        }


        mission.usuarios.push(
            interaction.user.id
        );


        await updateMission(
            interaction.guild.id,
            id,
            mission
        );


        const embed = interaction.message.embeds[0];

        embed.data.description =
            `👥 Participantes: ${mission.usuarios.length}/${mission.personas}\n\n💎 Recompensa: ${mission.puntos} Pomp`;


        await interaction.update({
            embeds: [embed],
            components: interaction.message.components
        });

    }

};
