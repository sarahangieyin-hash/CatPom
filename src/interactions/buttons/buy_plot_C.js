export default {

    customId: 'buy_plot_C',

    async execute(interaction, client) {

        await interaction.reply({
            content: '🟩 Compraste la Parcela C (25x25) por 500 puntos.',
            ephemeral: true
        });

    }

};
