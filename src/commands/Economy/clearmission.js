import { SlashCommandBuilder } from 'discord.js';
import { getAllMissions, deleteMission } from '../../utils/missions.js';

export default {

    data: new SlashCommandBuilder()
        .setName('clearmission')
        .setDescription('Eliminar una misión del historial')
        .addIntegerOption(option =>
            option
                .setName('numero')
                .setDescription('Número de la misión del historial')
                .setRequired(true)
        ),

    async execute(interaction) {

        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({
                content: '❌ Solo admins.',
                ephemeral: true
            });
        }


        const numero = interaction.options.getInteger('numero');


        let missions = await getAllMissions(
            interaction.guild.id
        );


        const history = missions
            .map(entry => ({
                id: entry.key.split(':').pop(),
                ...entry.value
            }))
            .filter(mission =>
                mission.active === false
            );


        const mission = history[numero - 1];


        if (!mission) {
            return interaction.reply({
                content: '❌ No existe esa misión en el historial.',
                ephemeral: true
            });
        }


        await deleteMission(
            interaction.guild.id,
            mission.id
        );


        await interaction.reply(
            `🗑️ Misión eliminada del historial:\n\n🏗️ ${mission.nombre}`
        );

    }

};
