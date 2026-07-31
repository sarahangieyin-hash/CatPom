import { 
    SlashCommandBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle,
    AttachmentBuilder,
    MessageFlags 
} from 'discord.js';

import { getUserFamilyData } from '../../utils/families.js';
import { renderFamilyTree } from '../../family/render/treeRenderer.js';

export default {
    data: new SlashCommandBuilder()
        .setName('customizetree')
        .setDescription('Personaliza completamente los colores, textos y dirección de tu árbol familiar.'),

    async execute(interaction) {
        try {
            const targetUser = interaction.user;

            const family = await getUserFamilyData(
                interaction.guild.id,
                targetUser.id
            );

            const hasFamily =
                family.spouses?.length > 0 ||
                family.children?.length > 0 ||
                family.parents?.length > 0 ||
                family.siblings?.length > 0 ||
                family.lovers?.length > 0;

            if (!hasFamily) {
                return interaction.reply({
                    content: `❌ No tienes una familia registrada para personalizar.`,
                    flags: MessageFlags.Ephemeral
                });
            }

            family.userId = targetUser.id;
            family.rootUser = targetUser;

            await interaction.deferReply({ ephemeral: false });

            if (!family.settings) family.settings = {};
            if (!family.settings.userBg) family.settings.userBg = '#1d4ed8';
            if (!family.settings.userText) family.settings.userText = '#ffffff';
            if (!family.settings.nodeBg) family.settings.nodeBg = '#111111';
            if (!family.settings.nodeText) family.settings.nodeText = '#ffffff';
            if (!family.settings.lineColor) family.settings.lineColor = '#000000';
            if (!family.settings.bg) family.settings.bg = '#ffffff';
            if (!family.settings.direction) family.settings.direction = 'TB';

            const generateTreePayload = async () => {
                const imageBuffer = await renderFamilyTree(interaction.guild, family);
                const attachment = new AttachmentBuilder(imageBuffer, { name: 'arbol-familiar.png' });

                const isVertical = family.settings.direction === 'TB';

                const btnColors = new ButtonBuilder()
                    .setCustomId('ctree_btn_colors')
                    .setLabel('🎨 Cambiar Colores (#HEX)')
                    .setStyle(ButtonStyle.Primary);

                const btnDirection = new ButtonBuilder()
                    .setCustomId('ctree_btn_direction')
                    .setLabel(`🧭 Dirección: ${isVertical ? 'Vertical (Arriba a Abajo)' : 'Horizontal (Izquierda a Derecha)'}`)
                    .setStyle(ButtonStyle.Secondary);

                const rowButtons = new ActionRowBuilder().addComponents(btnColors, btnDirection);

                const contentText = 
`🎨 **Personalización del Árbol Familiar**
Configura los colores y la dirección con la que se generará tu árbol.

👤 **Tu Caja (Fondo):** \`${family.settings.userBg}\`
📝 **Tu Texto:** \`${family.settings.userText}\`
👥 **Cajas Familiares:** \`${family.settings.nodeBg}\`
📄 **Texto Familiar:** \`${family.settings.nodeText}\`
✏️ **Líneas de Unión:** \`${family.settings.lineColor}\`
🖼️ **Fondo del Canvas:** \`${family.settings.bg}\`
🧭 **Dirección del Árbol:** \`${isVertical ? 'Vertical (Arriba a Abajo)' : 'Horizontal (Izquierda a Derecha)'}\``;

                return {
                    content: contentText,
                    files: [attachment],
                    components: [rowButtons]
                };
            };

            const initialPayload = await generateTreePayload();
            const responseMessage = await interaction.editReply(initialPayload);

            const filter = i => i.customId.startsWith('ctree_');
            const collector = responseMessage.createMessageComponentCollector({
                filter,
                time: 300000 
            });

            collector.on('collect', async (i) => {
                if (i.user.id !== targetUser.id) {
                    return i.reply({ content: '❌ Solo el dueño del árbol puede editarlo.', flags: MessageFlags.Ephemeral });
                }

                if (i.customId === 'ctree_btn_direction') {
                    family.settings.direction = family.settings.direction === 'TB' ? 'LR' : 'TB';
                    const updatedPayload = await generateTreePayload();
                    await i.update(updatedPayload);
                }

                if (i.customId === 'ctree_btn_colors') {
                    const modal = new ModalBuilder()
                        .setCustomId('ctree_modal_all_colors')
                        .setTitle('Ajustar Colores (#HEX)');

                    const inputUserBg = new TextInputBuilder()
                        .setCustomId('in_userBg')
                        .setLabel('Tu Caja (Fondo)')
                        .setStyle(TextInputStyle.Short)
                        .setValue(family.settings.userBg)
                        .setMaxLength(7)
                        .setRequired(true);

                    const inputUserText = new TextInputBuilder()
                        .setCustomId('in_userText')
                        .setLabel('Tu Texto')
                        .setStyle(TextInputStyle.Short)
                        .setValue(family.settings.userText)
                        .setMaxLength(7)
                        .setRequired(true);

                    const inputNodeBg = new TextInputBuilder()
                        .setCustomId('in_nodeBg')
                        .setLabel('Cajas Familiares (Fondo)')
                        .setStyle(TextInputStyle.Short)
                        .setValue(family.settings.nodeBg)
                        .setMaxLength(7)
                        .setRequired(true);

                    const inputNodeText = new TextInputBuilder()
                        .setCustomId('in_nodeText')
                        .setLabel('Texto Familiar')
                        .setStyle(TextInputStyle.Short)
                        .setValue(family.settings.nodeText)
                        .setMaxLength(7)
                        .setRequired(true);

                    const inputLineColor = new TextInputBuilder()
                        .setCustomId('in_lineColor')
                        .setLabel('Líneas de Unión')
                        .setStyle(TextInputStyle.Short)
                        .setValue(family.settings.lineColor)
                        .setMaxLength(7)
                        .setRequired(true);

                    modal.addComponents(
                        new ActionRowBuilder().addComponents(inputUserBg),
                        new ActionRowBuilder().addComponents(inputUserText),
                        new ActionRowBuilder().addComponents(inputNodeBg),
                        new ActionRowBuilder().addComponents(inputNodeText),
                        new ActionRowBuilder().addComponents(inputLineColor)
                    );

                    await i.showModal(modal);

                    try {
                        const modalSubmit = await i.awaitModalSubmit({ 
                            filter: m => m.customId === 'ctree_modal_all_colors' && m.user.id === targetUser.id,
                            time: 60000 
                        });

                        const hexRegex = /^#([0-9A-F]{3}){1,2}$/i;

                        const newUbg = modalSubmit.fields.getTextInputValue('in_userBg');
                        const newUtxt = modalSubmit.fields.getTextInputValue('in_userText');
                        const newNbg = modalSubmit.fields.getTextInputValue('in_nodeBg');
                        const newNtxt = modalSubmit.fields.getTextInputValue('in_nodeText');
                        const newLcol = modalSubmit.fields.getTextInputValue('in_lineColor');

                        if (hexRegex.test(newUbg)) family.settings.userBg = newUbg;
                        if (hexRegex.test(newUtxt)) family.settings.userText = newUtxt;
                        if (hexRegex.test(newNbg)) family.settings.nodeBg = newNbg;
                        if (hexRegex.test(newNtxt)) family.settings.nodeText = newNtxt;
                        if (hexRegex.test(newLcol)) family.settings.lineColor = newLcol;

                        const updatedPayload = await generateTreePayload();
                        await modalSubmit.update(updatedPayload);
                    } catch (err) {}
                }
            });

            collector.on('end', async () => {
                try {
                    await interaction.editReply({ components: [] });
                } catch (e) {}
            });

        } catch (error) {
            console.error("ERROR EN CUSTOMIZETREE:", error);
            if (interaction.deferred) {
                await interaction.editReply({ content: "❌ Error personalizando el árbol: " + error.message });
            } else {
                await interaction.reply({ content: "❌ Error personalizando el árbol: " + error.message, flags: MessageFlags.Ephemeral });
            }
        }
    }
};
