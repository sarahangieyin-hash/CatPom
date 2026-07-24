export default {

    customId: 'buy_plot_A',

    async execute(interaction, client) {

        await interaction.reply({
            content: '🟨 Compraste la Parcela A (50x50) por 2500 puntos.',
            ephemeral: true
        });

    }

};
