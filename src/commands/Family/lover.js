import { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle,
    MessageFlags 
} from 'discord.js';
import { 
    createFamilyRequest, 
    getFamilyRequestByCreator 
} from '../../family/requests/familyRequests.js';
import { getUserFamilyData } from '../../utils/families.js';

export default {
    data: new SlashCommandBuilder()
        .setName('lover')
        .setDescription('Propón un romance secreto a alguien 🔥.')
        .addUserOption(option =>
            option
                .setName('persona')
                .setDescription('La persona con la que quieres tener un romance secreto')
                .setRequired(true)
        ),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('persona');
        const guildId = interaction.guild.id;
        const sender = interaction.user;

        if (targetUser.id === sender.id) {
            return interaction.reply({
                content: '❌ No puedes tener un romance secreto contigo mismo/a.',
                flags: MessageFlags.Ephemeral
            });
        }

        if (targetUser.bot) {
            return interaction.reply({
                content: '❌ No puedes proponerle esto a un bot.',
                flags: MessageFlags.Ephemeral
            });
        }

        // Verificar si ya tiene una solicitud pendiente creada por él
        const existing = await getFamilyRequestByCreator(guildId, sender.id);
        if (existing) {
            return interaction.reply({
                content: '❌ Ya tienes una solicitud pendiente. Espera a que sea respondida.',
                flags: MessageFlags.Ephemeral
            });
        }

        // Validar si ya son amantes en los datos actuales
        const family = await getUserFamilyData(guildId, sender.id);
        const currentLovers = Array.isArray(family?.lovers) ? family.lovers.map(l => typeof l === 'object' ? l.id : l) : [];

        if (currentLovers.includes(targetUser.id)) {
            return interaction.reply({
                content: '❌ ¡Esa persona ya comparte tu pequeño secreto!',
                flags: MessageFlags.Ephemeral
            });
        }

        // Generar ID única para la solicitud de amante
        const requestId = `lover_${Date.now()}_${sender.id}`;

        await createFamilyRequest(guildId, requestId, {
            type: 'lover',
            u1: sender.id,
            u2: targetUser.id,
            createdBy: sender.id,
            targetUser: targetUser.id
        });

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`accept_lover:${requestId}`)
                .setLabel('Aceptar secreto 🤫')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(`reject_lover:${requestId}`)
                .setLabel('Rechazar')
                .setStyle(ButtonStyle.Danger)
        );

        const embed = new EmbedBuilder()
            .setTitle('🔥 Propuesta de Romance Secreto')
            .setDescription(`¡Shhh... ${sender} te ha deslizado una propuesta muy íntima!\n\n¿Aceptas convertir esto en vuestro **pequeño secreto**?`)
            .setColor('#e74c3c')
            .setFooter({ text: 'Nadie más tiene por qué enterarse...' })
            .setTimestamp();

        return interaction.reply({
            content: `${targetUser}`,
            embeds: [embed],
            components: [buttons]
        });
    }
};
