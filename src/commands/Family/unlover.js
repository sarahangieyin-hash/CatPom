import { SlashCommandBuilder } from 'discord.js';
import { getUserFamilyData, removeRelation } from '../../utils/families.js';

export default {
    data: new SlashCommandBuilder()
        .setName('unlover')
        .setDescription('Termina tu relación de amante con un usuario o con todos.')
        .addUserOption(option =>
            option
                .setName('amante')
                .setDescription('El amante del que te quieres separar (deja en blanco para terminar con todos)')
                .setRequired(false)
        ),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const userId = interaction.user.id;

        const family = await getUserFamilyData(guildId, userId);

        if (!family.lovers || family.lovers.length === 0) {
            return interaction.reply({
                content: '❌ No tienes ningún amante registrado actualmente.',
                ephemeral: true
            });
        }

        const targetLover = interaction.options.getUser('amante');

        if (targetLover) {
            if (!family.lovers.includes(targetLover.id)) {
                return interaction.reply({
                    content: `❌ ${targetLover} no figura como tu amante.`,
                    ephemeral: true
                });
            }

            await removeRelation(guildId, userId, targetLover.id, 'lover');

            return interaction.reply({
                content: `💔 <@${userId}> y ${targetLover} ya no son amantes.`
            });
        } else {
            // Eliminar todos los amantes
            const antiguosAmantes = [...family.lovers];

            for (const loverId of antiguosAmantes) {
                await removeRelation(guildId, userId, loverId, 'lover');
            }

            const listaAmantes = antiguosAmantes.map(id => `<@${id}>`).join(', ');

            return interaction.reply({
                content: `💔 <@${userId}> ha terminado su relación con todos sus amantes (${listaAmantes}).`
            });
        }
    }
};
