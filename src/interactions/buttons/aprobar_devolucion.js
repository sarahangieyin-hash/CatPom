import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const ROL_ENCARGADO_ID = '1536563139489964134';

export default {
    customIdPrefix: 'aprobar_devolucion_',

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(ROL_ENCARGADO_ID)) {
            return interaction.reply({ content: '❌ Solo los encargados pueden firmar este contrato.', ephemeral: true });
        }

        const parts = interaction.customId.split('_');
        const idParcela = parts[3];
        const propietarioId = parts[4];

        try {
            await pool.query(
                `UPDATE parcelas SET estado = 'Disponible', propietario_id = NULL WHERE id = $1 AND guild_id = $2`,
                [idParcela, interaction.guild.id]
            );

            await interaction.update({
                content: `✅ **Contrato firmado y aprobado** por ${interaction.user}.\n🏡 La parcela **#${idParcela}** vuelve a estar disponible y se ha procesado el desalojo de <@${propietarioId}>.`,
                components: []
            });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Error al procesar la devolución en la base de datos.', ephemeral: true });
        }
    }
};
