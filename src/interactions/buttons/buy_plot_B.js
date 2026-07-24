export default {

    customId: 'buy_plot_B',

    async execute(interaction, client) {

        await interaction.reply({
            content: '🟦 Compraste la Parcela B (30x30) por 1000 puntos.',
            ephemeral: true
        });

    }

};
