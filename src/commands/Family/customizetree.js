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
        .setDescription('Personaliza colores, formas y estilo de líneas de tu árbol familiar.'),

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
                    content: `❌ No tienes una familia registrada.`,
                    flags: MessageFlags.Ephemeral
                });
            }

            family.userId = targetUser.id;
            family.rootUser = targetUser;

            await interaction.deferReply({ ephemeral: false });

            // Inicializar configuraciones por defecto si no existen
            if (!family.settings) family.settings = {};
            if (!family.settings.userBg) family.settings.userBg = '#1d4ed8';
            if (!family.settings.nodeBg) family.settings.nodeBg = '#111111';
            if (!family.settings.lineColor) family.settings.lineColor = '#ffffff';
            if (!family.settings.bg) family.settings.bg = '#0d0f12';
            if (!family.settings.textColor) family.settings.textColor = '#ffffff';
            if (!family.settings.lineStyle) family.settings.lineStyle = 'curved'; // 'curved' | 'straight'
            if (!family.settings.cardShape) family.settings.cardShape = 'rounded'; // 'rounded' | 'square' | 'circle'

            // Pestaña activa por defecto
            let activeTab = 'userCard'; 

            const generateTreePayload = async () => {
                const imageBuffer = await renderFamilyTree(interaction.guild, family);
                const attachment = new AttachmentBuilder(imageBuffer, { name: 'arbol-familiar.png' });

                // Row 1: Pestañas de Selección
                const btnTabUser = new ButtonBuilder()
                    .setCustomId('ctree_tab_userCard')
                    .setLabel('Mi Tarjeta')
                    .setStyle(activeTab === 'userCard' ? ButtonStyle.Primary : ButtonStyle.Secondary);

                const btnTabOthers = new ButtonBuilder()
                    .setCustomId('ctree_tab_otherCards')
                    .setLabel('Otras Tarjetas')
                    .setStyle(activeTab === 'otherCards' ? ButtonStyle.Primary : ButtonStyle.Secondary);

                const btnTabLines = new ButtonBuilder()
                    .setCustomId('ctree_tab_lines')
                    .setLabel('Líneas/Bordes')
                    .setStyle(activeTab === 'lines' ? ButtonStyle.Primary : ButtonStyle.Secondary);

                const btnTabBg = new ButtonBuilder()
                    .setCustomId('ctree_tab_bg')
                    .setLabel('Fondo')
                    .setStyle(activeTab === 'bg' ? ButtonStyle.Primary : ButtonStyle.Secondary);

                const btnTabNames = new ButtonBuilder()
                    .setCustomId('ctree_tab_names')
                    .setLabel('Nombres')
                    .setStyle(activeTab === 'names' ? ButtonStyle.Primary : ButtonStyle.Secondary);

                const rowTabs = new ActionRowBuilder().addComponents(btnTabUser, btnTabOthers, btnTabLines, btnTabBg, btnTabNames);

                // Row 2: Botones de Acción según la pestaña activa
                const actionButtons = [];

                if (activeTab === 'userCard') {
                    actionButtons.push(
                        new ButtonBuilder()
                            .setCustomId('ctree_action_color_userBg')
                            .setLabel(`🎨 Color de Mi Tarjeta (${family.settings.userBg})`)
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId('ctree_action_toggle_shape')
                            .setLabel(`📐 Forma: ${family.settings.cardShape === 'rounded' ? 'Redondeada' : family.settings.cardShape === 'square' ? 'Cuadrada' : 'Circular'}`)
                            .setStyle(ButtonStyle.Secondary)
                    );
                } else if (activeTab === 'otherCards') {
                    actionButtons.push(
                        new ButtonBuilder()
                            .setCustomId('ctree_action_color_nodeBg')
                            .setLabel(`🎨 Color Otras Tarjetas (${family.settings.nodeBg})`)
                            .setStyle(ButtonStyle.Success)
                    );
                } else if (activeTab === 'lines') {
                    actionButtons.push(
                        new ButtonBuilder()
                            .setCustomId('ctree_action_color_lineColor')
                            .setLabel(`🎨 Color de Líneas (${family.settings.lineColor})`)
                            .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                            .setCustomId('ctree_action_toggle_linestyle')
                            .setLabel(`🔀 Estilo: ${family.settings.lineStyle === 'curved' ? 'Curva (Curvy)' : 'Directa (Recta)'}`)
                            .setStyle(ButtonStyle.Secondary)
                    );
                } else if (activeTab === 'bg') {
                    actionButtons.push(
                        new ButtonBuilder()
                            .setCustomId('ctree_action_color_bg')
                            .setLabel(`🎨 Color de Fondo (${family.settings.bg})`)
                            .setStyle(ButtonStyle.Success)
                    );
                } else if (activeTab === 'names') {
                    actionButtons.push(
                        new ButtonBuilder()
                            .setCustomId('ctree_action_color_textColor')
                            .setLabel(`🎨 Color de Nombres (${family.settings.textColor})`)
                            .setStyle(ButtonStyle.Success)
                    );
                }

                const rowActions = new ActionRowBuilder().addComponents(actionButtons);

                return {
                    content: `⚙️ **Ajustes de Árbol Genealógico**`,
                    files: [attachment],
                    components: [rowTabs, rowActions]
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

                // Cambio de Pestañas
                if (i.customId.startsWith('ctree_tab_')) {
                    activeTab = i.customId.replace('ctree_tab_', '');
                    const updatedPayload = await generateTreePayload();
                    await i.update(updatedPayload);
                }

                // Alternar estilo de líneas (Curvas vs Rectas)
                if (i.customId === 'ctree_action_toggle_linestyle') {
                    family.settings.lineStyle = family.settings.lineStyle === 'curved' ? 'straight' : 'curved';
                    const updatedPayload = await generateTreePayload();
                    await i.update(updatedPayload);
                }

                // Alternar forma de las tarjetas (Redondeada -> Cuadrada -> Circular)
                if (i.customId === 'ctree_action_toggle_shape') {
                    const currentShape = family.settings.cardShape;
                    family.settings.cardShape = currentShape === 'rounded' ? 'square' : currentShape === 'square' ? 'circle' : 'rounded';
                    const updatedPayload = await generateTreePayload();
                    await i.update(updatedPayload);
                }

                // Cambiar colores mediante Modal
                if (i.customId.startsWith('ctree_action_color_')) {
                    const targetSetting = i.customId.replace('ctree_action_color_', '');
                    const currentColor = family.settings[targetSetting] || '#ffffff';

                    const modal = new ModalBuilder()
                        .setCustomId('ctree_modal_color')
                        .setTitle('Cambiar Color (#HEX)');

                    const colorInput = new TextInputBuilder()
                        .setCustomId('input_hex')
                        .setLabel(`Código Hexadecimal (Actual: ${currentColor})`)
                        .setStyle(TextInputStyle.Short)
                        .setValue(currentColor)
                        .setMaxLength(7)
                        .setMinLength(4)
                        .setRequired(true);

                    modal.addComponents(new ActionRowBuilder().addComponents(colorInput));
                    await i.showModal(modal);

                    try {
                        const modalSubmit = await i.awaitModalSubmit({ 
                            filter: m => m.customId === 'ctree_modal_color' && m.user.id === targetUser.id,
                            time: 60000 
                        });

                        const newColor = modalSubmit.fields.getTextInputValue('input_hex');

                        if (/^#([0-9A-F]{3}){1,2}$/i.test(newColor)) {
                            family.settings[targetSetting] = newColor;
                            const updatedPayload = await generateTreePayload();
                            await modalSubmit.update(updatedPayload);
                        } else {
                            await modalSubmit.reply({ content: '❌ Código de color inválido. Ejemplo: `#ff0000`', flags: MessageFlags.Ephemeral });
                        }
                    } catch (err) {
                        // Timeout modal
                    }
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
