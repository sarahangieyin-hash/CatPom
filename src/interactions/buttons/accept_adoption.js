import { addRelation } from '../../utils/families.js';

export default {
    customId: 'accept_adoption',
    async execute(interaction) {
        try {
            const parentId = interaction.customId.split(':')[1] || interaction.message?.interaction?.user?.id;
            const childId = interaction.user.id;

            if (!parentId) {
                return interaction.reply({
                    content: '❌ No se pudo identificar al padre/madre adoptivo.',
                    ephemeral: true
                });
            }

            // 🎯 GUARDADO PERSISTENTE EN POSTGRESQL (Tipo Adoption)
            await addRelation(
                interaction.guild.id,
                parentId,
                childId,
                'adoption'
            );

            await interaction.update({
                content: `👶 ¡Adopción completada! <@${childId}> ha sido adoptado por <@${parentId}>.`,
                components: []
            });
        } catch (error) {
            console.error("❌ Error en accept_adoption:", error);
            if (!interaction.replied) {
                await interaction.reply({
                    content: '❌ Ocurrió un error al procesar la adopción.',
                    ephemeral: true
                });
            }
        }
    }
};
