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

        // Normalizar los arrays para evitar undefined/null o estructuras mixtas
        const getIds = (list) => {
            if (!Array.isArray(list)) return [];
            return list.map(item => typeof item === 'object' ? item.id : item).filter(Boolean);
        };

        const spouses = getIds(family.spouses || family.members);
        const parents = getIds(family.parents);
        const children = getIds(family.children);
        const siblings = getIds(family.siblings);
        const lovers = getIds(family.lovers);

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
                { name: '💍 Pareja(s)', value: formatList(spouses), inline: false },
                { name: '👨‍👩‍👦 Padres', value: formatList(parents), inline: true },
                { name: '👶 Hijos', value: formatList(children), inline: true },
                { name: '👫 Hermanos', value: formatList(siblings), inline: false },
                { name: '💋 Amantes', value: formatList(lovers), inline: false }
            )
            .setFooter({ text: `CatPom System • Solicitado por ${interaction.user.username}` })
            .setTimestamp();

        return interaction.reply({ embeds: [embed] });
    }
};
