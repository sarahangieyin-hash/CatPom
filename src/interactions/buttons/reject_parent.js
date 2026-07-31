import { MessageFlags } from 'discord.js';
import { getFamilyRequest, deleteFamilyRequest } from '../../family/requests/familyRequests.js';

export default {
    customId: 'reject_parent',
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

        await deleteFamilyRequest(guildId, requestId);

        return interaction.update({
            content: `❌ <@${request.u1}> ha rechazado la solicitud de paternidad/maternidad de <@${request.u2}>.`,
            embeds: [],
            components: []
        });
    }
};
