import { addRelation } from '../../utils/families.js';

export default {
    customId: 'accept_adoption',

    async execute(interaction, client, args) {
        try {
            const parentId = args[0];
            const childId = args[1];

            if (interaction.user.id !== childId) {
                return interaction.reply({
                    content: '❌ Esta solicitud no es para ti.',
                    ephemeral: true
                });
            }

            await addRelation(
                interaction.guild.id,
                parentId,
                childId,
                'parent_child'
            );

            await interaction.update({
                content: `👶 <@${childId}> ha aceptado ser adoptado/a por <@${parentId}>.`,
                components: []
            });
        } catch (error) {
            console.error('========== ERROR ACCEPT_ADOPTION ==========', error);

            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: `❌ Error: ${error.message}`,
                    ephemeral: true
                }).catch(() => {});
            } else {
                await interaction.followUp({
                    content: `❌ Error: ${error.message}`,
                    ephemeral: true
                }).catch(() => {});
            }
        }
    }
};
