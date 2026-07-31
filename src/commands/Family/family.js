import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUserFamilyData } from '../../utils/families.js';

export default {
    data: new SlashCommandBuilder()
        .setName('family')
        .setDescription('Muestra el árbol o perfil familiar de un usuario.')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('El usuario del que quieres ver la familia')
                .setRequired(false)
        ),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('usuario') || interaction.user;
        const guildId = interaction.guild.id;

        // Obtener datos familiares con el nuevo sistema atómico
        const family = await getUserFamilyData(guildId, targetUser.id);

        // Formatear menciones
        const formatList = (ids) => {
            if (!ids || ids.length === 0) return 'Ninguno';
            return ids.map(id => `<@${id}>`).join(', ');
        };

        const embed = new EmbedBuilder()
            .setTitle(`📜 Familia de ${targetUser.username}`)
            .setColor('#2b2d31')
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '💍 Pareja(s)', value: formatList(family.spouses), inline: false },
                { name: '👨‍👩‍👦 Padres', value: formatList(family.parents), inline: true },
                { name: '👶 Hijos', value: formatList(family.children), inline: true },
                { name: '👫 Hermanos', value: formatList(family.siblings), inline: false },
                { name: '💋 Amantes', value: formatList(family.lovers), inline: false }
            )
            .setFooter({ text: `CatPom System • Solicitado por ${interaction.user.username}` })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};
