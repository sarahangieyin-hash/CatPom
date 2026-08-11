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
                content: `❌ No tienes suficientes Pomp. Necesitas **${price}** y tienes **${points}**.`
            });
        }

        await removePomp(
            interaction.guild.id,
            interaction.user.id,
            price
        );

        await interaction.reply({
            content: `🟩 Compraste el derecho de Parcela Tipo C.\n💎 Gastaste **${price} Pomp**.\n\n📌 **Siguiente paso:** Ve a \`/shoparce\` para mirar el catálogo de parcelas físicas, anota el número de ID de la que quieras y usa el comando \`/buy <id>\` para solicitarla.`
        });

    }

};
