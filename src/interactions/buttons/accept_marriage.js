import { addRelation } from '../../utils/families.js';

export default {
    customId: 'accept_marriage',
    async execute(interaction) {
        try {
            const user1 = interaction.user.id;
            // Se obtiene el usuario que propuso la boda
            const user2 = interaction.message?.interaction?.user?.id || interaction.customId.split(':')[1];

            if (!user2) {
                return interaction.reply({
                    content: '❌ No se pudo identificar al otro usuario.',
                    ephemeral: true
                });
            }

            // 🎯 GUARDADO PERSISTENTE EN POSTGRESQL (Tipo Marriage)
            await addRelation(
                interaction.guild.id,
                user1,
                user2,
                'marriage'
            );

            await interaction.update({
                content: `💖 ¡Felicidades! <@${user1}> y <@${user2}> ahora están casados.`,
                components: []
            });
        } catch (error) {
            console.error("❌ Error en accept_marriage:", error);
            if (!interaction.replied) {
                await interaction.reply({
                    content: '❌ Ocurrió un error al procesar el matrimonio.',
                    ephemeral: true
                });
            }
        }
    }
};
