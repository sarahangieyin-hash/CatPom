import { SlashCommandBuilder } from 'discord.js';
import { getAllMissions } from '../../utils/missions.js';

export default {

    data: new SlashCommandBuilder()
        .setName('pomphistory')
        .setDescription('Ver misiones completadas'),


    async execute(interaction) {

        const missions = await getAllMissions(
            interaction.guild.id
        );


        console.log(
            '=== TODAS LAS MISIONES ==='
        );

        console.log(
            JSON.stringify(
                missions,
                null,
                2
            )
        );


        await interaction.reply({
            content: 'Revisa la consola del bot.'
        });

    }

};
