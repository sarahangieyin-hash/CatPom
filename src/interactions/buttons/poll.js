export default {
    customId: 'poll', // Lo configuraremos para que detecte el prefijo

    async execute(interaction, client, args) {
        // args vendrá como ['1533548972134895798', '0'] gracias al separador '_'
        const roleId = args[0];
        const optionIndex = args[1];

        // Verificar si tiene el rol permitido
        if (!interaction.member.roles.cache.has(roleId)) {
            return interaction.reply({
                content: `❌ Solo los miembros con el rol <@&${roleId}> pueden votar en esta encuesta.`,
                flags: 64
            });
        }

        await interaction.reply({
            content: `✅ ¡Tu voto para la opción ${parseInt(optionIndex) + 1} ha sido registrado!`,
            flags: 64
        });
    }
};
