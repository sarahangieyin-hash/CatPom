import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { setInDb } from '../../utils/families.js';

export default {
    data: new SlashCommandBuilder()
        .setName('cleanfamily')
        .setDescription('Limpia completamente todas las relaciones familiares del servidor (Solo Admins).')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const guildId = interaction.guild.id;

        // Reinicia la lista de relaciones a un array vacío en Postgres
        await setInDb(`family_${guildId}_relations`, []);

        return interaction.reply({
            content: '🧹 Se han eliminado correctamente todas las relaciones familiares registradas en este servidor.',
            ephemeral: true
        });
    }
};
