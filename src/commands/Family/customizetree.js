import { 
    SlashCommandBuilder, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
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
        .setDescription('Personaliza los colores de tu árbol genealógico en vivo.'),

    async execute(interaction) {
        try {
            const targetUser = interaction.user;

            // 1. Cargar la familia con tus datos reales
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
                    ephemeral: true
                });
            }

            family.userId = targetUser.id;
            family.rootUser = targetUser;

            // 2. Respuesta pública (NO ephemeral)
            await interaction.deferReply({ ephemeral: false });

            // Inicializar las configuraciones personalizadas del usuario si no existen
            if (!family.settings) family.settings = {};

            // Función para re-renderizar la imagen y los controles
            const generateTreePayload = async () => {
                const imageBuffer = await renderFamilyTree(interaction.guild, family);
                const attachment = new AttachmentBuilder(imageBuffer, { name: 'arbol-familiar.png' });

                // Menú "Ruleta / Paleta" de colores
                const colorSelectMenu = new StringSelectMenuBuilder()
                    .setCustomId('select_tree_color')
                    .setPlaceholder('🎨 Selecciona un color para tus tarjetas...')
                    .addOptions([
                        { label: 'Azul Real', value: '#1d4ed8', emoji: '🟦' },
                        { label: 'Rojo Carmesí', value: '#dc2626', emoji: '🟥' },
                        { label: 'Verde Esmeralda', value: '#10b981', emoji: '🟩' },
                        { label: 'Morado Neón', value: '#8b5cf6', emoji: '🟪' },
                        { label: 'Rosa Pastel', value: '#f472b6', emoji: '🌸' },
                        { label: 'Dorado / Oro', value: '#f59e0b', emoji: '🟧' },
                        { label: 'Oscuro Elegante', value: '#111111', emoji: '⬛' }
                    ]);

                // Botón para código HEX manual
                const customHexButton = new ButtonBuilder()
                    .setCustomId('btn_custom_hex')
                    .setLabel('Escribir código #HEX')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🖌️');

                const row1 = new ActionRowBuilder().addComponents(colorSelectMenu);
                const row2 = new ActionRowBuilder().addComponents(customHexButton);

                return {
                    content: `✨ **Personalizando el árbol genealógico de <@${targetUser.id}>**:`,
                    files: [attachment],
                    components: [row1, row2]
                };
            };

            // Renderizado inicial
            const initialPayload = await generateTreePayload();
            const responseMessage = await interaction.editReply(initialPayload);

            // 3. Coleccionista para mantener la sesión abierta durante 5 minutos
            const collector = responseMessage.createMessageComponentCollector({
                time: 300000 
            });

            collector.on('collect', async (i) => {
                // Verificar que solo el dueño del árbol use la interfaz
                if (i.user.id !== targetUser.id) {
                    return i.reply({ content: '❌ Solo el dueño del árbol puede cambiar los colores.', ephemeral: true });
                }

                // Opción A: Selección por menú desplegable (Ruleta)
                if (i.customId === 'select_tree_color') {
                    const selectedColor = i.values[0];
                    family.settings.userBg = selectedColor;

                    const updatedPayload = await generateTreePayload();
                    await i.update(updatedPayload);
                }

                // Opción B: Código Hexadecimal manual por Modal (#ffffff)
                if (i.customId === 'btn_custom_hex') {
                    const modal = new ModalBuilder()
                        .setCustomId('modal_hex_input')
                        .setTitle('Color Personalizado (#HEX)');

                    const hexInput = new TextInputBuilder()
                        .setCustomId('hex_value')
                        .setLabel('Código Hexadecimal (Ej: #ff5500)')
                        .setStyle(TextInputStyle.Short)
                        .setPlaceholder('#1d4ed8')
                        .setMaxLength(7)
                        .setMinLength(4)
                        .setRequired(true);

                    modal.addComponents(new ActionRowBuilder().addComponents(hexInput));
                    await i.showModal(modal);

                    try {
                        const modalSubmit = await i.awaitModalSubmit({ time: 60000 });
                        const hexColor = modalSubmit.fields.getTextInputValue('hex_value');

                        if (/^#([0-9A-F]{3}){1,2}$/i.test(hexColor)) {
                            family.settings.userBg = hexColor;

                            const updatedPayload = await generateTreePayload();
                            await modalSubmit.update(updatedPayload);
                        } else {
                            await modalSubmit.reply({ content: '❌ Código Hex inválido. Ejemplo: `#ff0000`', ephemeral: true });
                        }
                    } catch (err) {
                        // Tiempo agotado en el modal
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
