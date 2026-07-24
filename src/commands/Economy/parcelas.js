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
            .setTitle('🏛️ Oficina de Tierras')
            .setDescription(
`
Bienvenida a la oficina de tierras.

Aquí puedes adquirir una parcela para construir tu hogar dentro del pueblo.

Selecciona el tamaño de terreno que deseas solicitar:

🏠 **Casa pequeña**
Parcela C
25x25 bloques

🏡 **Casa mediana**
Parcela B
30x30 bloques

🏰 **Casa grande**
Parcela A
50x50 bloques
`
            )
            .setColor('#8B5A2B')
            .setFooter({
                text: 'Gobierno de Metztlán • Registro de tierras'
            });


        const botones = new ActionRowBuilder()
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
            components: [botones]
        });

    }

};
