import { SlashCommandBuilder } from 'discord.js';
import { getUserFamilyData, removeRelation } from '../../utils/families.js';

export default {
    data: new SlashCommandBuilder()
        .setName('renunciar')
        .setDescription('Renuncia a uno o a todos tus hijos.')
        .addUserOption(option =>
            option
                .setName('hijo')
                .setDescription('El hijo al que deseas renunciar (deja en blanco para renunciar a todos)')
                .setRequired(false)
        ),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const userId = interaction.user.id;

        const family = await getUserFamilyData(guildId, userId);

        if (!family.children || family.children.length === 0) {
            return interaction.reply({
                content: '❌ No tienes ningún hijo registrado a quien renunciar.',
                ephemeral: true
            });
        }

        const targetChild = interaction.options.getUser('hijo');

        if (targetChild) {
            // Renunciar a un hijo en específico
            if (!family.children.includes(targetChild.id)) {
                return interaction.reply({
                    content: `❌ ${targetChild} no figura como tu hijo/a.`,
                    ephemeral: true
                });
            }

            await removeRelation(guildId, userId, targetChild.id, 'parent_child');

            return interaction.reply({
                content: `🚪 <@${userId}> ha renunciado a la relación filial con ${targetChild}.`
            });
        } else {
            // Renunciar a TODOS los hijos
            const hijosAntiguos = [...family.children];

            for (const childId of hijosAntiguos) {
                await removeRelation(guildId, userId, childId, 'parent_child');
            }

            const listaHijos = hijosAntiguos.map(id => `<@${id}>`).join(', ');

            return interaction.reply({
                content: `🚪 <@${userId}> ha renunciado a todos sus hijos (${listaHijos}).`
            });
        }
    }
};
