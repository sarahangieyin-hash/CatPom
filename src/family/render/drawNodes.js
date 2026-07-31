import { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ModalBuilder, 
    TextInputBuilder, 
    TextInputStyle,
    MessageFlags 
} from 'discord.js';

import { getTreeSettings, saveTreeSettings, DEFAULT_TREE_SETTINGS } from '../../utils/families.js';

export default {
    data: new SlashCommandBuilder()
        .setName('customizetree')
        .setDescription('Personaliza la apariencia y dirección de tu árbol familiar.'),

    async execute(interaction) {
        const userId = interaction.user.id;
        let settings = await getTreeSettings(userId);

        const buildEmbed = (st) => {
            return new EmbedBuilder()
                .setTitle('🎨 Personalización del Árbol Familiar')
                .setDescription('Configura los colores y la dirección con la que se generará tu árbol.')
                .addFields(
                    { name: '👤 Tu Caja (Fondo)', value: `\`${st.userBg}\``, inline: true },
                    { name: '✍️ Tu Texto', value: `\`${st.userText}\``, inline: true },
                    { name: '👥 Cajas Familiares', value: `\`${st.nodeBg}\``, inline: true },
                    { name: '📝 Texto Familiar', value: `\`${st.nodeText}\``, inline: true },
                    { name: '🔗 Líneas de Unión', value: `\`${st.lines}\``, inline: true },
                    { name: '🖼️ Fondo del Canvas', value: `\`${st.background}\``, inline: true },
                    { name: '📐 Dirección del Árbol', value: st.direction === 'TB' ? '⬇️ Vertical (Arriba a Abajo)' : '➡️ Horizontal (Izquierda a Derecha)', inline: false }
                )
                .setColor(st.userBg.startsWith('#') ? st.userBg : '#1d4ed8');
        };

        const buildButtons = (st) => {
            return new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('tree_toggle_direction')
                    .setLabel(`Dirección: ${st.direction === 'TB' ? 'Vertical ⬇️' : 'Horizontal ➡️'}`)
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('tree_edit_colors')
                    .setLabel('Editar Colores 🎨')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('tree_reset')
                    .setLabel('Restablecer 🔄')
                    .setStyle(ButtonStyle.Danger)
            );
        };

        const response = await interaction.reply({
            embeds: [buildEmbed(settings)],
            components: [buildButtons(settings)],
            flags: MessageFlags.Ephemeral
        });

        // Colector para los botones del panel
        const collector = response.createMessageComponentCollector({ time: 120000 });

        collector.on('collect', async (i) => {
            if (i.customId === 'tree_toggle_direction') {
                const newDirection = settings.direction === 'TB' ? 'LR' : 'TB';
                settings.direction = newDirection;
                await saveTreeSettings(userId, { direction: newDirection });

                await i.update({
                    embeds: [buildEmbed(settings)],
                    components: [buildButtons(settings)]
                });
            } else if (i.customId === 'tree_reset') {
                settings = { ...DEFAULT_TREE_SETTINGS };
                await saveTreeSettings(userId, settings);

                await i.update({
                    embeds: [buildEmbed(settings)],
                    components: [buildButtons(settings)]
                });
            } else if (i.customId === 'tree_edit_colors') {
                // Desplegar Modal para ingresar códigos HEX
                const modal = new ModalBuilder()
                    .setCustomId('tree_colors_modal')
                    .setTitle('Personalizar Colores (Códigos HEX)');

                const userInput = new TextInputBuilder()
                    .setCustomId('userBg')
                    .setLabel('Tu Caja y Tu Texto (ej: #1d4ed8, #ffffff)')
                    .setValue(`${settings.userBg}, ${settings.userText}`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const nodeInput = new TextInputBuilder()
                    .setCustomId('nodeBg')
                    .setLabel('Cajas Usuarios y Texto (ej: #111111, #ffffff)')
                    .setValue(`${settings.nodeBg}, ${settings.nodeText}`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                const linesInput = new TextInputBuilder()
                    .setCustomId('lines')
                    .setLabel('Líneas y Fondo (ej: #000000, #ffffff)')
                    .setValue(`${settings.lines}, ${settings.background}`)
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true);

                modal.addComponents(
                    new ActionRowBuilder().addComponents(userInput),
                    new ActionRowBuilder().addComponents(nodeInput),
                    new ActionRowBuilder().addComponents(linesInput)
                );

                await i.showModal(modal);

                // Esperar envío del modal
                try {
                    const modalSubmit = await i.awaitModalSubmit({ time: 60000 });

                    const [uBg, uText] = modalSubmit.fields.getTextInputValue('userBg').split(',').map(s => s.trim());
                    const [nBg, nText] = modalSubmit.fields.getTextInputValue('nodeBg').split(',').map(s => s.trim());
                    const [lColor, bColor] = modalSubmit.fields.getTextInputValue('lines').split(',').map(s => s.trim());

                    if (uBg) settings.userBg = uBg;
                    if (uText) settings.userText = uText;
                    if (nBg) settings.nodeBg = nBg;
                    if (nText) settings.nodeText = nText;
                    if (lColor) settings.lines = lColor;
                    if (bColor) settings.background = bColor;

                    await saveTreeSettings(userId, settings);

                    await modalSubmit.update({
                        embeds: [buildEmbed(settings)],
                        components: [buildButtons(settings)]
                    });
                } catch {}
            }
        });
    }
};
