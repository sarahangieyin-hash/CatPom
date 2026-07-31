import { SlashCommandBuilder } from 'discord.js';
import { getUserFamilyData, deleteRelation } from '../../utils/families.js';

export default {
    data: new SlashCommandBuilder()
        .setName('divorce')
        .setDescription('Divórciate de tu pareja actual.'),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const userId = interaction.user.id;

        const family = await getUserFamilyData(guildId, userId);

        if (!family.spouses || family.spouses.length === 0) {
            return interaction.reply({
                content: '❌ Actualmente no estás casada/o con nadie.',
                ephemeral: true
            });
        }

        // Obtener la pareja actual
        const spouseId = family.spouses[0];

        // Eliminar la relación de matrimonio
        await deleteRelation(guildId, userId, spouseId, 'marriage');

        return interaction.reply({
            content: `💔 Te has divorciado correctamente de <@${spouseId}>.`
        });
    }
};
