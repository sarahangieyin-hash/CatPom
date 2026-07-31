import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { saveGuildRelations } from '../../utils/families.js';

export default {
    data: new SlashCommandBuilder()
        .setName('cleanfamily')
        .setDescription('Limpia completamente todas las relaciones familiares del servidor (Solo Admins).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const guildId = interaction.guild.id;

        try {
            await saveGuildRelations(guildId, []);

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
