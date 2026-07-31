import { SlashCommandBuilder } from 'discord.js';
import { getUserFamilyData, removeRelation } from '../../utils/families.js';

export default {
    data: new SlashCommandBuilder()
        .setName('renunciar')
        .setDescription('Renuncia a tus padres o a un padre/madre en específico.')
        .addUserOption(option =>
            option
                .setName('padre')
                .setDescription('Padre o madre a los que deseas renunciar')
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
        let parentIdToRemove;

        if (targetParent) {
            if (!family.parents.includes(targetParent.id)) {
                return interaction.reply({
                    content: `❌ ${targetParent} no está registrado/a como tu padre/madre.`,
                    ephemeral: true
                });
            }
            parentIdToRemove = targetParent.id;
        } else {
            if (family.parents.length === 1) {
                parentIdToRemove = family.parents[0];
            } else {
                return interaction.reply({
                    content: '❌ Tienes más de un padre/madre registrado. Por favor, especifica de quién quieres renunciar usando la opción `padre`.',
                    ephemeral: true
                });
            }
        }

        // Eliminar la relación de parentesco (parent_child donde u1 es el padre y u2 es el hijo)
        await removeRelation(guildId, parentIdToRemove, userId, 'parent_child');

        await interaction.reply({
            content: `🚪 <@${userId}> ha renunciado a la relación filial con <@${parentIdToRemove}>.`
        });
    }
};
