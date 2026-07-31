import { 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle, 
    AttachmentBuilder 
} from 'discord.js';

// Usamos las utilidades internas del sistema de árbol que ya existen en tu proyecto
import { buildTreeLayout } from '../../family/utils/treeLayout.js';
import { getTreeSettings, updateTreeSettings } from '../../family/utils/treeSettings.js';
import { renderTreeCanvas } from '../../family/utils/treeRenderer.js';
import { getFamily } from '../../utils/families.js';

export default {
    name: 'customizetree',
    description: 'Personaliza los colores del árbol genealógico en vivo',
    
    async execute(interaction) {
        // 1. Respuesta pública (NO ephemeral) para que todos la vean en el chat
        await interaction.deferReply({ ephemeral: false });

        const userId = interaction.user.id;
        const guild = interaction.guild;

        // Función que genera la imagen actualizada y los controles
        const generateTreeResponse = async () => {
            const family = await getFamily(userId);
            const settings = await getTreeSettings(userId);
            
            // Construir el layout y renderizar el Canvas
            const layout = await buildTreeLayout(family, guild, settings);
            const imageBuffer = await renderTreeCanvas(layout, settings);
            
            const attachment = new AttachmentBuilder(imageBuffer, { name: 'family-tree.png' });

            // Ruleta / Menú desplegable de colores predefinidos
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

            // Botón para introducir un código HEX manual (#ffffff)
            const customHexButton = new ButtonBuilder()
                .setCustomId('btn_custom_hex')
                .setLabel('Escribir código #HEX')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🖌️');

            const row1 = new ActionRowBuilder().addComponents(colorSelectMenu);
            const row2 = new ActionRowBuilder().addComponents(customHexButton);

            return {
                content: `✨ **Personalizando el árbol genealógico de <@${userId}>**:`,
                files: [attachment],
                components: [row1, row2]
            };
        };

        // Renderizado inicial
        const initialPayload = await generateTreeResponse();
        const responseMessage = await interaction.editReply(initialPayload);

        // 2. Mantener la sesión activa de personalización (5 minutos)
        const collector = responseMessage.createMessageComponentCollector({
            time: 300000 
        });

        collector.on('collect', async (i) => {
            // Solo el dueño del árbol puede modificar los colores
            if (i.user.id !== userId) {
                return i.reply({ content: '❌ Solo el dueño del árbol puede personalizarlo.', ephemeral: true });
            }

            // A) Cambio directo mediante la Ruleta / Selector de Colores
            if (i.customId === 'select_tree_color') {
                const selectedColor = i.values[0];
                await updateTreeSettings(userId, { userBg: selectedColor });

                // Actualizar la imagen al instante sin cerrar el menú
                const updatedPayload = await generateTreeResponse();
                await i.update(updatedPayload);
            }

            // B) Código Hexadecimal personalizado mediante un Modal
            if (i.customId === 'btn_custom_hex') {
                const modal = new ModalBuilder()
                    .setCustomId('modal_hex_input')
                    .setTitle('Color Personalizado (#HEX)');

                const hexInput = new TextInputBuilder()
                    .setCustomId('hex_value')
                    .setLabel('Código Hexadecimal (Ej: #ff5500 o #ffffff)')
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
                        await updateTreeSettings(userId, { userBg: hexColor });

                        const updatedPayload = await generateTreeResponse();
                        await modalSubmit.update(updatedPayload);
                    } else {
                        await modalSubmit.reply({ content: '❌ Código Hex inválido. Ejemplo válido: `#ff0000`', ephemeral: true });
                    }
                } catch (err) {
                    // Tiempo de espera agotado en el modal
                }
            }
        });

        collector.on('end', async () => {
            try {
                // Quitar botones al vencer el tiempo para evitar spam
                await interaction.editReply({ components: [] });
            } catch (e) {}
        });
    }
};
