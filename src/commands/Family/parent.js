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

        const senderFamily = await getUserFamilyData(guildId, sender.id);

        // 🚫 LÍMITE: Si ya tiene 1 o más padres registrados, no puede solicitar otro.
        if (senderFamily.parents && senderFamily.parents.length >= 1) {
            return interaction.reply({
                content: '❌ Ya tienes un padre/madre registrado. No puedes añadir a más personas directamente.',
                ephemeral: true
            });
        }

        // Generar un ID único para la solicitud
        const requestId = `parent_${Date.now()}_${sender.id}`;

        // Guardar la solicitud (u1 = Padre propuesto, u2 = Hijo que pide la relación)
        await createFamilyRequest(guildId, {
            id: requestId,
            type: 'parent_child',
            u1: targetUser.id,
            u2: sender.id,
            createdBy: sender.id,
            targetUser: targetUser.id
        });

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
