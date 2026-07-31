import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { getUserFamilyData } from '../../utils/families.js';

export default {
    data: new SlashCommandBuilder()
        .setName('family')
        .setDescription('Muestra la familia de un usuario.')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('Usuario a consultar')
                .setRequired(false)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser('usuario') ?? interaction.user;
        const family = await getUserFamilyData(interaction.guild.id, user.id);

        const spouses = family.spouses.map(id => `<@${id}>`);
        const children = family.children.map(id => `<@${id}>`);
        const parents = family.parents.map(id => `<@${id}>`);
        const siblings = family.siblings.map(id => `<@${id}>`);
        const lovers = family.lovers.map(id => `<@${id}>`);

        const embed = new EmbedBuilder()
            .setTitle(`👨‍👩‍👧 Familia de ${user.username}`)
            .setColor(0x8b5a2b)
            .addFields(
                { name: '💍 Unión', value: spouses.length ? spouses.join('\n') : 'Ninguna' },
                { name: ' Hijos', value: children.length ? children.join('\n') : 'Ninguno' },
                { name: ' Padres', value: parents.length ? parents.join('\n') : 'Ninguno' },
                { name: ' Hermanos', value: siblings.length ? siblings.join('\n') : 'Ninguno' },
                { name: '🔥 Amantes', value: lovers.length ? lovers.join('\n') : 'Ninguno' }
            );

        await interaction.reply({ embeds: [embed] });
    }
};
