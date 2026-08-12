import { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    PermissionFlagsBits 
} from 'discord.js';

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
        .setDescription('Crea una encuesta con rol permitido, tiempo límite y hasta 5 fotos opcionales para las opciones')
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
                .setDescription('Opciones separadas por comas (Ej: Terreno A, Terreno B, Terreno C)')
                .setRequired(true)
        )
        .addStringOption(o =>
            o.setName('tiempo')
                .setDescription('Tiempo de cierre (Ej: 1h, 30m, 45s)')
                .setRequired(false)
        )
        .addAttachmentOption(o => o.setName('foto_1').setDescription('Imagen para la Opción 1').setRequired(false))
        .addAttachmentOption(o => o.setName('foto_2').setDescription('Imagen para la Opción 2').setRequired(false))
        .addAttachmentOption(o => o.setName('foto_3').setDescription('Imagen para la Opción 3').setRequired(false))
        .addAttachmentOption(o => o.setName('foto_4').setDescription('Imagen para la Opción 4').setRequired(false))
        .addAttachmentOption(o => o.setName('foto_5').setDescription('Imagen para la Opción 5').setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction, client) {
        await interaction.deferReply({ flags: 64 });

        const pregunta = interaction.options.getString('pregunta');
        const rolPermitido = interaction.options.getRole('rol_permitido');
        const opcionesTexto = interaction.options.getString('opciones');
        const tiempoTexto = interaction.options.getString('tiempo');
        
        const fotos = [
            interaction.options.getAttachment('foto_1'),
            interaction.options.getAttachment('foto_2'),
            interaction.options.getAttachment('foto_3'),
            interaction.options.getAttachment('foto_4'),
            interaction.options.getAttachment('foto_5')
        ].filter(Boolean); // Solo guarda las que el usuario haya subido

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
            return interaction.editReply('❌ Formato de tiempo inválido. Usa ejemplos como: `1h`, `30m`, `45s`.');
        }

        let descripcion = `**${pregunta}**\n\n🔒 **Rol autorizado:** ${rolPermitido}\n\n`;

        opciones.forEach((op, i) => {
            const letra = String.fromCharCode(65 + i); // Convierte 0 en A, 1 en B, 2 en C, etc.
            descripcion += `🔹 **Opción ${letra} (${op}):** 0 votos\n`;
        });

        const embeds = [];

        // Embed Principal con la pregunta y las opciones
        const mainEmbed = new EmbedBuilder()
            .setTitle('📊 Nueva Encuesta de Terrenos / Opciones')
            .setColor('#3498DB')
            .setDescription(descripcion)
            .setFooter({ text: footerText })
            .setTimestamp();

        // Si hay al menos una foto, la ponemos en el embed principal
        if (fotos.length > 0) {
            mainEmbed.setImage(fotos[0].url);
            mainEmbed.addFields({ name: `🖼️ Imagen Opción A`, value: `[Ver enlace](${fotos[0].url})`, inline: true });
        }

        embeds.push(mainEmbed);

        // Si subió más fotos (foto_2, foto_3...), creamos embeds limpios adicionales para cada una con su letra correspondiente (B, C, D...)
        for (let i = 1; i < fotos.length; i++) {
            const letra = String.fromCharCode(65 + i);
            const extraEmbed = new EmbedBuilder()
                .setColor('#3498DB')
                .setTitle(`🖼️ Imagen - Opción ${letra} (${opciones[i] || `Opción ${letra}`})`)
                .setImage(fotos[i].url);
            embeds.push(extraEmbed);
        }

        // Construir botones interactivos mapeados por letras/índices
        const voteButtons = opciones.map((op, i) => {
            const letra = String.fromCharCode(65 + i);
            return new ButtonBuilder()
                .setCustomId(`poll_${rolPermitido.id}_${i}`)
                .setLabel(`Votar ${letra}: ${op.length > 70 ? op.substring(0, 67) + '...' : op}`)
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
            embeds: embeds,
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
                        embeds: [closedEmbed, ...fetchedMessage.embeds.slice(1)],
                        components: disabledRows
                    });
                } catch (err) {
                    console.error('Error al cerrar la encuesta automáticamente:', err);
                }
            }, cierreMs);
        }
    }
};
