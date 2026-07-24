import {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} from 'discord.js';


export default {

    data: new SlashCommandBuilder()
        .setName('parcelas')
        .setDescription('Oficina de tierras'),


    async execute(interaction) {


        const embed = new EmbedBuilder()

            .setTitle('🏛️ Oficina de Tierras de Metztlán')

            .setDescription(
                'Aquí puedes adquirir una parcela para construir tu hogar.\n\n' +
                'Selecciona el tamaño de terreno que deseas solicitar:'
            )

            .addFields(

                {
                    name: '🏠 Parcela C',
                    value:
                        '📐 Tamaño: **25x25 bloques**\n' +
                        '💰 Precio: **500 puntos**',
                    inline: true
                },


                {
                    name: '🏡 Parcela B',
                    value:
                        '📐 Tamaño: **30x30 bloques**\n' +
                        '💰 Precio: **1000 puntos**',
                    inline: true
                },


                {
                    name: '🏰 Parcela A',
                    value:
                        '📐 Tamaño: **50x50 bloques**\n' +
                        '💰 Precio: **2500 puntos**',
                    inline: true
                }

            )

            .setColor('#8B5A2B')

            .setFooter({
                text: 'Gobierno de Metztlán • Oficina de Tierras'
            });



        const buttons = new ActionRowBuilder()

            .addComponents(

                new ButtonBuilder()
                    .setCustomId('buy_plot_C')
                    .setEmoji('🏠')
                    .setStyle(ButtonStyle.Secondary),


                new ButtonBuilder()
                    .setCustomId('buy_plot_B')
                    .setEmoji('🏡')
                    .setStyle(ButtonStyle.Primary),


                new ButtonBuilder()
                    .setCustomId('buy_plot_A')
                    .setEmoji('🏰')
                    .setStyle(ButtonStyle.Success)

            );



        await interaction.reply({

            embeds: [embed],

            components: [buttons]

        });


    }

};
