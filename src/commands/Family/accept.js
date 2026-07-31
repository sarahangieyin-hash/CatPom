import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { getFamilyRequest, deleteFamilyRequest } from '../../family/requests/familyRequests.js';
import { addRelation } from '../../utils/families.js';

export default {
    data: new SlashCommandBuilder()
        .setName('accept')
        .setDescription('Acepta una solicitud familiar pendiente introduciendo su ID.')
        .addStringOption(option =>
            option
                .setName('id')
                .setDescription('El ID único de la solicitud a aceptar')
                .setRequired(true)
        ),

    async execute(interaction) {
        const requestId = interaction.options.getString('id').trim();
        const guildId = interaction.guild.id;

        // 1. Buscar la solicitud en la base de datos
        const request = await getFamilyRequest(guildId, requestId);

        if (!request) {
            return interaction.reply({
                content: '❌ No se encontró ninguna solicitud activa con ese ID o ya ha expirado.',
                flags: MessageFlags.Ephemeral
            });
        }

        // 2. Validar que la persona que usa el comando sea el destinatario de la solicitud
        // (u1 o targetUser según cómo se guarde en tu DB)
        const targetId = request.u1 || request.targetUser;
        
        if (interaction.user.id !== targetId) {
            return interaction.reply({
                content: '❌ Esta solicitud familiar no está dirigida a ti.',
                flags: MessageFlags.Ephemeral
            });
        }

        // 3. Procesar el tipo de vínculo
        const senderId = request.u2 || request.createdBy;
        const relationType = request.type || 'parent_child';

        // Guardar la relación en la base de datos
        await addRelation(guildId, targetId, senderId, relationType);
        
        // Eliminar la solicitud ya procesada
        await deleteFamilyRequest(guildId, requestId);

        // 4. Confirmar la acción en el servidor
        return interaction.reply({
            content: `🎉 ¡<@${interaction.user.id}> ha aceptado la solicitud familiar de <@${senderId}>!`,
            components: []
        });
    }
};
