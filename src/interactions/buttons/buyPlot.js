import {
    EmbedBuilder
} from 'discord.js';

import {
    getPomp,
    removePomp
} from '../../utils/points.js';


const plots = {

    buy_plot_C: {
        name: 'Parcela C',
        emoji: '🏠',
        size: '25x25 bloques',
        price: 500
    },

    buy_plot_B: {
        name: 'Parcela B',
        emoji: '🏡',
        size: '30x30 bloques',
        price: 1000
    },

    buy_plot_A: {
        name: 'Parcela A',
        emoji: '🏰',
        size: '50x50 bloques',
        price: 2500
    }

};



export default {

    customId: /^buy_plot_/,



    async execute(interaction) {


        const plot = plots[interaction.customId];


        if (!plot) return;



        const userId = interaction.user.id;



        const points = await getPomp(
            interaction.guild.id,
            userId
        );



        if (points < plot.price) {


            return interaction.reply({

                embeds: [

                    new EmbedBuilder()

                    .setTitle('❌ Compra rechazada')

                    .setDescription(
                        `No tienes suficientes **Pomp** para esta parcela.\n\n` +

                        `💎 Tienes: **${points} Pomp**\n` +

                        `💰 Necesitas: **${plot.price} Pomp**`
                    )

                    .setColor('#FF0000')

                ],

                ephemeral: true

            });

        }



        const remaining = await removePomp(

            interaction.guild.id,

            userId,

            plot.price

        );



        const embed = new EmbedBuilder()

        .setTitle('🏡 Parcela adquirida')

        .setDescription(

            `${plot.emoji} ${interaction.user} ha adquirido una nueva parcela.\n\n` +

            `📜 **Información del terreno**\n` +

            `🏠 Tipo: **${plot.name}**\n` +

            `📐 Tamaño: **${plot.size}**\n` +

            `💎 Precio pagado: **${plot.price} Pomp**\n\n` +

            `💰 Pomp restantes: **${remaining}**`

        )

        .setColor('#4CAF50')

        .setFooter({

            text: 'Gobierno de Metztlán • Oficina de Tierras'

        });



        return interaction.reply({

            embeds: [embed]

        });


    }

};
