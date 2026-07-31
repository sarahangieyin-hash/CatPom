import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import * as familyUtils from '../../utils/families.js';

export default {
    data: new SlashCommandBuilder()
        .setName('cleanfamily')
        .setDescription('Limpia completamente todas las relaciones familiares del servidor (Solo Admins).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const guildId = interaction.guild.id;

        try {
            // Intenta usar la función de guardado o vaciado que exista en el archivo de utilidades
            if (typeof familyUtils.saveRelations === 'function') {
                await familyUtils.saveRelations(guildId, []);
            } else if (typeof familyUtils.setRelations === 'function') {
                await familyUtils.setRelations(guildId, []);
            } else if (typeof familyUtils.default === 'object') {
                // Si exporta un objeto por defecto
                await familyUtils.default.saveRelations?.(guildId, []);
            }

            return interaction.reply({
                content: '🧹 Se han eliminado correctamente todas las relaciones familiares registradas en este servidor.',
                ephemeral: true
            });
        } catch (error) {
            console.error('Error en cleanfamily:', error);
            return interaction.reply({
                content: '❌ Ocurrió un error al intentar vaciar las relaciones familiares.',
                ephemeral: true
            });
        }
    }
};
