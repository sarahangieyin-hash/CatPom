import { removeRelation } from '../../utils/families.js';

export default {
    // Si usas un sistema de botones con customId:
    customId: 'renunciar_child',
    
    async execute(interaction) {
        try {
            const childId = interaction.user.id;
            
            // Extraer el ID del padre desde los argumentos del customId (ej: renunciar_child:ID_PADRE)
            const parentId = interaction.customId?.split(':')[1];

            if (!parentId) {
                return interaction.reply({
                    content: '❌ No se especificó el familiar del que deseas desvincularte.',
                    ephemeral: true
                });
            }

            // 🎯 BORRADO PERSISTENTE EN POSTGRESQL
            await removeRelation(
                interaction.guild.id,
                parentId,
                childId,
                'parent_child'
            );

            await interaction.reply({
                content: '✅ Has renunciado correctamente a la relación familiar.'
            });
        } catch (error) {
            console.error("❌ Error en renunciar_child:", error);
            if (!interaction.replied) {
                await interaction.reply({
                    content: '❌ Ocurrió un error al procesar la renuncia.',
                    ephemeral: true
                });
            }
        }
    }
};
