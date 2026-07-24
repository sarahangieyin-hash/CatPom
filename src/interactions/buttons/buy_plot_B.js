import { getPomp, removePomp } from '../../utils/points.js';

export default {

    customId: 'buy_plot_B',

    async execute(interaction, client) {

        const price = 1000;

        const points = await getPomp(
            interaction.guild.id,
            interaction.user.id
        );


        if (points < price) {
            return interaction.reply({
                content: `❌ No tienes suficientes Pomp.\nNecesitas **${price}** y tienes **${points}**.`,
                ephemeral: true
            });
        }


        await removePomp(
            interaction.guild.id,
            interaction.user.id,
            price
        );


        await interaction.reply({
            content: `🟦 Compraste la Parcela B (30x30) por **${price} Pomp**.\n💎 Te quedan **${points - price} Pomp**.`,
            ephemeral: true
        });

    }

};
