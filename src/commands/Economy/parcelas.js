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
        .setDescription('Oficina de Tierras de Metztlán'),


    async execute(interaction) {


        const embed = new EmbedBuilder()

            .setTitle('🏛️ Oficina de Tierras de Metztlán')

            .setDescription(
                '🌱 **Sistema de adquisición de terrenos**\n\n' +
                'Selecciona la parcela que deseas comprar.\n' +
                'Los puntos serán descontados automáticamente al confirmar la compra.\n\n'
            )

            .addFields(

                {
                    name: '🏠 Parcela C',
                    value:
                        '📐 **25x25 bloques**\n' +
                        '💰 **500 puntos**\n' +
                        '⭐ Ideal para casas pequeñas',
                    inline: true
                },

                {
                    name: '🏡 Parcela B',
                    value:
                        '📐 **30x30 bloques**\n' +
                        '💰 **1000 puntos**\n' +
                        '⭐ Ideal para casas medianas',
                    inline: true
                },

                {
                    name: '🏰 Parcela A',
                    value:
                        '📐 **50x50 bloques**\n' +
                        '💰 **2500 puntos**\n' +
                        '⭐ Ideal para grandes proyectos',
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
                    .setLabel('Comprar C')
                    .setStyle(ButtonStyle.Secondary),


                new ButtonBuilder()
                    .setCustomId('buy_plot_B')
                    .setEmoji('🏡')
                    .setLabel('Comprar B')
                    .setStyle(ButtonStyle.Primary),


                new ButtonBuilder()
                    .setCustomId('buy_plot_A')
                    .setEmoji('🏰')
                    .setLabel('Comprar A')
                    .setStyle(ButtonStyle.Success)

            );


        await interaction.reply({
            embeds: [embed],
            components: [buttons]
        });

    }

};
