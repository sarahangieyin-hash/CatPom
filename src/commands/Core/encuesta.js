import { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    PermissionFlagsBits 
} from 'discord.js';

// Función para transformar formatos como 1h, 30m, 45s, 1h30m a milisegundos
function parseDuration(timeStr) {
    if (!timeStr) return null;
    const regex = /(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/i;
    const match = timeStr.match(regex);
    if (!match || (!match[1] && !match[2] && !match[3])) return null;

    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;

    const totalMs = (hours * 3600 + minutes * 60 + seconds) * 1000;
    return totalMs > 0 ? totalMs : null;
}

export default {
    data: new SlashCommandBuilder()
        .setName('encuesta')
        .setDescription('Crea una encuesta con rol permitido, tiempo límite flexible y botones')
        .addStringOption(o =>
            o.setName('pregunta')
                .setDescription('La pregunta de la encuesta')
                .setRequired(true)
        )
        .addRoleOption(o =>
            o.setName('rol_permitido')
                .setDescription('El único rol que podrá votar')
                .setRequired(true)
        )
        .addStringOption(o =>
            o.setName('opciones')
                .setDescription('Opciones separadas por comas (Ej: Sí, No)')
                .setRequired(true)
        )
        .addStringOption(o =>
            o.setName('tiempo')
                .setDescription('Tiempo de cierre (Ej: 1h, 30m, 45s, 1h30m)')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction, client) {
        await interaction.deferReply({ flags: 64 });

        const pregunta = interaction.options.getString('pregunta');
        const rolPermitido = interaction.options.getRole('rol_permitido');
        const opcionesTexto = interaction.options.getString('opciones');
        const tiempoTexto = interaction.options.getString('tiempo');

        const opciones = opcionesTexto.split(',').map(o => o.trim()).filter(Boolean);

        if (opciones.length < 2 || opciones.length > 5) {
            return interaction.editReply('❌ Debes proporcionar entre **2 y 5 opciones** separadas por comas.');
        }

        let footerText = `Creada por ${interaction.user.tag} (${interaction.user.id})`;
        let cierreMs = parseDuration(tiempoTexto);
        let cierreTimestamp = null;

        if (cierreMs) {
            cierreTimestamp = Date.now() + cierreMs;
            footerText += ` • Cierra: <t:${Math.floor(cierreTimestamp / 1000)}:f>`;
        } else if (tiempoTexto) {
            return interaction.editReply('❌ Formato de tiempo inválido. Usa ejemplos como: `1h`, `30m`, `45s` o `1h30m`.');
        }

        const embed = new EmbedBuilder()
            .setTitle('📊 Nueva Encuesta')
            .setColor('#3498DB')
            .setDescription(`**${pregunta}**\n\n🔒 **Rol autorizado:** ${rolPermitido}\n\n` + opciones.map((op, i) => `🔹 **Opción ${i + 1}:** ${op} (0 votos)`).join('\n'))
            .setFooter({ text: footerText })
            .setTimestamp();

        const voteButtons = opciones.map((op, i) => {
            return new ButtonBuilder()
                .setCustomId(`poll_${rolPermitido.id}_${i}`)
                .setLabel(op.length > 80 ? op.substring(0, 77) + '...' : op)
                .setStyle(ButtonStyle.Primary);
        });
        const rowVotes = new ActionRowBuilder().addComponents(voteButtons);

        const closeButton = new ButtonBuilder()
            .setCustomId('poll_close')
            .setLabel('🔒 Cerrar Encuesta')
            .setStyle(ButtonStyle.Danger);

        const checkButton = new ButtonBuilder()
            .setCustomId('poll_check')
            .setLabel('📋 Revisar Votos')
            .setStyle(ButtonStyle.Secondary);

        const rowControl = new ActionRowBuilder().addComponents(closeButton, checkButton);

        const message = await interaction.channel.send({
            embeds: [embed],
            components: [rowVotes, rowControl]
        });

        await interaction.editReply(`✅ Encuesta creada con éxito.`);

        if (cierreTimestamp) {
            setTimeout(async () => {
                try {
                    const fetchedMessage = await message.channel.messages.fetch(message.id).catch(() => null);
                    if (!fetchedMessage) return;

                    const currentEmbed = fetchedMessage.embeds[0];
                    if (!currentEmbed || currentEmbed.title.includes('Finalizada')) return;

                    const disabledRows = fetchedMessage.components.map(row => {
                        const newRow = ActionRowBuilder.from(row);
                        newRow.components.forEach(btn => btn.setDisabled(true));
                        return newRow;
                    });

                    const closedEmbed = EmbedBuilder.from(currentEmbed)
                        .setTitle('📊 Encuesta Finalizada (Cierre Automático)')
                        .setColor('#E74C3C');

                    await fetchedMessage.edit({
                        embeds: [closedEmbed],
                        components: disabledRows
                    });
                } catch (err) {
                    console.error('Error al cerrar la encuesta automáticamente:', err);
                }
            }, cierreMs);
        }
    }
};
