import { EmbedBuilder } from 'discord.js';
import { 
    getFamilyRequest, 
    deleteFamilyRequest 
} from '../../family/requests/familyRequests.js';
import { addRelation } from '../../utils/families.js';

export default {
    customId: 'accept_lover',
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

        // Solo el usuario objetivo puede aceptar la solicitud
        if (user.id !== request.targetUser) {
            return interaction.reply({
                content: '❌ Esta propuesta no es para ti, metiche. 🤫',
                ephemeral: true
            });
        }

        // Registrar la relación de amantes en la base de datos
        await addRelation(guild.id, request.createdBy, request.targetUser, 'lover');
        
        // Limpiar la solicitud pendiente
        await deleteFamilyRequest(guild.id, requestId);

        const acceptEmbed = new EmbedBuilder()
            .setTitle('🔥 Vuestro pequeño secreto...')
            .setDescription(`¡Shhh! <@${request.targetUser}> ha aceptado la propuesta de <@${request.createdBy}>. 🤫\n\n*A partir de ahora, esto quedará entre vosotros dos...*`)
            .setColor('#e74c3c')
            .setFooter({ text: 'Guardaremos bien el secreto.' });

        return interaction.update({
            content: null,
            embeds: [acceptEmbed],
            components: []
        });
    }
};
