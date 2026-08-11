import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import fs from 'fs';
import path from 'path';

const parcelasPath = path.resolve('src/data/parcelas.json');
const solicitudesPath = path.resolve('src/data/solicitudes_compras.json');

export default {
    data: new SlashCommandBuilder()
        .setName('buy')
        .setDescription('Compra una parcela física del catálogo usando su número de ID')
        .addIntegerOption(o => 
            o.setName('id')
             .setDescription('Número de ID de la parcela que deseas comprar (ver en /shoparce)')
             .setRequired(true)
        ),

    async execute(interaction) {
        const idParcela = interaction.options.getInteger('id');
        const guildId = interaction.guild.id;

        // 1. Cargar parcelas físicas
        let dataParcelas = {};
        if (fs.existsSync(parcelasPath)) {
            try { dataParcelas = JSON.parse(fs.readFileSync(parcelasPath, 'utf8')); } catch (e) {}
        }

        const listaParcelas = dataParcelas[guildId] || [];
        const parcela = listaParcelas[idParcela - 1];

        if (!parcela) {
            return interaction.reply({ 
                content: `❌ No se ha encontrado ninguna parcela física con el ID **#${idParcela}**. Revisa el catálogo en \`/shoparce\`.`, 
                ephemeral: true 
            });
        }

        if (parcela.estado === 'Ocupada') {
            return interaction.reply({ 
                content: `❌ Lo siento, la parcela **${parcela.nombre}** (ID #${idParcela}) ya se encuentra **ocupada**.`, 
                ephemeral: true 
            });
        }

        // 2. Registrar la solicitud de compra para los encargados
        let solicitudes = {};
        if (fs.existsSync(solicitudesPath)) {
            try { solicitudes = JSON.parse(fs.readFileSync(solicitudesPath, 'utf8')); } catch (e) {}
        }

        if (!solicitudes[guildId]) solicitudes[guildId] = [];

        const solicitudId = Date.now();

        solicitudes[guildId].push({
            solicitudId: solicitudId,
            parcelaId: idParcela,
            nombreParcela: parcela.nombre,
            userId: interaction.user.id,
            estado: 'Pendiente'
        });

        fs.writeFileSync(solicitudesPath, JSON.stringify(solicitudes, null, 2));

        // 3. Crear botones interactivos para los encargados
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`aprobar_parcela_${solicitudId}_${idParcela}_${interaction.user.id}`)
                .setLabel('Aprobar Asignación')
                .setStyle(ButtonStyle.Success)
                .setEmoji('✅'),
            new ButtonBuilder()
                .setCustomId(`rechazar_parcela_${solicitudId}`)
                .setLabel('Rechazar')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('❌')
        );

        const embed = new EmbedBuilder()
            .setTitle(`🏛️ Solicitud de Compra de Parcela (ID #${idParcela})`)
            .setDescription(
                `👤 **Comprador:** <@${interaction.user.id}>\n` +
                `🏡 **Parcela:** ${parcela.nombre} (Tipo ${parcela.tipo})\n` +
                `📍 **Coordenadas:** \`${parcela.coordenadas}\`\n` +
                `💰 **Precio:** ${parcela.precio} puntos\n\n` +
                `📌 **Estado:** Pendiente de revisión por los encargados.`
            )
            .setColor('#F1C40F')
            .setTimestamp();

        await interaction.reply({
            content: `✅ Has solicitado la compra de la parcela **${parcela.nombre}** (ID #${idParcela}). Los encargados revisarán tu petición.`
        });

        await interaction.channel.send({
            content: `🔔 ¡Atención rol <@&1536563139489964134>! Hay una nueva solicitud de parcela física.`,
            embeds: [embed],
            components: [row]
        });
    }
};
