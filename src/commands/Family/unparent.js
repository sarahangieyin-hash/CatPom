import { SlashCommandBuilder } from 'discord.js';
import { getUserFamilyData, removeRelation } from '../../utils/families.js';

export default {
    data: new SlashCommandBuilder()
        .setName('unparent')
        .setDescription('Quita a tus padres o a un padre/madre en específico.')
        .addUserOption(option =>
            option
                .setName('padre')
                .setDescription('Padre o madre del que te quieres desvincular (deja en blanco para quitar todos)')
                .setRequired(false)
        ),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const userId = interaction.user.id;

        const family = await getUserFamilyData(guildId, userId);

        if (!family.parents || family.parents.length === 0) {
            return interaction.reply({
                content: '❌ No tienes ningún padre o madre registrado/a.',
                ephemeral: true
            });
        }

        const targetParent = interaction.options.getUser('padre');

        if (targetParent) {
            // Desvincularse de un padre en específico
            if (!family.parents.includes(targetParent.id)) {
                return interaction.reply({
                    content: `❌ ${targetParent} no figura como tu padre/madre.`,
                    ephemeral: true
                });
            }

            await removeRelation(guildId, targetParent.id, userId, 'parent_child');

            return interaction.reply({
                content: `🚪 <@${userId}> se ha desvinculado de ${targetParent}.`
            });
        } else {
            // Desvincularse de TODOS los padres
            const antiguosPadres = [...family.parents];

            for (const parentId of antiguosPadres) {
                await removeRelation(guildId, parentId, userId, 'parent_child');
            }

            const listaPadres = antiguosPadres.map(id => `<@${id}>`).join(', ');

            return interaction.reply({
                content: `🚪 <@${userId}> se ha desvinculado de todos sus padres (${listaPadres}).`
            });
        }
    }
};
