import { SlashCommandBuilder } from 'discord.js';
import { getUserFamilyData, removeRelation } from '../../utils/families.js';

export default {
    data: new SlashCommandBuilder()
        .setName('divorce')
        .setDescription('Divórciate de tu pareja actual.')
        .addUserOption(option =>
            option
                .setName('pareja')
                .setDescription('La pareja de la que te quieres divorciar')
                .setRequired(false)
        ),

    async execute(interaction) {
        const guildId = interaction.guild.id;
        const userId = interaction.user.id;

        const family = await getUserFamilyData(guildId, userId);

        if (!family.spouses || family.spouses.length === 0) {
            return interaction.reply({
                content: '❌ No estás casado/a con nadie actualmente.',
                ephemeral: true
            });
        }

        const targetUser = interaction.options.getUser('pareja');
        let spouseIdToDivorce;

        if (targetUser) {
            if (!family.spouses.includes(targetUser.id)) {
                return interaction.reply({
                    content: `❌ No estás casado/a con ${targetUser}.`,
                    ephemeral: true
                });
            }
            spouseIdToDivorce = targetUser.id;
        } else {
            // Si no especifica usuario y solo tiene 1 pareja, la tomamos por defecto
            if (family.spouses.length === 1) {
                spouseIdToDivorce = family.spouses[0];
            } else {
                return interaction.reply({
                    content: '❌ Tienes múltiples uniones. Por favor, especifica de quién te quieres divorciar usando la opción `pareja`.',
                    ephemeral: true
                });
            }
        }

        // Eliminar la relación de matrimonio (spouse)
        await removeRelation(guildId, userId, spouseIdToDivorce, 'spouse');

        await interaction.reply({
            content: `💔 <@${userId}> y <@${spouseIdToDivorce}> se han divorciado.`
        });
    }
};
