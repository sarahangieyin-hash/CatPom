import { 
    SlashCommandBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle,
    AttachmentBuilder 
} from 'discord.js';

import { getUserFamilyData } from '../../utils/families.js';
import { renderFamilyTree } from '../../family/render/treeRenderer.js';

export default {
    data: new SlashCommandBuilder()
        .setName('customizetree')
        .setDescription('Ajusta el color exacto de tu tarjeta, familiares, líneas y fondo.'),

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
                    ephemeral: true
                });
            }

            family.userId = targetUser.id;
            family.rootUser = targetUser;

            await interaction.deferReply({ ephemeral: false });

            if (!family.settings) family.settings = {};

            // Valores por defecto si no existen
            if (!family.settings.userBg) family.settings.userBg = '#1d4ed8';
            if (!family.settings.nodeBg) family.settings.nodeBg = '#111111';
            if (!family.settings.lineColor) family.settings.lineColor = '#ffffff';
            if (!family.settings.bg) family.settings.bg = '#0d0f12';

            // Elemento activo
            let activeTarget = 'userBg';

            const targetLabels = {
                'userBg': 'Mi Tarjeta',
                'nodeBg': 'Otras Tarjetas',
                'lineColor': 'Líneas y Bordes',
                'bg': 'Fondo'
            };

            const generateTreePayload = async () => {
                const imageBuffer = await renderFamilyTree(interaction.guild, family);
                const attachment = new AttachmentBuilder(imageBuffer, { name: 'arbol-familiar.png' });

                // Botones para elegir qué elemento modificar
                const btnUser = new ButtonBuilder()
                    .setCustomId('target_userBg')
                    .setLabel('Mi Tarjeta')
                    .setStyle(activeTarget === 'userBg' ? ButtonStyle.Primary : ButtonStyle.Secondary);

                const btnOthers = new ButtonBuilder()
                    .setCustomId('target_nodeBg')
                    .setLabel('Otras Tarjetas')
                    .setStyle(activeTarget === 'nodeBg' ? ButtonStyle.Primary : ButtonStyle.Secondary);

                const btnLines = new ButtonBuilder()
                    .setCustomId('target_lineColor')
                    .setLabel('Líneas/Bordes')
                    .setStyle(activeTarget === 'lineColor' ? ButtonStyle.Primary : ButtonStyle.Secondary);

                const btnBg = new ButtonBuilder()
                    .setCustomId('target_bg')
                    .setLabel('Fondo')
                    .setStyle(activeTarget === 'bg' ? ButtonStyle.Primary : ButtonStyle.Secondary);

                // Botón para cambiar el valor/color exacto del objetivo seleccionado
                const btnSetColor = new ButtonBuilder()
                    .setCustomId('btn_open_color_picker')
                    .setLabel(`🎚️ Ajustar Color de: ${targetLabels[activeTarget]}`)
                    .setStyle(ButtonStyle.Success);

                const row1 = new ActionRowBuilder().addComponents(btnUser, btnOthers, btnLines, btnBg);
                const row2 = new ActionRowBuilder().addComponents(btnSetColor);

                const currentColor = family.settings[activeTarget];

                return {
                    content: `🎚️ **Modificando:** \`${targetLabels[activeTarget]}\` | **Color Actual:** \`${currentColor}\``,
                    files: [attachment],
                    components: [row1, row2]
                };
            };

            const initialPayload = await generateTreePayload();
            const responseMessage = await interaction.editReply(initialPayload);

            const collector = responseMessage.createMessageComponentCollector({
                time: 300000 
            });

            collector.on('collect', async (i) => {
                if (i.user.id !== targetUser.id) {
                    return i.reply({ content: '❌ Solo el dueño del árbol puede editarlo.', ephemeral: true });
                }

                // Cambiar el objetivo a editar
                if (i.customId.startsWith('target_')) {
                    activeTarget = i.customId.replace('target_', '');
                    const updatedPayload = await generateTreePayload();
                    await i.update(updatedPayload);
                }

                // Abrir la entrada para cambiar el valor/tono exacto
                if (i.customId === 'btn_open_color_picker') {
                    const modal = new ModalBuilder()
                        .setCustomId('modal_color_picker')
                        .setTitle(`Color para ${targetLabels[activeTarget]}`);

                    const currentColor = family.settings[activeTarget] || '#111111';

                    const colorInput = new TextInputBuilder()
                        .setCustomId('input_color_val')
                        .setLabel(`Código de color HEX (Actual: ${currentColor})`)
                        .setStyle(TextInputStyle.Short)
                        .setValue(currentColor)
                        .setPlaceholder('#000000')
                        .setMaxLength(7)
                        .setMinLength(4)
                        .setRequired(true);

                    modal.addComponents(new ActionRowBuilder().addComponents(colorInput));
                    await i.showModal(modal);

                    try {
                        const modalSubmit = await i.awaitModalSubmit({ time: 60000 });
                        const newColor = modalSubmit.fields.getTextInputValue('input_color_val');

                        if (/^#([0-9A-F]{3}){1,2}$/i.test(newColor)) {
                            family.settings[activeTarget] = newColor;

                            const updatedPayload = await generateTreePayload();
                            await modalSubmit.update(updatedPayload);
                        } else {
                            await modalSubmit.reply({ content: '❌ Código de color inválido (ejemplo correcto: `#1a1a1a`).', ephemeral: true });
                        }
                    } catch (err) {
                        // Timeout
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
                await interaction.reply({ content: "❌ Error personalizando el árbol: " + error.message, ephemeral: true });
            }
        }
    }
};
