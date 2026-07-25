import { SlashCommandBuilder } from 'discord.js';
import { getAllMissions, deleteMission } from '../../utils/missions.js';

export default {

    data: new SlashCommandBuilder()
        .setName('pompclear')
        .setDescription('Eliminar una misión del historial')
        .addIntegerOption(option =>
            option
                .setName('numero')
                .setDescription('Número de la misión')
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
            .filter(mission =>
                mission &&
                typeof mission === 'object' &&
                mission.nombre &&
                mission.active !== true
            );


        const mission = history[numero - 1];


        if (!mission) {

            return interaction.reply({
                content: '❌ No existe esa misión.',
                ephemeral: true
            });

        }


        await deleteMission(
            interaction.guild.id,
            mission.id
        );


        await interaction.reply(
            `🗑️ Misión eliminada del historial:\n🏗️ ${mission.nombre}`
        );

    }

};
