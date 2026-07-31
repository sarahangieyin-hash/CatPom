import { 
    SlashCommandBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    EmbedBuilder,
    MessageFlags 
} from 'discord.js';
import { createFamilyRequest } from '../../family/requests/familyRequests.js';
import { getUserFamilyData } from '../../utils/families.js';

export default {
    data: new SlashCommandBuilder()
        .setName('adopt')
        .setDescription('Envía una propuesta de adopción a un usuario.')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('El usuario al que deseas adoptar como hijo/a')
                .setRequired(true)
        ),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('usuario');
        const guildId = interaction.guild.id;
        const sender = interaction.user;

        if (targetUser.id === sender.id) {
            return interaction.reply({
                content: '❌ No puedes adoptarte a ti mismo/a.',
                flags: MessageFlags.Ephemeral
            });
        }

        if (targetUser.bot) {
            return interaction.reply({
                content: '❌ No puedes adoptar a un bot.',
                flags: MessageFlags.Ephemeral
            });
        }

        const childFamily = await getUserFamilyData(guildId, targetUser.id);

        // 🚫 LÍMITE: Si el usuario objetivo ya tiene padre/madre registrado, no puede ser adoptado por otra persona
        if (childFamily.parents && childFamily.parents.length >= 1) {
            return interaction.reply({
                content: `❌ ${targetUser} ya tiene un padre/madre registrado y no puede ser adoptado/a por otra persona.`,
                flags: MessageFlags.Ephemeral
            });
        }

        const requestId = `adopt_${Date.now()}_${sender.id}`;

        // 🛠️ CORREGIDO: Se pasa requestId directamente como 2º parámetro (String), evitando que se guarde [object Object]
        await createFamilyRequest(guildId, requestId, {
            type: 'parent_child',
            u1: sender.id,       // Padre adoptivo
            u2: targetUser.id,   // Hijo a adoptar
            createdBy: sender.id,
            targetUser: targetUser.id
        });

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`accept_adoption:${requestId}`)
                .setLabel('Aceptar')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`reject_adoption:${requestId}`)
                .setLabel('Rechazar')
                .setStyle(ButtonStyle.Danger)
        );

        const embed = new EmbedBuilder()
            .setTitle('👶 Solicitud de Adopción')
            .setDescription(`¡Hola ${targetUser}! ${sender} quiere **adoptarte** como su hijo/a.\n\n¿Aceptas ser adoptado/a?`)
            .setColor('#5865F2')
            .setFooter({ text: 'Responde a la solicitud usando los botones.' })
            .setTimestamp();

        return interaction.reply({
            content: `${targetUser}`,
            embeds: [embed],
            components: [buttons]
        });
    }
};
