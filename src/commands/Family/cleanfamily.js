import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { getGuildRelations, saveGuildRelations } from '../../utils/families.js';

export default {
    data: new SlashCommandBuilder()
        .setName('cleanfamily')
        .setDescription('Limpia las relaciones familiares de un usuario o de todo el servidor.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('Usuario al que limpiar la familia (deja vacío para limpiar TODO el servidor)')
                .setRequired(false)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser('usuario');
        const guildId = interaction.guild.id;

        if (user) {
            // Limpiar solo las relaciones de un usuario específico
            let relations = await getGuildRelations(guildId);
            const initialCount = relations.length;

            relations = relations.filter(r => r.u1 !== user.id && r.u2 !== user.id);
            await saveGuildRelations(guildId, relations);

            const removed = initialCount - relations.length;

            return interaction.reply({
                content: `🧹 Se han eliminado **${removed}** relaciones familiares de ${user}.`,
                ephemeral: true
            });
        } else {
            // Limpiar TODAS las relaciones del servidor
            await saveGuildRelations(guildId, []);

            return interaction.reply({
                content: '🧹 Se han eliminado **todas** las relaciones familiares de este servidor.',
                ephemeral: true
            });
        }
    }
};
