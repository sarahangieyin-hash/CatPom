import {
    EmbedBuilder
} from 'discord.js';

import {
    getPoints,
    removePoints
} from '../../utils/points.js';


const plots = {

    buy_plot_C: {
        name: 'Parcela C',
        size: '25x25',
        price: 500
    },

    buy_plot_B: {
        name: 'Parcela B',
        size: '30x30',
        price: 1000
    },

    buy_plot_A: {
        name: 'Parcela A',
        size: '50x50',
        price: 2500
    }

};



export default {

    customId: /^buy_plot_/,



    async execute(interaction) {


        const plot = plots[interaction.customId];


        if (!plot) return;


        const userId = interaction.user.id;


        const points = await getPoints(userId);



        if (points < plot.price) {


            return interaction.reply({

                content:
                    `❌ No tienes suficientes puntos.\n\n` +
                    `Necesitas: **${plot.price} puntos**\n` +
                    `Tienes: **${points} puntos**`,

                ephemeral: true

            });

        }



        await removePoints(
            userId,
            plot.price
        );



        const embed = new EmbedBuilder()

            .setTitle('🏡 Parcela adquirida')

            .setDescription(
                `🎉 ${interaction.user} ha comprado una parcela.\n\n` +
                `🏠 Tipo: **${plot.name}**\n` +
                `📐 Tamaño: **${plot.size} bloques**\n` +
                `💰 Pagado: **${plot.price} puntos**`
            )

            .setColor('#4CAF50');


        await interaction.reply({

            embeds: [embed]

        });


    }

};
