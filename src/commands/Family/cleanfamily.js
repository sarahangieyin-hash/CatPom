import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { db } from '../../database/postgres.js'; // Ajusta la ruta a tu cliente/wrapper Postgres si difiere

export default {
    data: new SlashCommandBuilder()
        .setName('cleanfamily')
        .setDescription('Limpia completamente todas las relaciones familiares del servidor (Solo Admins).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const guildId = interaction.guild.id;

        try {
            // Elimina o vacía la clave de relaciones familiares del servidor
            if (db && typeof db.set === 'function') {
                await db.set(`family_${guildId}_relations`, []);
            } else if (db && typeof db.query === 'function') {
                await db.query('DELETE FROM families WHERE guild_id = $1', [guildId]);
            } else {
                return interaction.reply({
                    content: '❌ No se pudo conectar con la base de datos para limpiar los datos.',
                    ephemeral: true
                });
            }

            return interaction.reply({
                content: '🧹 Se han eliminado correctamente todas las relaciones familiares registradas en este servidor.',
                ephemeral: true
            });
        } catch (error) {
            console.error('Error en cleanfamily:', error);
            return interaction.reply({
                content: '❌ Ocurrió un error al intentar vaciar la base de datos de familia.',
                ephemeral: true
            });
        }
    }
};
