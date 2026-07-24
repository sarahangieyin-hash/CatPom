import { SlashCommandBuilder } from 'discord.js';
import { getPomp } from '../../utils/points.js';


export default {

    data: new SlashCommandBuilder()
        .setName('pompsee')
        .setDescription('Ver tus Pomp'),


    async execute(interaction) {


        const points = await getPomp(
            interaction.guild.id,
            interaction.user.id
        );


        return interaction.reply({
            content:
            `💎 Tienes **${points} Pomp**.`,
            ephemeral:true
        });

    }
};
