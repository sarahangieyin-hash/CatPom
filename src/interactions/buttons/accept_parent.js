import { EmbedBuilder, MessageFlags } from 'discord.js';
import { addRelation } from '../../utils/families.js';

export default {
    customId: 'accept_parent',

    async execute(interaction, client, args) {
        try {
            const rawArg = args[0] || '';
            let parentId = null;
            let childId = interaction.user.id; // Quien presiona el botón suele ser quien acepta

            // 🎯 SI EL ARGUMENTO TRAE FORMATO 'parent_timestamp_userId'
            if (rawArg.startsWith('parent_')) {
                const parts = rawArg.split('_');
                // El creador de la solicitud fue parts[2]
                parentId = parts[2];
            } else if (args.length >= 2) {
                parentId = args[0];
                childId = args[1];
            }

            if (!parentId) {
                return interaction.reply({
                    content: '❌ No se pudo determinar quién hizo la solicitud.',
                    flags: MessageFlags.Ephemeral
                });
            }

            console.log(`⏳ Guardando en BD -> Servidor: ${interaction.guild.id} | Padre: ${parentId} | Hijo: ${childId}`);

            // Guardar la relación en PostgreSQL
            const success = await addRelation(interaction.guild.id, parentId, childId, 'parent_child');

            if (!success) {
                return interaction.reply({
                    content: '⚠️ Ocurrió un error al registrar la relación en la base de datos.',
                    flags: MessageFlags.Ephemeral
                });
            }

            const successEmbed = new EmbedBuilder()
                .setTitle('👪 ¡Familia Actualizada!')
                .setDescription(`¡Felicidades! Se ha aceptado y registrado la parentela entre <@${parentId}> y <@${childId}>.`)
                .setColor('#22c55e')
                .setTimestamp();

            return interaction.update({
                embeds: [successEmbed],
                components: []
            });

        } catch (error) {
            console.error("❌ Error en accept_parent.js:", error);
            if (!interaction.replied) {
                await interaction.reply({
                    content: '❌ Ocurrió un error inesperado.',
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    }
};
