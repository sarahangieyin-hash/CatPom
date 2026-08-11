import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import fs from 'fs';
import path from 'path';

const filePath = path.resolve('src/data/parcelas.json');

export default {
    data: new SlashCommandBuilder()
        .setName('shoparce')
        .setDescription('Muestra el catálogo actual de parcelas disponibles y ocupadas'),

    async execute(interaction) {
        await interaction.deferReply();

        let data = {};
        if (fs.existsSync(filePath)) {
            try {
                data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            } catch (e) {
                data = {};
            }
        }

        const guildId = interaction.guild.id;
        const parcelas = data[guildId] || [];

        if (parcelas.length === 0) {
            return interaction.editReply('🏛️ Actualmente no hay parcelas registradas en la Oficina de Tierras.');
        }

        // Mapeamos cada parcela creando su Embed y su propio botón de compra
        for (const [index, p] of parcelas.entries()) {
            const estadoTexto = p.estado === 'Ocupada' 
                ? `🔴 **Ocupada**\n👤 **Propietario:** <@${p.propietarioId}>` 
                : `🟢 **Disponible**`;

            const embed = new EmbedBuilder()
                .setTitle(`🏛️ ${p.nombre} (Tipo ${p.tipo})`)
                .setDescription(
                    `📍 **Coordenadas:** \`${p.coordenadas}\`\n` +
                    `💰 **Precio:** ${p.precio} puntos\n` +
                    `📌 **Estado:** ${estadoTexto}`
                )
                .setImage(p.foto)
                .setColor(p.estado === 'Ocupada' ? '#E74C3C' : '#2ECC71')
                .setFooter({ text: `Parcela ${index + 1} de ${parcelas.length} • Oficina de Tierras de Metztlán` });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`comprar_parcela_${p.nombre}`)
                    .setLabel(`Quiero esta parcela (${p.nombre})`)
                    .setStyle(p.estado === 'Ocupada' ? ButtonStyle.Secondary : ButtonStyle.Success)
                    .setEmoji('🏠')
                    .setDisabled(p.estado === 'Ocupada') // Se desactiva si ya está ocupada
            );

            // Si es la primera, respondemos; si hay más, usamos followUp para enviarlas todas ordenadas
            if (index === 0) {
                await interaction.editReply({ embeds: [embed], components: [row] });
            } else {
                await interaction.followUp({ embeds: [embed], components: [row] });
            }
        }
    }
};
