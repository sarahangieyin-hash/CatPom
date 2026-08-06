import { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    PermissionFlagsBits 
} from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('encuesta')
        .setDescription('Crea una encuesta con restricción de rol, opciones y tiempo de cierre')
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
        .addIntegerOption(o =>
            o.setName('horas')
                .setDescription('Tiempo en horas para que la encuesta cierre sola (Opcional)')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction, client) {
        await interaction.deferReply({ flags: 64 });

        const pregunta = interaction.options.getString('pregunta');
        const rolPermitido = interaction.options.getRole('rol_permitido');
        const opcionesTexto = interaction.options.getString('opciones');
        const horas = interaction.options.getInteger('horas');

        const opciones = opcionesTexto.split(',').map(o => o.trim()).filter(Boolean);

        if (opciones.length < 2 || opciones.length > 5) {
            return interaction.editReply('❌ Debes proporcionar entre **2 y 5 opciones** separadas por comas.');
        }

        let footerText = `Encuesta creada por ${interaction.user.tag}`;
        let cierreTimestamp = null;

        if (horas && horas > 0) {
            cierreTimestamp = Date.now() + (horas * 60 * 60 * 1000);
            footerText += ` • Cierra el: <t:${Math.floor(cierreTimestamp / 1000)}:f>`;
        }

        const embed = new EmbedBuilder()
            .setTitle('📊 Nueva Encuesta')
            .setColor('#3498DB')
            .setDescription(`**${pregunta}**\n\n🔒 **Rol autorizado:** ${rolPermitido}\n\n` + opciones.map((op, i) => `🔹 **Opción ${i + 1}:** ${op} (0 votos)`).join('\n'))
            .setFooter({ text: footerText })
            .setTimestamp();

        const buttons = opciones.map((op, i) => {
            return new ButtonBuilder()
                .setCustomId(`poll_${rolPermitido.id}_${i}`)
                .setLabel(op.length > 80 ? op.substring(0, 77) + '...' : op)
                .setStyle(ButtonStyle.Primary);
        });

        const row = new ActionRowBuilder().addComponents(buttons);

        const message = await interaction.channel.send({
            embeds: [embed],
            components: [row]
        });

        await interaction.editReply(`✅ Encuesta creada con éxito.`);

        // Si se especificó un tiempo, programar el cierre automático
        if (cierreTimestamp) {
            const timeLeft = cierreTimestamp - Date.now();
            setTimeout(async () => {
                try {
                    const fetchedMessage = await message.channel.messages.fetch(message.id).catch(() => null);
                    if (!fetchedMessage) return;

                    const currentEmbed = fetchedMessage.embeds[0];
                    if (!currentEmbed) return;

                    // Desactivar botones
                    const disabledRows = fetchedMessage.components.map(row => {
                        const newRow = ActionRowBuilder.from(row);
                        newRow.components.forEach(btn => btn.setDisabled(true));
                        return newRow;
                    });

                    // Calcular ganador o resumen
                    const closedEmbed = EmbedBuilder.from(currentEmbed)
                        .setTitle('📊 Encuesta Finalizada (Resultados)')
                        .setColor('#E74C3C');

                    await fetchedMessage.edit({
                        embeds: [closedEmbed],
                        components: disabledRows
                    });
                } catch (err) {
                    console.error('Error al cerrar la encuesta automáticamente:', err);
                }
            }, timeLeft);
        }
    }
};
