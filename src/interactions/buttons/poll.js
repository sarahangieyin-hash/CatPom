import { MessageFlags, EmbedBuilder, ActionRowBuilder } from 'discord.js';

const pollVotes = new Map();

export default {
    customId: 'poll',

    async execute(interaction, client, args) {
        const message = interaction.message;
        const userId = interaction.user.id;

        if (!pollVotes.has(message.id)) {
            pollVotes.set(message.id, new Map());
        }
        const userVotes = pollVotes.get(message.id);

        // CASO 1: Revisar Votos
        if (args[0] === 'check') {
            if (userVotes.size === 0) {
                return interaction.reply({
                    content: '📋 Nadie ha votado en esta encuesta todavía.',
                    flags: MessageFlags.Ephemeral
                });
            }

            const embed = message.embeds[0];
            const optionTexts = [];
            embed.description.split('\n').forEach(line => {
                const match = line.match(/🔹 \*\*Opción \d+:\*\* (.+?) \(\d+ votos\)/);
                if (match) optionTexts.push(match[1]);
            });

            let report = '📋 **Detalle de votos de la encuesta:**\n\n';
            for (const [uId, data] of userVotes.entries()) {
                const optName = optionTexts[data.optionIndex] || `Opción ${data.optionIndex + 1}`;
                report += `• <@${uId}> votó por: **${optName}**\n`;
            }

            return interaction.reply({
                content: report,
                flags: MessageFlags.Ephemeral
            });
        }

        // CASO 2: Cerrar Encuesta
        if (args[0] === 'close') {
            const embed = message.embeds[0];
            const footer = embed?.footer?.text || '';
            const isCreator = footer.includes(userId);
            const hasPermissions = interaction.member.permissions.has('ManageMessages');

            if (!isCreator && !hasPermissions) {
                return interaction.reply({
                    content: '❌ Solo el creador de la encuesta o un moderador pueden cerrarla.',
                    flags: MessageFlags.Ephemeral
                });
            }

            const disabledRows = message.components.map(row => {
                const newRow = ActionRowBuilder.from(row);
                newRow.components.forEach(btn => btn.setDisabled(true));
                return newRow;
            });

            const closedEmbed = EmbedBuilder.from(embed)
                .setTitle('📊 Encuesta Finalizada (Cerrada Manualmente)')
                .setColor('#E74C3C');

            await message.edit({
                embeds: [closedEmbed],
                components: disabledRows
            });

            return interaction.reply({
                content: '🔒 Has cerrado la encuesta correctamente.',
                flags: MessageFlags.Ephemeral
            });
        }

        // CASO 3: Votación normal
        const roleId = args[0];
        const optionIndex = parseInt(args[1]);

        if (!interaction.member.roles.cache.has(roleId)) {
            return interaction.reply({
                content: `❌ Solo los miembros con el rol <@&${roleId}> pueden votar en esta encuesta.`,
                flags: MessageFlags.Ephemeral
            });
        }

        const previousVoteData = userVotes.get(userId);

        if (previousVoteData && previousVoteData.optionIndex === optionIndex) {
            return interaction.reply({
                content: `⚠️ Ya habías votado por esta opción.`,
                flags: MessageFlags.Ephemeral
            });
        }

        userVotes.set(userId, { optionIndex });

        const embed = message.embeds[0];
        if (!embed) return;

        const lines = embed.description.split('\n');
        
        let updatedDescription = lines.map(line => {
            for (let i = 0; i < 5; i++) {
                if (line.includes(`🔹 **Opción ${i + 1}:**`)) {
                    let count = 0;
                    for (const vote of userVotes.values()) {
                        if (vote.optionIndex === i) count++;
                    }
                    return line.replace(/\(\d+\s+votos?\)/, `(${count} votos)`);
                }
            }
            return line;
        }).join('\n');

        const updatedEmbed = EmbedBuilder.from(embed)
            .setDescription(updatedDescription);

        await message.edit({ embeds: [updatedEmbed] });

        const actionText = previousVoteData !== undefined ? '¡Has cambiado tu voto con éxito!' : '¡Tu voto ha sido registrado!';
        await interaction.reply({
            content: `✅ ${actionText} (Opción ${optionIndex + 1})`,
            flags: MessageFlags.Ephemeral
        });
    }
};
