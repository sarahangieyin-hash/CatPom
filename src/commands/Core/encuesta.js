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
        .setDescription('Crea una encuesta restringida a un rol específico')
        .addStringOption(o =>
            o.setName('pregunta')
                .setDescription('La pregunta de la encuesta')
                .setRequired(true)
        )
        .addRoleOption(o =>
            o.setName('rol_permitido')
                .setDescription('El único rol que podrá votar en esta encuesta')
                .setRequired(true)
        )
        .addStringOption(o =>
            o.setName('opciones')
                .setDescription('Opciones separadas por comas (Ej: Sí, No, Tal vez)')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        await interaction.deferReply({ flags: 64 });

        const pregunta = interaction.options.getString('pregunta');
        const rolPermitido = interaction.options.getRole('rol_permitido');
        const opcionesTexto = interaction.options.getString('opciones');

        const opciones = opcionesTexto.split(',').map(o => o.trim()).filter(Boolean);

        if (opciones.length < 2 || opciones.length > 5) {
            return interaction.editReply('❌ Debes proporcionar entre **2 y 5 opciones** separadas por comas.');
        }

        const embed = new EmbedBuilder()
            .setTitle('📊 Nueva Encuesta')
            .setColor('#3498DB')
            .setDescription(`**${pregunta}**\n\n🔒 **Rol autorizado:** ${rolPermitido}\n\n` + opciones.map((op, i) => `🔹 **Opción ${i + 1}:** ${op} (0 votos)`).join('\n'))
            .setFooter({ text: `Encuesta creada por ${interaction.user.tag}` })
            .setTimestamp();

        // Creamos un ID único guardando el rol permitido y las opciones en el customId
        const buttons = opciones.map((op, i) => {
            return new ButtonBuilder()
                .setCustomId(`poll_${rolPermitido.id}_${i}`)
                .setLabel(op.length > 80 ? op.substring(0, 77) + '...' : op)
                .setStyle(ButtonStyle.Primary);
        });

        const row = new ActionRowBuilder().addComponents(buttons);

        // Enviamos la encuesta al canal público
        const message = await interaction.channel.send({
            embeds: [embed],
            components: [row]
        });

        await interaction.editReply(`✅ Encuesta creada con éxito en este canal.`);
    }
};
