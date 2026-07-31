import { SlashCommandBuilder } from 'discord.js';
import { addRelation, getUserFamilyData } from '../../utils/families.js';

export default {
    data: new SlashCommandBuilder()
        .setName('parent')
        .setDescription('Añade un padre o madre.')
        .addUserOption(option =>
            option
                .setName('persona')
                .setDescription('Padre o madre')
                .setRequired(true)
        ),

    async execute(interaction) {
        const parent = interaction.options.getUser('persona');

        if (parent.id === interaction.user.id) {
            return interaction.reply({
                content: '❌ No puedes añadirte a ti mismo como tu propio padre/madre.',
                ephemeral: true
            });
        }

        const currentFamily = await getUserFamilyData(interaction.guild.id, interaction.user.id);

        if (currentFamily.parents.includes(parent.id)) {
            return interaction.reply({
                content: '❌ Esa persona ya es tu padre/madre.',
                ephemeral: true
            });
        }

        await addRelation(interaction.guild.id, parent.id, interaction.user.id, 'parent_child');

        await interaction.reply(`👨‍👩‍👧 ${parent} añadido como padre/madre.`);
    }
};
