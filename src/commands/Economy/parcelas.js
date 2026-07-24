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
        .setDescription('Compra una parcela'),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setTitle('🏡 Parcelas disponibles')
            .setDescription(
`
Elige la parcela que quieres comprar:

🟩 **Parcela C**
📐 25x25 bloques
💎 500 puntos

🟦 **Parcela B**
📐 30x30 bloques
💎 1000 puntos

🟨 **Parcela A**
📐 50x50 bloques
💎 2500 puntos
`
            )
            .setColor('#7CFC00');


        const row = new ActionRowBuilder()
            .addComponents(

                new ButtonBuilder()
                    .setCustomId('buy_plot_C')
                    .setLabel('Comprar C')
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId('buy_plot_B')
                    .setLabel('Comprar B')
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId('buy_plot_A')
                    .setLabel('Comprar A')
                    .setStyle(ButtonStyle.Danger)

            );


        await interaction.reply({
            embeds: [embed],
            components: [row]
        });

    }

};
