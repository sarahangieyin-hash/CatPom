import { MessageFlags } from 'discord.js';
import { getFamilyRequest, deleteFamilyRequest } from '../../family/requests/familyRequests.js';
import { addRelation } from '../../utils/families.js';

export default {
    customId: 'accept_parent',
    async execute(interaction) {
        const requestId = interaction.customId.split(':')[1];
        const guildId = interaction.guild.id;

        const request = await getFamilyRequest(guildId, requestId);

        if (!request) {
            return interaction.reply({
                content: '❌ Esta solicitud ya no existe o ha expirado.',
                flags: MessageFlags.Ephemeral
            });
        }

        if (interaction.user.id !== request.u1) {
            return interaction.reply({
                content: '❌ Esta solicitud no es para ti.',
                flags: MessageFlags.Ephemeral
            });
        }

        await addRelation(guildId, request.u1, request.u2, 'parent_child');
        await deleteFamilyRequest(guildId, requestId);

        return interaction.update({
            content: `🎉 ¡<@${request.u1}> ha aceptado a <@${request.u2}> como su hijo/a!`,
            embeds: [],
            components: []
        });
    }
};
