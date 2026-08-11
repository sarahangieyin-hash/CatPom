const ROL_ENCARGADO_ID = '1536563139489964134';

export default {
    customIdPrefix: 'rechazar_devolucion_',

    async execute(interaction) {
        if (!interaction.member.roles.cache.has(ROL_ENCARGADO_ID)) {
            return interaction.reply({ content: '❌ Solo los encargados pueden rechazar este contrato.', ephemeral: true });
        }

        await interaction.update({
            content: `❌ **Contrato rechazado** por ${interaction.user}. La solicitud de devolución ha sido cancelada.`,
            components: []
        });
    }
};
