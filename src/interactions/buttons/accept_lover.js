import { addRelation } from '../../utils/families.js';

export default {
    customId: 'accept_lover',
    async execute(interaction) {
        try {
            const user1 = interaction.user.id;
            const user2 = interaction.customId.split(':')[1] || interaction.message?.interaction?.user?.id;

            if (!user2) {
                return interaction.reply({
                    content: '❌ No se pudo identificar a la pareja.',
                    ephemeral: true
                });
            }

            // 🎯 GUARDADO PERSISTENTE EN POSTGRESQL (Tipo Lover)
            await addRelation(
                interaction.guild.id,
                user1,
                user2,
                'lover'
            );

            await interaction.update({
                content: `💕 <@${user1}> y <@${user2}> ahora son amantes.`,
                components: []
            });
        } catch (error) {
            console.error("❌ Error en accept_lover:", error);
            if (!interaction.replied) {
                await interaction.reply({
                    content: '❌ Ocurrió un error al aceptar la solicitud.',
                    ephemeral: true
                });
            }
        }
    }
};
