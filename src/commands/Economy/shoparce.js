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

        // Creamos un embed por cada parcela o mostramos el listado
        const embeds = parcelas.map((p, index) => {
            const estadoTexto = p.estado === 'Ocupada' 
                ? `🔴 **Ocupada**\n👤 **Propietario:** <@${p.propietarioId}>` 
                : `🟢 **Disponible**`;

            return new EmbedBuilder()
                .setTitle(`🏛️ ${p.nombre} (Tipo ${p.tipo})`)
                .setDescription(
                    `📍 **Coordenadas:** \`${p.coordenadas}\`\n` +
                    `💰 **Precio:** ${p.precio} puntos\n` +
                    `📌 **Estado:** ${estadoTexto}`
                )
                .setImage(p.foto)
                .setColor(p.estado === 'Ocupada' ? '#E74C3C' : '#2ECC71')
                .setFooter({ text: `Parcela ${index + 1} de ${parcelas.length} • Oficina de Tierras de Metztlán` });
        });

        // Botón de contacto o aviso general para los encargados
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('reclamar_parcela_info')
                .setLabel('¿Cómo comprar una parcela?')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('📌')
        );

        await interaction.editReply({ 
            embeds: embeds.slice(0, 10), 
            components: [row] 
        });
    }
};
