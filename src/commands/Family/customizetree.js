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

// ⚠️ Cambia esta ruta si tu comando principal de árbol se llama diferente (ej: './tree.js' o './familytree.js')
import { renderTree } from './tree.js'; 
import { getFamily, updateTreeSettings } from '../../utils/families.js';

export default {
    name: 'customizetree',
    description: 'Personaliza los colores del árbol genealógico en vivo',
    
    async execute(interaction) {
        // Respuesta pública (NO ephemeral) para que lo vean todos
        await interaction.deferReply({ ephemeral: false });

        const userId = interaction.user.id;
        const guild = interaction.guild;

        // Función que regenera la imagen y la interfaz
        const generateTreeResponse = async () => {
            const family = await getFamily(userId);
            
            // Llamamos a la función de renderizado principal
            const imageBuffer = await renderTree(guild, family, userId);
            const attachment = new AttachmentBuilder(imageBuffer, { name: 'family-tree.png' });

            // Menú "Ruleta / Paleta" de colores
            const colorSelectMenu = new StringSelectMenuBuilder()
                .setCustomId('select_tree_color')
                .setPlaceholder('🎨 Selecciona un color para tu tarjeta...')
                .addOptions([
                    { label: 'Azul Real', value: '#1d4ed8', emoji: '🟦' },
                    { label: 'Rojo Carmesí', value: '#dc2626', emoji: '🟥' },
                    { label: 'Verde Esmeralda', value: '#10b981', emoji: '🟩' },
                    { label: 'Morado Neón', value: '#8b5cf6', emoji: '🟪' },
                    { label: 'Rosa Pastel', value: '#f472b6', emoji: '🌸' },
                    { label: 'Dorado / Oro', value: '#f59e0b', emoji: '🟧' },
                    { label: 'Oscuro Elegante', value: '#111111', emoji: '⬛' }
                ]);

            // Botón código HEX manual (#ffffff)
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

        // Primera carga
        const initialPayload = await generateTreeResponse();
        const responseMessage = await interaction.editReply(initialPayload);

        // Mantenemos activo el menú por 5 minutos
        const collector = responseMessage.createMessageComponentCollector({
            time: 300000 
        });

        collector.on('collect', async (i) => {
            if (i.user.id !== userId) {
                return i.reply({ content: '❌ Solo el dueño del árbol puede cambiar los colores.', ephemeral: true });
            }

            // Cambiar mediante menú de colores
            if (i.customId === 'select_tree_color') {
                const selectedColor = i.values[0];
                await updateTreeSettings(userId, { userBg: selectedColor });

                const updatedPayload = await generateTreeResponse();
                await i.update(updatedPayload);
            }

            // Cambiar mediante código HEX manual
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
                        await updateTreeSettings(userId, { userBg: hexColor });

                        const updatedPayload = await generateTreeResponse();
                        await modalSubmit.update(updatedPayload);
                    } else {
                        await modalSubmit.reply({ content: '❌ Código Hex inválido.', ephemeral: true });
                    }
                } catch (err) {}
            }
        });

        collector.on('end', async () => {
            try {
                await interaction.editReply({ components: [] });
            } catch (e) {}
        });
    }
};
