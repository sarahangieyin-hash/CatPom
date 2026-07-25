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


        for (const user of usuarios) {

            await addPomp(
                interaction.guild.id,
                user,
                mission.puntos
            );

        }


        mission.active = false;


        await updateMission(
            interaction.guild.id,
            id,
            mission
        );


        await interaction.reply(
            `✅ Misión completada. ${usuarios.length} participantes recibieron ${mission.puntos} Pomp y fue enviada al historial.`
        );

    }

};
