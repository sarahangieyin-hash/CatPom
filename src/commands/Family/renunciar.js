import { removeRelation } from '../../utils/families.js';

export default {
    name: 'renunciar',
    description: 'Renuncia a tu relación o parentesco familiar.',
    customId: 'renunciar_child',
    
    async execute(interaction) {
        try {
            const childId = interaction.user.id;
            
            // Si es un Slash Command con una opción de usuario o un Botón con customId (renunciar_child:ID_PADRE)
            let parentId = interaction.options?.getUser('usuario')?.id || interaction.customId?.split(':')[1];

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
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: '❌ Ocurrió un error al procesar la renuncia.',
                    ephemeral: true
                });
            }
        }
    }
};
