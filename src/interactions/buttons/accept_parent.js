import { getFamilyRequestById, deleteFamilyRequest } from '../../family/requests/familyRequests.js';
import { addRelation } from '../../utils/families.js';

export default {
    customId: 'accept_parent',
    async execute(interaction) {
        // Extraer el requestId (ej: accept_parent:parent_123456789)
        const requestId = interaction.customId.split(':')[1];
        const guildId = interaction.guild.id;

        const request = await getFamilyRequestById(guildId, requestId);

        if (!request) {
            return interaction.reply({
                content: '❌ Esta solicitud ya no existe o ha expirado.',
                ephemeral: true
            });
        }

        // Verificar que solo la persona invitada (el padre/madre) pueda aceptar
        if (interaction.user.id !== request.u1) {
            return interaction.reply({
                content: '❌ Esta solicitud no es para ti.',
                ephemeral: true
            });
        }

        // Guardar la relación en la base de datos (u1: Padre, u2: Hijo)
        await addRelation(guildId, request.u1, request.u2, 'parent_child');
        await deleteFamilyRequest(guildId, requestId);

        return interaction.update({
            content: `🎉 ¡<@${request.u1}> ha aceptado a <@${request.u2}> como su hijo/a!`,
            embeds: [],
            components: []
        });
    }
};
