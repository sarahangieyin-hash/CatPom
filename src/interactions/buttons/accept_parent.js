import { EmbedBuilder, MessageFlags } from 'discord.js';
import { addRelation } from '../../utils/families.js';

export default {
    customId: 'accept_parent',

    async execute(interaction, client, args) {
        try {
            // Si viene con ID de solicitud en args[0] o si viene con [parentId, childId]
            const requestId = args[0];
            
            // Intentamos recuperar la info desde la BD o parámetros
            console.log("🔘 Procesando solicitud accept_parent para:", requestId);

            // Supongamos que pasas los IDs en la interacción o parseas args
            let parentId = args[0];
            let childId = args[1];

            // Si el customId trae formato completo o viene desde solicitud guardada
            if (!childId && interaction.customId.includes(":")) {
                const parts = interaction.customId.split(":");
                if (parts.length >= 3) {
                    parentId = parts[1];
                    childId = parts[2];
                }
            }

            // Fallback si la interacción la activó el hijo
            if (!childId) childId = interaction.user.id;

            console.log(`⏳ Intentando guardar parent_child -> Guild: ${interaction.guild.id} | Padre: ${parentId} | Hijo: ${childId}`);

            // 🎯 GUARDAR EN LA BD
            const success = await addRelation(interaction.guild.id, parentId, childId, 'parent_child');

            console.log(`📌 ¿RESULTADO GUARDADO?: ${success ? '✅ SÍ' : '❌ NO'}`);

            if (!success) {
                return interaction.reply({
                    content: '⚠️ Hubo un problema al conectar con la Base de Datos para guardar la relación.',
                    flags: MessageFlags.Ephemeral
                });
            }

            const successEmbed = new EmbedBuilder()
                .setTitle('👪 ¡Familia Actualizada!')
                .setDescription(`¡Felicidades! Se ha aceptado y registrado la parentela en el árbol genealógico.`)
                .setColor('#22c55e')
                .setTimestamp();

            return interaction.update({
                embeds: [successEmbed],
                components: []
            });

        } catch (error) {
            console.error("❌ Error en accept_parent:", error);
            if (!interaction.replied) {
                await interaction.reply({
                    content: '❌ Ocurrió un error inesperado al procesar la solicitud.',
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    }
};
