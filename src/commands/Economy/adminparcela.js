import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const ROL_ENCARGADO_ID = '1536563139489964134';

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

        if (subcommand === 'devolver') {
            try {
                const res = await pool.query(
                    'SELECT * FROM parcelas WHERE id = $1 AND guild_id = $2',
                    [idParcela, guildId]
                );

                const parcela = res.rows;

                if (!parcela) {
                    return interaction.reply({ content: `❌ No existe ninguna parcela con el ID **#${idParcela}**.`, ephemeral: true });
                }

                if (parcela.estado !== 'Ocupada' || !parcela.propietario_id) {
                    return interaction.reply({ content: `❌ Esta parcela no está ocupada actualmente por ningún usuario.`, ephemeral: true });
                }

                const propietarioId = parcela.propietario_id;
                const precioParcela = parcela.precio || (parcela.tipo === 'A' ? 2500 : parcela.tipo === 'B' ? 1000 : 500);
                const solicitudId = Date.now();

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
                    content: `✅ Contrato de devolución generado correctamente. Se ha enviado al canal para la firma de los encargados.`,
                    ephemeral: true
                });

                await interaction.channel.send({
                    content: `🔔 ¡Atención rol <@&${ROL_ENCARGADO_ID}>! Hay un nuevo **contrato de devolución** pendiente de firma.`,
                    embeds: [embed],
                    components: [row]
                });

            } catch (error) {
                console.error(error);
                await interaction.reply({ content: '❌ Ocurrió un error al consultar la base de datos.', ephemeral: true });
            }
        }
    }
};
