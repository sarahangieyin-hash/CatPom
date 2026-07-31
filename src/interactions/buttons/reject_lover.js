import { EmbedBuilder } from 'discord.js';
import { 
    getFamilyRequest, 
    deleteFamilyRequest 
} from '../family/requests/familyRequests.js';

export default {
    customId: 'reject_lover',
    async execute(interaction) {
        const [, requestId] = interaction.customId.split(':');
        const guild = interaction.guild;
        const user = interaction.user;

        const request = await getFamilyRequest(guild.id, requestId);

        if (!request) {
            return interaction.reply({
                content: '❌ Esta propuesta ya no está disponible o caducó.',
                ephemeral: true
            });
        }

        // Solo el usuario objetivo puede rechazar la solicitud
        if (user.id !== request.targetUser) {
            return interaction.reply({
                content: '❌ Esta propuesta no es para ti, metiche. 🤫',
                ephemeral: true
            });
        }

        // Eliminar la solicitud
        await deleteFamilyRequest(guild.id, requestId);

        const rejectEmbed = new EmbedBuilder()
            .setTitle('💔 Propuesta rechazada')
            .setDescription(`<@${request.targetUser}> ha decidido mantener las distancias y rechazó la propuesta de <@${request.createdBy}>.`)
            .setColor('#7289da');

        return interaction.update({
            content: null,
            embeds: [rejectEmbed],
            components: []
        });
    }
};
