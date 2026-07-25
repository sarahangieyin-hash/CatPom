import { getMission, updateMission } from '../../utils/missions.js';

export default {

    customId: 'out_mission',

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


        const userId = interaction.user.id;


        if (!Array.isArray(mission.usuarios) ||
            !mission.usuarios.includes(userId)) {

            return interaction.reply({
                content: '❌ No estás apuntado a esta misión.',
                ephemeral: true
            });

        }


        mission.usuarios =
            mission.usuarios.filter(
                user => user !== userId
            );


        await updateMission(
            interaction.guild.id,
            id,
            mission
        );


        await interaction.reply({
            content: `✅ Has salido de **${mission.nombre}**.`,
            ephemeral: true
        });

    }

};
