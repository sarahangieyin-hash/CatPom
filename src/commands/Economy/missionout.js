import { SlashCommandBuilder } from 'discord.js';
import { getAllMissions, updateMission } from '../../utils/missions.js';

export default {

    data: new SlashCommandBuilder()
        .setName('missionout')
        .setDescription('Salir de una misión en la que estás apuntado')
        .addStringOption(option =>
            option
                .setName('mision')
                .setDescription('Nombre de la misión')
                .setRequired(true)
        ),


    async execute(interaction) {

        const nombre = interaction.options.getString('mision');

        const userId = interaction.user.id;


        const missions = await getAllMissions(
            interaction.guild.id
        );


        const mission = missions.find(m =>
            m.nombre === nombre &&
            Array.isArray(m.usuarios) &&
            m.usuarios.includes(userId)
        );


        if (!mission) {

            return interaction.reply({
                content: '❌ No estás apuntado a esa misión.',
                ephemeral: true
            });

        }


        mission.usuarios = mission.usuarios.filter(
            id => id !== userId
        );


        await updateMission(
            interaction.guild.id,
            mission.id,
            mission
        );


        await interaction.reply({
            content: `✅ Has salido de la misión **${mission.nombre}**.`,
            allowedMentions: {
                parse: []
            }
        });

    }

};
