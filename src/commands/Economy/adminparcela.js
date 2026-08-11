import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import fs from 'fs';
import path from 'path';

const parcelasPath = path.resolve('src/data/parcelas.json');
const solicitudesPath = path.resolve('src/data/solicitudes_compras.json');

export default {
    data: new SlashCommandBuilder()
        .setName('adminparcela')
        .setDescription('Gestiona contratos de devolución o traspaso de parcelas (Requiere aprobación de staff)')
        .addSubcommand(sub =>
            sub.setName('devolver')
               .setDescription('Inicia un contrato para desocupar una parcela, devolver Pomp y reingresar el derecho')
               .addIntegerOption(o => o.setName('id').setDescription('ID de la parcela a liberar').setRequired(true))
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const idParcela = interaction.options.getInteger('id');
        const guildId = interaction.guild.id;

        let dataParcelas = {};
        if (fs.existsSync(parcelasPath)) {
            try { dataParcelas = JSON.parse(fs.readFileSync(parcelasPath, 'utf8')); } catch (e) {}
        }

        const lista = dataParcelas[guildId] || [];
        const parcela = lista[idParcela - 1];

        if (!parcela) {
            return interaction.reply({ content: `❌ No existe ninguna parcela con el ID **#${idParcela}**.`, ephemeral: true });
        }

        if (subcommand === 'devolver') {
            if (parcela.estado !== 'Ocupada' || !parcela.propietarioId) {
                return interaction.reply({ content: `❌ Esta parcela no está ocupada actualmente por ningún usuario.`, ephemeral: true });
            }

            const propietarioId = parcela.propietarioId;
            const precioParcela = parcela.precio || (parcela.tipo === 'A' ? 2500 : parcela.tipo === 'B' ? 1000 : 500);
            const solicitudId = Date.now();

            // Guardar solicitud de devolución en el archivo de solicitudes
            let solicitudes = {};
            if (fs.existsSync(solicitudesPath)) {
                try { solicitudes = JSON.parse(fs.readFileSync(solicitudesPath, 'utf8')); } catch (e) {}
            }

            if (!solicitudes[guildId]) solicitudes[guildId] = [];

            solicitudes[guildId].push({
                solicitudId: solicitudId,
                tipoAccion: 'devolucion',
                parcelaId: idParcela,
                userId: propietarioId,
                tipoParcela: parcela.tipo,
                precioDevolver: precioParcela,
                estado: 'Pendiente'
            });

            fs.writeFileSync(solicitudesPath, JSON.stringify(solicitudes, null, 2));

            // Crear botones de contrato para los encargados
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId(`aprobar_devolucion_${solicitudId}_${idParcela}_${propietarioId}_${parcela.tipo}_${precioParcela}`)
                    .setLabel('Firmar Contrato (Aprobar Devolución)')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('📝'),
                new ButtonBuilder()
                    .setCustomId(`rechazar_devolucion_${solicitudId}`)
                    .setLabel('Rechazar Contrato')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('❌')
            );

            const embed = new EmbedBuilder()
                .setTitle(`📜 Contrato de Desalojo y Devolución (ID Parcela #${idParcela})`)
                .setDescription(
                    `👤 **Propietario Actual:** <@${propietarioId}>\n` +
                    `🏡 **Parcela:** ${parcela.nombre} (Tipo ${parcela.tipo})\n` +
                    `💰 **Pomp a Reembolsar:** ${precioParcela} Pomp\n` +
                    `📦 **Derecho a Retornar:** 1x Parcela Tipo ${parcela.tipo} al inventario\n\n` +
                    `📌 *Un encargado debe firmar este contrato para procesar la devolución oficial.*`
                )
                .setColor('#E67E22')
                .setTimestamp();

            await interaction.reply({
                content: `✅ Contrato de devolución generado correctamente. Se ha enviado al canal para la firma de los encargados.`
            });

            await interaction.channel.send({
                content: `🔔 ¡Atención rol <@&1536563139489964134>! Hay un nuevo **contrato de devolución** pendiente de firma.`,
                embeds: [embed],
                components: [row]
            });
        }
    }
};
