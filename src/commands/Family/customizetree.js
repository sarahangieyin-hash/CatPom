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
import { renderFamilyTree } from './treeRenderer.js';
import { getFamily, updateTreeSettings } from '../../utils/families.js';

export async function handleCustomizeCommand(interaction) {
    // 1. IMPORTANTE: Responder de forma pública (NO ephemeral)
    await interaction.deferReply({ ephemeral: false });

    const userId = interaction.user.id;
    let family = await getFamily(userId);

    // Función auxiliar para generar la imagen y la interfaz
    const generateTreeResponse = async () => {
        const imageBuffer = await renderFamilyTree(interaction.guild, family);
        const attachment = new AttachmentBuilder(imageBuffer, { name: 'family-tree.png' });

        // Menú selector estilo "Ruleta / Paleta de Colores"
        const colorSelectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_tree_color')
            .setPlaceholder('🎨 Selecciona un color de la paleta...')
            .addOptions([
                { label: 'Azul Real', value: '#1d4ed8', emoji: '🟦' },
                { label: 'Rojo Carmesí', value: '#dc2626', emoji: '🟥' },
                { label: 'Verde Esmeralda', value: '#10b981', emoji: '🟩' },
                { label: 'Morado Neón', value: '#8b5cf6', emoji: '🟪' },
                { label: 'Rosa Pastel', value: '#f472b6', emoji: '🌸' },
                { label: 'Dorado / Oro', value: '#f59e0b', emoji: '🟧' },
                { label: 'Oscuro Elegante', value: '#111111', emoji: '⬛' },
            ]);

        // Botón para meter un Hex personalizado (#ffffff, etc.)
        const customHexButton = new ButtonBuilder()
            .setCustomId('btn_custom_hex')
            .setLabel('Escribir código #HEX')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🖌️');

        const row1 = new ActionRowBuilder().addComponents(colorSelectMenu);
        const row2 = new ActionRowBuilder().addComponents(customHexButton);

        return {
            content: `✨ **Personalizando el árbol de <@${userId}>** (Cualquiera en el canal puede ver los cambios):`,
            files: [attachment],
            components: [row1, row2]
        };
    };

    // Renderizar por primera vez
    const initialPayload = await generateTreeResponse();
    const responseMessage = await interaction.editReply(initialPayload);

    // 2. Crear coleccionista para mantener la sesión abierta
    const collector = responseMessage.createMessageComponentCollector({
        time: 300000 // Mantener activo durante 5 minutos
    });

    collector.on('collect', async (i) => {
        // Asegurar que solo el dueño del árbol cambie las configuraciones
        if (i.user.id !== userId) {
            return i.reply({ content: '❌ Solo el dueño del árbol puede cambiar los colores.', ephemeral: true });
        }

        // A) Si seleccionó un color del menú desplegable ("ruleta")
        if (i.customId === 'select_tree_color') {
            const selectedColor = i.values[0];
            
            // Guardar color en DB
            await updateTreeSettings(userId, { userBg: selectedColor });
            family = await getFamily(userId); // Recargar datos

            // Actualizar el mensaje con la nueva imagen de inmediato SIN cerrar el menú
            const updatedPayload = await generateTreeResponse();
            await i.update(updatedPayload);
        }

        // B) Si hace clic en introducir código HEX manual (#ffffff)
        if (i.customId === 'btn_custom_hex') {
            const modal = new ModalBuilder()
                .setCustomId('modal_hex_input')
                .setTitle('Color Personalizado');

            const hexInput = new TextInputBuilder()
                .setCustomId('hex_value')
                .setLabel('Código Hexadecimal (Ej: #ff5500)')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('#ffffff')
                .setMaxLength(7)
                .setMinLength(4)
                .setRequired(true);

            modal.addComponents(new ActionRowBuilder().addComponents(hexInput));
            await i.showModal(modal);

            // Esperar la respuesta del Modal
            try {
                const modalSubmit = await i.awaitModalSubmit({ time: 60000 });
                const hexColor = modalSubmit.fields.getTextInputValue('hex_value');

                if (/^#([0-9A-F]{3}){1,2}$/i.test(hexColor)) {
                    await updateTreeSettings(userId, { userBg: hexColor });
                    family = await getFamily(userId);

                    const updatedPayload = await generateTreeResponse();
                    await modalSubmit.update(updatedPayload);
                } else {
                    await modalSubmit.reply({ content: '❌ Código Hex inválido. Debe ser como `#ff0000` o `#fff`.', ephemeral: true });
                }
            } catch (err) {
                // Tiempo de modal agotado
            }
        }
    });

    collector.on('end', async () => {
        // Deshabilitar botones/menús al terminar el tiempo
        try {
            await interaction.editReply({ components: [] });
        } catch (e) {}
    });
}
