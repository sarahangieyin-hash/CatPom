import { 
    SlashCommandBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    EmbedBuilder 
} from 'discord.js';
import { createFamilyRequest } from '../../family/requests/familyRequests.js';
import { getUserFamilyData } from '../../utils/families.js';

export default {
    data: new SlashCommandBuilder()
        .setName('parent')
        .setDescription('Envía una solicitud para añadir a alguien como tu padre/madre.')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('El usuario que quieres que sea tu padre/madre')
                .setRequired(true)
        ),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('usuario');
        const guildId = interaction.guild.id;
        const sender = interaction.user;

        // Validaciones básicas
        if (targetUser.id === sender.id) {
            return interaction.reply({
                content: '❌ No puedes añadirte a ti mismo/a como padre o madre.',
                ephemeral: true
            });
        }

        if (targetUser.bot) {
            return interaction.reply({
                content: '❌ No puedes añadir a un bot como padre o madre.',
                ephemeral: true
            });
        }

        // Verificar si ya es su padre/madre
        const senderFamily = await getUserFamilyData(guildId, sender.id);
        if (senderFamily.parents && senderFamily.parents.includes(targetUser.id)) {
            return interaction.reply({
                content: `❌ ${targetUser} ya figura como tu padre/madre.`,
                ephemeral: true
            });
        }

        // Generar un ID único para la solicitud
        const requestId = `parent_${Date.now()}_${sender.id}`;

        // Guardar la solicitud en la base de datos (u1 = Padre propuesto, u2 = Hijo que pide la relación)
        await createFamilyRequest(guildId, {
            id: requestId,
            type: 'parent_child',
            u1: targetUser.id, // El receptor será el padre
            u2: sender.id,     // El creador de la solicitud será el hijo
            createdBy: sender.id,
            targetUser: targetUser.id
        });

        // Crear botones de confirmación
        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`accept_parent:${requestId}`)
                .setLabel('Aceptar')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`reject_parent:${requestId}`)
                .setLabel('Rechazar')
                .setStyle(ButtonStyle.Danger)
        );

        const embed = new EmbedBuilder()
            .setTitle('👪 Solicitud de Paternidad / Maternidad')
            .setDescription(`¡Hola ${targetUser}! ${sender} te ha enviado una solicitud para que seas su **padre/madre**.\n\n¿Aceptas el vínculo familiar?`)
            .setColor('#5865F2')
            .setFooter({ text: 'Tienes tiempo para responder usando los botones de abajo.' })
            .setTimestamp();

        return interaction.reply({
            content: `${targetUser}`,
            embeds: [embed],
            components: [buttons]
        });
    }
};
