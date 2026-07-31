import { SlashCommandBuilder } from 'discord.js';
import { addRelation, getUserFamilyData } from '../../utils/families.js';

export default {
    data: new SlashCommandBuilder()
        .setName('lover')
        .setDescription('Añade una relación de amante 🔥.')
        .addUserOption(option =>
            option
                .setName('persona')
                .setDescription('Persona amante')
                .setRequired(true)
        ),

    async execute(interaction) {
        const lover = interaction.options.getUser('persona');

        if (lover.id === interaction.user.id) {
            return interaction.reply({
                content: '❌ No puedes añadirte a ti mismo.',
                ephemeral: true
            });
        }

        const family = await getUserFamilyData(interaction.guild.id, interaction.user.id);
        const currentLovers = Array.isArray(family?.lovers) ? family.lovers : [];

        if (currentLovers.includes(lover.id)) {
            return interaction.reply({
                content: '❌ Esa persona ya está registrada como tu amante.',
                ephemeral: true
            });
        }

        await addRelation(interaction.guild.id, interaction.user.id, lover.id, 'lover');

        await interaction.reply(`🔥 ${lover} ha sido añadido como amante.`);
    }
};
