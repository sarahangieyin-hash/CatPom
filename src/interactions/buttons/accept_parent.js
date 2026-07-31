import { addRelation } from '../../utils/families.js';

export default {
    customId: 'accept_parent',
    async execute(interaction) {
        try {
            // Se asume que el customId trae el ID de la solicitud: accept_parent:request_id
            const args = interaction.customId.split(':');
            const requestId = args[1];

            // Desestructuración o lógica para obtener los IDs de los usuarios involucrados
            // Ajusta estas variables según cómo almacenes temporalmente el payload
            const parentId = interaction.message?.mentions?.users?.first()?.id || interaction.user.id;
            const childId = interaction.user.id;

            // 🎯 GUARDADO PERSISTENTE EN POSTGRESQL
            await addRelation(
                interaction.guild.id,
                parentId,
                childId,
                'parent_child'
            );

            await interaction.update({
                content: '✅ ¡La relación familiar ha sido aceptada y guardada en la base de datos!',
                components: []
            });
        } catch (error) {
            console.error("❌ Error en accept_parent:", error);
            if (!interaction.replied) {
                await interaction.reply({
                    content: '❌ Ocurrió un error al procesar la aceptación.',
                    ephemeral: true
                });
            }
        }
    }
};
