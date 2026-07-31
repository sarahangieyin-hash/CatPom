import { getUserFamilyData, removeRelation } from '../../utils/families.js';

export default {
    customId: 'renunciar_child',
    async execute(interaction) {
        const guildId = interaction.guild.id;
        const userId = interaction.user.id;
        const targetChildId = interaction.values[0];

        const family = await getUserFamilyData(guildId, userId);

        if (!family.children || !family.children.includes(targetChildId)) {
            return interaction.reply({
                content: '❌ Este usuario ya no figura como tu hijo/a.',
                ephemeral: true
            });
        }

        await removeRelation(guildId, userId, targetChildId, 'parent_child');

        return interaction.update({
            content: `🚪 Has renunciado a la relación filial con <@${targetChildId}>.`,
            components: []
        });
    }
};
