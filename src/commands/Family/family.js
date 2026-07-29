import {
    SlashCommandBuilder,
    EmbedBuilder
} from 'discord.js';

import {
    getFamilyByMember
} from '../../utils/families.js';

export default {

    data: new SlashCommandBuilder()
        .setName('family')
        .setDescription('Muestra la familia de un usuario.')
        .addUserOption(option =>
            option
                .setName('usuario')
                .setDescription('Usuario')
                .setRequired(false)
        ),

    async execute(interaction) {

        const user =
            interaction.options.getUser('usuario') ??
            interaction.user;

        const family = await getFamilyByMember(
            interaction.guild.id,
            user.id
        );

        if (!family) {

            return interaction.reply({
                content: '❌ Ese usuario no pertenece a ninguna familia.',
                ephemeral: true
            });

        }

        const members =
            Array.isArray(family.members)
                ? family.members
                    .map(id => `<@${id}>`)
                    .join('\n')
                : 'Ninguno';

        const children =
            Array.isArray(family.children) &&
            family.children.length > 0
                ? family.children
                    .map(id => `<@${id}>`)
                    .join('\n')
                : 'Ninguno';

        const lovers =
            Array.isArray(family.lovers) &&
            family.lovers.length > 0
                ? family.lovers
                    .map(id => `<@${id}>`)
                    .join('\n')
                : 'Ninguno';

        const embed = new EmbedBuilder()

            .setTitle(`👨‍👩‍👧 Familia de ${user.username}`)

            .addFields(

                {
                    name: '💍 Miembros',
                    value: members,
                    inline: false
                },

                {
                    name: '👶 Hijos',
                    value: children,
                    inline: true
                },

                {
                    name: '🔥 Amantes',
                    value: lovers,
                    inline: true
                }

            );

        await interaction.reply({

            embeds: [embed]

        });

    }

};
