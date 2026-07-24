import { getPomp, removePomp } from '../../utils/points.js';

export default {

    customId: 'buy_plot_C',

    async execute(interaction) {

        const price = 500;

        const points = await getPomp(
            interaction.guild.id,
            interaction.user.id
        );

        if (points < price) {
            return interaction.reply({
                content: `❌ No tienes suficientes Pomp. Necesitas **${price}** y tienes **${points}**.`,
                ephemeral: true
            });
        }


        await removePomp(
            interaction.guild.id,
            interaction.user.id,
            price
        );


        await interaction.reply({
            content: `🟩 Compraste la Parcela C (25x25).\n💎 Gastaste **${price} Pomp**.`,
            ephemeral: true
        });

    }

};export default {

    customId: 'buy_plot_A',

    async execute(interaction, client) {

        await interaction.reply({
            content: '🟨 Compraste la Parcela A (50x50) por 2500 puntos.',
            ephemeral: true
        });

    }

};
